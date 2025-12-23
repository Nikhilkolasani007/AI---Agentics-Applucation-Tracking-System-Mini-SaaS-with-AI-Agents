# evaluators.py
import io
import logging
from typing import Dict, Any, Optional, Tuple

from pypdf import PdfReader

from ai_client import generate_text
from ingestion.resume import analyze_resume_design, extract_resume_text
from ingestion.github import analyze_github_profile
from ingestion.linkedin import analyze_linkedin_profile
from ingestion.portfolio import analyze_portfolio
from tiering import compute_tier

logger = logging.getLogger(__name__)


def pdf_bytes_to_text(pdf_bytes: bytes) -> str:
    """Very basic PDF → text; good enough to start."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    texts = []
    for page in reader.pages:
        try:
            texts.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n\n".join(texts)


def build_evaluation_prompt(
    resume_text: str,
    links: Dict[str, Optional[str]],
    job_id: str,
    job_description: Optional[str] = None,
    github_data: Optional[Dict] = None,
    linkedin_data: Optional[Dict] = None,
    portfolio_data: Optional[Dict] = None,
    design_data: Optional[Dict] = None,
) -> str:
    """Create a structured instruction for the model."""
    linkedin = links.get("linkedin")
    github = links.get("github")
    portfolio = links.get("portfolio")

    # Build additional context from ingestion
    additional_context = ""
    
    if design_data:
        additional_context += f"\n\nRESUME DESIGN ANALYSIS:\n{design_data}"
    
    if github_data:
        additional_context += f"\n\nGITHUB PROFILE DATA:\n{github_data}"
    
    if linkedin_data:
        additional_context += f"\n\nLINKEDIN PROFILE DATA:\n{linkedin_data}"
    
    if portfolio_data:
        additional_context += f"\n\nPORTFOLIO WEBSITE DATA:\n{portfolio_data}"

    return f"""
You are an AI talent evaluator for a hiring platform.

You will receive:
- A candidate resume text
- Optional links: LinkedIn, GitHub, portfolio
- A job ID and optional job description
- Additional analyzed data from these sources

Your job is to:
1. Evaluate RESUME CONTENT QUALITY:
   - Relevance to the (implied) role
   - Clarity, specificity, real impact
   - Presence of skills and experience

2. Evaluate RESUME DESIGN:
   - Structure, sections, readability
   - Consistent fonts, spacing, bullet usage
   - Overall first impression as a recruiter (0 = terrible, 100 = world-class)

3. Evaluate PROJECTS & EXPERIENCE (Weighted for Seniority):
   - If the candidate has strong Work Experience (Senior/Lead roles), weight that HIGHER than GitHub/Portfolio.
   - Do NOT penalize experienced professionals for missing GitHub links if they have described complex internal projects.
   - For Juniors/Interns: Focus on GitHub/Portfolio proof.
   - For Professionals: Focus on "Shipped Products", "Scale", "Team Leadership", and "Business Impact" described in the resume.

4. **CRITICAL: JOB DESCRIPTION MATCH BOOST**:
   - if the candidate's skills and experience match the provided JOB DESCRIPTION, you MUST BOOST the score significantly.
   - A strong match with the Job Description is the most important factor.
   - If they have the exact skills required, the Overall Score should be very high (90+), even if the design is simple or GitHub is missing.
   - PRIORITY 1: Does this person fit the Job Description? If YES -> HIGH SCORE.

5. Compute an OVERALL SCORE (0–100):
   - A "Professional" with strong experience but no external links should still get a HIGH score (80+).
   - Only penalize for lack of links if the resume content itself is weak or vague.

Return ONLY valid JSON with this shape (no extra text):

{{
  "contentScore": <0-100 integer>,
  "designScore": <0-100 integer>,
  "projectsScore": <0-100 integer>,
  "overallScore": <0-100 integer>,
  "reasoningSummary": "<2-4 sentence explanation>"
}}

---------------------
JOB ID: {job_id}
JOB DESCRIPTION (may be empty):
{job_description or "N/A"}
---------------------
LINKS:
LinkedIn: {linkedin or "N/A"}
GitHub: {github or "N/A"}
Portfolio: {portfolio or "N/A"}
---------------------
{additional_context}
---------------------
RESUME TEXT:
{resume_text[:12000]}  # truncated for context limit
"""
    

def evaluate_candidate(
    resume_bytes: Optional[bytes],
    links: Dict[str, Optional[str]],
    job_id: str,
    job_description: Optional[str] = None,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Main evaluation entry: returns (scores dict, tier dict).
    
    This function now:
    1. Analyzes resume design
    2. Fetches GitHub profile data
    3. Scrapes LinkedIn (best effort)
    4. Checks portfolio website
    5. Combines all data for AI evaluation
    6. Computes tier based on scores
    """
    # Extract resume text and design
    if resume_bytes:
        resume_text = extract_resume_text(resume_bytes)
        design_data = analyze_resume_design(resume_bytes)
        
        # Check if text extraction failed (empty or too short)
        if len(resume_text.strip()) < 50:
            logger.warning("Resume text is empty or too short. Likely an image-based PDF.")
            return {
                "contentScore": 0,
                "designScore": 0,
                "projectsScore": 0,
                "overallScore": 0,
                "reasoningSummary": "CRITICAL ERROR: Could not read text from this resume. It might be an image-only PDF. Please try uploading a text-based PDF or Word document."
            }, {"code": "ERR", "letter": "F", "color": "red"}
    else:
        resume_text = "No resume file provided."
        design_data = {"design_score": 0}

    # Analyze external sources
    github_data = None
    linkedin_data = None
    portfolio_data = None
    
    if links.get("github"):
        # Extract username from GitHub URL
        github_url = links["github"]
        if "github.com/" in github_url:
            username = github_url.rstrip('/').split('/')[-1]
            github_data = analyze_github_profile(username)
            logger.info(f"GitHub analysis for {username}: {github_data}")
    
    if links.get("linkedin"):
        linkedin_data = analyze_linkedin_profile(links["linkedin"])
        logger.info(f"LinkedIn analysis: {linkedin_data}")
    
    if links.get("portfolio"):
        portfolio_data = analyze_portfolio(links["portfolio"])
        logger.info(f"Portfolio analysis: {portfolio_data}")

    # Build comprehensive evaluation prompt
    prompt = build_evaluation_prompt(
        resume_text, 
        links, 
        job_id, 
        job_description,
        github_data=github_data,
        linkedin_data=linkedin_data,
        portfolio_data=portfolio_data,
        design_data=design_data
    )

    raw = generate_text(prompt)

    # Clean up markdown code blocks if present
    cleaned_raw = raw.replace("```json", "").replace("```", "").strip()

    import json
    try:
        scores = json.loads(cleaned_raw)
    except json.JSONDecodeError:
        # If model spills some text, try to extract JSON, or fallback
        # For now, do a naive fallback
        logger.warning("Failed to parse model output, using fallback scores")
        scores = {
            "contentScore": 0,
            "designScore": 0,
            "projectsScore": 0,
            "overallScore": 0,
            "reasoningSummary": "Failed to parse model output."
        }

    # Ensure keys exist and are numbers
    for key in ["contentScore", "designScore", "projectsScore", "overallScore"]:
        scores[key] = int(scores.get(key, 0))

    # Compute tier using the 30-layer matrix
    tier = compute_tier(scores)
    
    return scores, tier
