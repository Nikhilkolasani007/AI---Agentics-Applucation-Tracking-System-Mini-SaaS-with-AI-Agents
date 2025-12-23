# MongoDB + GridFS Helper

from datetime import datetime
from typing import List, Dict, Any, Optional

from pymongo import MongoClient
import gridfs
from bson import ObjectId

from config import MONGODB_URI

client = MongoClient(MONGODB_URI)
db = client.get_default_database()
applications = db["applications"]
fs = gridfs.GridFS(db)
candidates = db["candidates"]
evaluations = db["evaluations"]
jobs = db["jobs"]

def get_pending_applications(limit: int = 10) -> List[Dict[str,Any]]:
    """Fetch Applications that still need AI Evaluation."""
    cursor = applications.find(
        {
            "status":"pending"
        }
    ).sort("createdAt", 1).limit(limit)

    return list(cursor)

def get_resume_bytes(file_id) -> Optional[bytes]:
    """Read Resume From GridFS; Return raw Bytes."""
    if not file_id:
        return None
    grid_out = fs.get(file_id)

    return grid_out.read()

def update_application_evaluation(
        app_id,
        scores: Dict[str, float],
        tier: Dict[str,Any]
    ):
    """Write AI Evaluations Results back to Mongo and store detailed evaluation."""
    now = datetime.utcnow()
    # Update the application status
    applications.update_one(
        {
            "_id": app_id
        },
        {
            "$set": {
                "scores": scores,
                "tier": tier,
                "status": "evaluated",
                "lastEvaluatedAt": now,
                "updatedAt": now
            }
        }
    )
    # Also insert a record into the evaluations collection for historical tracking
    evaluation_doc = {
        "application_id": app_id,
        "scores": scores,
        "tier": tier,
        "evaluatedAt": now
    }
    evaluations.insert_one(evaluation_doc)