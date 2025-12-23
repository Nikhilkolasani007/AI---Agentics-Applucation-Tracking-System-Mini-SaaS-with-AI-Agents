"""
FastAPI application for AI-powered talent evaluation platform.

Endpoints:
- POST /candidates - Submit a new candidate with resume and optional links
- GET /candidates/{id} - Retrieve evaluation results for a candidate
- GET /candidates/{id}/report - Generate HTML report for a candidate
"""
import logging
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse
from bson import ObjectId
from pydantic import BaseModel

from db import applications, candidates, fs, evaluations
from evaluators import evaluate_candidate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Talent Evaluation Platform",
    description="AI-first talent evaluation replacing keyword-based ATS systems",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CandidateResponse(BaseModel):
    """Response model for candidate submission"""
    candidate_id: str
    status: str
    message: str


class EvaluationResponse(BaseModel):
    """Response model for evaluation results"""
    candidate_id: str
    scores: dict
    tier: dict
    status: str
    evaluated_at: Optional[str] = None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "message": "AI Talent Evaluation Platform API"}


@app.get("/stats")
async def get_stats():
    """Get dashboard statistics with detailed lists"""
    try:
        total = applications.count_documents({})
        
        # Selected = Manually Accepted OR (Not Manually Rejected AND Tier A/B)
        selected_query = {
            "$or": [
                {"status": "accepted"},
                {
                    "$and": [
                        {"status": {"$ne": "rejected"}},
                        {"status": {"$ne": "accepted"}}, # Avoid double counting if mixed
                        {"tier.letter": {"$in": ["A", "B"]}}
                    ]
                }
            ]
        }
        selected = applications.count_documents(selected_query)
        
        # Rejected = Manually Rejected OR (Not Manually Accepted AND Tier F)
        rejected_query = {
            "$or": [
                {"status": "rejected"},
                {
                    "$and": [
                        {"status": {"$ne": "accepted"}},
                        {"status": {"$ne": "rejected"}},
                        {"tier.letter": "F"}
                    ]
                }
            ]
        }
        rejected = applications.count_documents(rejected_query)
        
        # Count unique job IDs
        jobs_cursor = applications.distinct("jobId")
        unique_jobs = len(jobs_cursor)
        
        # Get lists for display - using same hybrid logic for filtering
        selected_list = []
        for app in applications.find(selected_query).limit(10).sort("lastEvaluatedAt", -1):
            selected_list.append({
                "id": str(app["_id"]),
                "job_id": app.get("jobId", "N/A"),
                "tier": app.get("tier", {}).get("code", "N/A"),
                "score": app.get("scores", {}).get("overallScore", 0),
                "date": app.get("lastEvaluatedAt").isoformat() if app.get("lastEvaluatedAt") else None,
                "status": app.get("status", "pending")
            })
        
        rejected_list = []
        for app in applications.find(rejected_query).limit(10).sort("lastEvaluatedAt", -1):
            rejected_list.append({
                "id": str(app["_id"]),
                "job_id": app.get("jobId", "N/A"),
                "tier": app.get("tier", {}).get("code", "F"),
                "score": app.get("scores", {}).get("overallScore", 0),
                "date": app.get("lastEvaluatedAt").isoformat() if app.get("lastEvaluatedAt") else None,
                "status": app.get("status", "pending")
            })
        
        # Get per-job stats - Aggregation needs to mimic this hybrid logic
        pipeline = [
            {
                "$group": {
                    "_id": "$jobId",
                    "total": {"$sum": 1},
                    "selected": {
                        "$sum": {
                            "$cond": [
                                {"$or": [
                                    {"$eq": ["$status", "accepted"]},
                                    {"$and": [
                                        {"$ne": ["$status", "rejected"]},
                                        {"$ne": ["$status", "accepted"]},
                                        {"$in": ["$tier.letter", ["A", "B"]]}
                                    ]}
                                ]},
                                1,
                                0
                            ]
                        }
                    },
                    "rejected": {
                        "$sum": {
                            "$cond": [
                                {"$or": [
                                    {"$eq": ["$status", "rejected"]},
                                    {"$and": [
                                        {"$ne": ["$status", "accepted"]},
                                        {"$ne": ["$status", "rejected"]},
                                        {"$eq": ["$tier.letter", "F"]}
                                    ]}
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                "$project": {
                    "job_id": {"$toString": "$_id"},
                    "total": 1,
                    "selected": 1,
                    "rejected": 1
                }
            }
        ]
        job_stats_cursor = applications.aggregate(pipeline)
        job_stats_list = list(job_stats_cursor)
        
        return {
            "jobs_posted": unique_jobs,
            "applications_received": total,
            "applications_selected": selected,
            "applications_rejected": rejected,
            "selected_list": selected_list,
            "rejected_list": rejected_list,
            "job_stats": job_stats_list
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/candidates_list")
async def get_candidates_list():
    """Get list of all candidates with summary info"""
    try:
        cursor = applications.find({}).sort("createdAt", -1)
        candidates_list = []
        for app in cursor:
            # Backward compatibility for personal info
            p_info = app.get("personalInfo", {})
            first_name = p_info.get('firstName') or app.get('firstName') or ''
            last_name = p_info.get('lastName') or app.get('lastName') or ''
            full_name = f"{first_name} {last_name}".strip() or app.get('name') or "Unknown Candidate"
            
            # Use publicFormId if available for display, otherwise hex jobId
            job_id_raw = app.get("jobId", "N/A")
            display_job_id = str(job_id_raw)
            job_title = "N/A"
            
            # Try to fetch job title and publicFormId
            if isinstance(job_id_raw, ObjectId):
                job_doc = jobs.find_one({"_id": job_id_raw})
                if job_doc:
                    job_title = job_doc.get("jobTitle", "N/A")
                    display_job_id = job_doc.get("publicFormId", str(job_id_raw))

            candidates_list.append({
                "candidate_id": str(app["_id"]),
                "name": full_name,
                "job_id": display_job_id,
                "job_title": job_title,
                "status": app.get("status", "pending"),
                "scores": app.get("scores", {}),
                "tier": app.get("tier", {}),
                "links": app.get("links", {}),
                "filename": app.get("resume", {}).get("filename", "N/A"),
                "created_at": app.get("createdAt").isoformat() if app.get("createdAt") else None
            })
        return candidates_list
    except Exception as e:
        logger.error(f"Error getting candidate list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/candidates", response_model=CandidateResponse)
async def submit_candidate(
    resume: UploadFile = File(...),
    job_id: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    github: Optional[str] = Form(None),
    portfolio: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None)
):
    """
    Submit a new candidate for evaluation.
    """
    try:
        # Read resume bytes
        resume_bytes = await resume.read()
        
        # Store resume in GridFS
        file_id = fs.put(
            resume_bytes,
            filename=resume.filename,
            content_type=resume.content_type
        )
        
        # Create application document
        application_doc = {
            "jobId": job_id,
            "personalInfo": {
                "firstName": first_name,
                "lastName": last_name,
                "email": email,
                "phone": phone
            },
            "resume": {
                "fileId": file_id,
                "filename": resume.filename,
                "contentType": resume.content_type
            },
            "links": {
                "linkedin": linkedin,
                "github": github,
                "portfolio": portfolio
            },
            "jobDescription": job_description,
            "status": "pending",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = applications.insert_one(application_doc)
        app_id = result.inserted_id
        
        logger.info(f"Created new application {app_id} for job {job_id}")
        
        return CandidateResponse(
            candidate_id=str(app_id),
            status="pending",
            message="Candidate submitted successfully. Evaluation pending."
        )
        
    except Exception as e:
        logger.error(f"Error submitting candidate: {e}")
        raise HTTPException(status_code=500, detail=str(e))



class CandidateStatusUpdate(BaseModel):
    """Request model for updating candidate status"""
    status: str


@app.put("/candidates/{candidate_id}/status", response_model=CandidateResponse)
async def update_candidate_status(candidate_id: str, status_update: CandidateStatusUpdate):
    """
    Update the status of a candidate (e.g., 'accepted', 'rejected').
    """
    try:
        result = applications.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": {"status": status_update.status, "updatedAt": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        return CandidateResponse(
            candidate_id=candidate_id,
            status=status_update.status,
            message=f"Candidate status updated to {status_update.status}"
        )
    except Exception as e:
        logger.error(f"Error updating candidate status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class EvaluationResponse(BaseModel):
    """Response model for evaluation results"""
    candidate_id: str
    personal_info: Optional[dict] = None
    scores: dict
    tier: dict
    status: str
    evaluated_at: Optional[str] = None


@app.get("/candidates/{candidate_id}", response_model=EvaluationResponse)
async def get_candidate_evaluation(candidate_id: str):
    """
    Retrieve evaluation results for a candidate.
    
    - **candidate_id**: The ID of the candidate/application
    """
    try:
        app = applications.find_one({"_id": ObjectId(candidate_id)})
        
        if not app:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Backward compatibility for personal info
        p_info = app.get("personalInfo")
        if not p_info:
            p_info = {
                "firstName": app.get("firstName", ""),
                "lastName": app.get("lastName", ""),
                "email": app.get("email", "")
            }

        response = EvaluationResponse(
            candidate_id=candidate_id,
            personal_info=p_info,
            scores=app.get("scores", {}),
            tier=app.get("tier", {}),
            status=app.get("status", "unknown"),
            evaluated_at=app.get("lastEvaluatedAt").isoformat() if app.get("lastEvaluatedAt") else None
        )
        
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving candidate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/candidates/{candidate_id}/report", response_class=HTMLResponse)
async def get_candidate_report(candidate_id: str):
    """
    Generate an HTML report for a candidate.
    
    - **candidate_id**: The ID of the candidate/application
    """
    try:
        app = applications.find_one({"_id": ObjectId(candidate_id)})
        
        if not app:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        scores = app.get("scores", {})
        tier = app.get("tier", {})
        links = app.get("links", {})
        
        # Generate HTML report
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Candidate Evaluation Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .header {{ background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }}
                .tier {{ font-size: 48px; font-weight: bold; margin: 20px 0; }}
                .tier.A {{ color: #27ae60; }}
                .tier.B {{ color: #f39c12; }}
                .tier.C {{ color: #e67e22; }}
                .tier.F {{ color: #c0392b; }}
                .scores {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }}
                .score-card {{ background: #ecf0f1; padding: 15px; border-radius: 5px; }}
                .score-value {{ font-size: 32px; font-weight: bold; color: #2c3e50; }}
                .links {{ margin: 20px 0; }}
                .link {{ display: block; margin: 5px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Candidate Evaluation Report</h1>
                <p>Application ID: {candidate_id}</p>
            </div>
            
            <div class="tier {tier.get('letter', 'F')}">
                Tier: {tier.get('code', 'N/A')}
            </div>
            
            <div class="scores">
                <div class="score-card">
                    <h3>Content Score</h3>
                    <div class="score-value">{scores.get('contentScore', 0)}/100</div>
                </div>
                <div class="score-card">
                    <h3>Design Score</h3>
                    <div class="score-value">{scores.get('designScore', 0)}/100</div>
                </div>
                <div class="score-card">
                    <h3>Projects Score</h3>
                    <div class="score-value">{scores.get('projectsScore', 0)}/100</div>
                </div>
                <div class="score-card">
                    <h3>Overall Score</h3>
                    <div class="score-value">{scores.get('overallScore', 0)}/100</div>
                </div>
            </div>
            
            <div>
                <h3>AI Reasoning</h3>
                <p>{scores.get('reasoningSummary', 'N/A')}</p>
            </div>
            
            <div class="links">
                <h3>Candidate Links</h3>
                {f'<a class="link" href="{links.get("linkedin")}" target="_blank">LinkedIn Profile</a>' if links.get("linkedin") else ''}
                {f'<a class="link" href="{links.get("github")}" target="_blank">GitHub Profile</a>' if links.get("github") else ''}
                {f'<a class="link" href="{links.get("portfolio")}" target="_blank">Portfolio Website</a>' if links.get("portfolio") else ''}
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc;">
                <p style="color: #7f8c8d; font-size: 12px;">
                    Generated by AI Talent Evaluation Platform | Evaluated: {app.get('lastEvaluatedAt', 'Not yet evaluated')}
                </p>
            </div>
        </body>
        </html>
        """
        
        return HTMLResponse(content=html_content)
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/{job_id}")
async def get_job_analytics(job_id: str):
    """Get candidates for a specific job grouped by tier"""
    try:
        # Convert to ObjectId if possible
        try:
            actual_job_id = ObjectId(job_id)
        except:
            actual_job_id = job_id

        # Pipeline to group candidates by tier for the specific job
        pipeline = [
            {"$match": {"jobId": actual_job_id}},
            {"$sort": {"scores.overallScore": -1}},  # Sort by score descending
            {"$group": {
                "_id": "$tier.letter",
                "candidates": {
                    "$push": {
                        "id": {"$toString": "$_id"},
                        "name": {"$concat": [{"$ifNull": ["$personalInfo.firstName", ""]}, " ", {"$ifNull": ["$personalInfo.lastName", ""]}]},
                        "tier": "$tier.code",
                        "score": "$scores.overallScore",
                        "status": "$status",
                        "resume_name": "$resume.filename",
                        "date": "$createdAt"
                    }
                }
            }}
        ]
        
        results = list(applications.aggregate(pipeline))
        
        # Initialize response structure
        response = {
            "job_id": job_id,
            "tier_a": [],
            "tier_b": [],
            "tier_c": [],
            "tier_f": [],
            "tier_pending": []
        }
        
        # Map aggregation results to response
        for group in results:
            tier_letter = group["_id"]
            if tier_letter == "A":
                response["tier_a"] = group["candidates"]
            elif tier_letter == "B":
                response["tier_b"] = group["candidates"]
            elif tier_letter == "C":
                response["tier_c"] = group["candidates"]
            elif tier_letter == "F":
                response["tier_f"] = group["candidates"]
            else:
                # This covers None/null or any other value
                response["tier_pending"].extend(group["candidates"])
                
        return response
        
    except Exception as e:
        logger.error(f"Error getting analytics for job {job_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/candidates/{candidate_id}/resume")
async def get_candidate_resume(candidate_id: str):
    """Stream the candidate's resume PDF"""
    try:
        app = applications.find_one({"_id": ObjectId(candidate_id)})
        if not app or "resume" not in app:
            raise HTTPException(status_code=404, detail="Resume not found")
            
        file_id = app["resume"]["fileId"]
        grid_out = fs.get(file_id)
        
        # Generator to stream file content
        def iterfile():
            yield from grid_out
            
        return StreamingResponse(
            iterfile(),
            media_type=app["resume"].get("contentType", "application/pdf"),
            headers={"Content-Disposition": f"inline; filename={app['resume'].get('filename', 'resume.pdf')}"}
        )
    except Exception as e:
        logger.error(f"Error retrieving resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
