from typing import Dict, Any

def compute_tier(scores: Dict[str, float]) -> Dict[str, Any]:
    """
    Input: scores = {
        "contentScore": 0-100,
        "designScore": 0-100,
        "projectsScore": 0-100,
        "overallScore": 0-100
    }
    Output: {
        "letter": "A"|"B"|"C"|"F",
        "level": 1-10,
        "code": "A7" etc.
    }
    
    30-Layer Matrix:
    - A-Tier (A1-A10): Great content + Great design + Strong projects
    - B-Tier (B1-B10): Good content + Poor design + Strong projects  
    - C-Tier (C1-C10): Strong projects with real-world proof
    """
    content = scores.get("contentScore", 0)
    design = scores.get("designScore", 0)
    projects = scores.get("projectsScore", 0)
    overall = scores.get("overallScore", 0)

    # Determine tier letter based on combination of scores
    if content >= 75 and design >= 75 and projects >= 75:
        letter = "A"
    elif content >= 60 and projects >= 75:
        # B-tier: Good content but may have poor design, but strong projects
        letter = "B"
    elif projects >= 70:
        # C-tier: Strong projects and real-world proof of skills
        letter = "C"
    else:
        # F-tier: Does not meet minimum requirements
        letter = "F"
    
    # Level 1-10 based on overall score
    # 0-10 -> 1, 11-20 -> 2, ..., 91-100 -> 10
    level = max(1, min(10, round(overall / 10)))

    code = f"{letter}{level}"

    return {"letter": letter, "level": level, "code": code}