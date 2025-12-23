# agent_loop.py
import time
from typing import Dict, Any

from bson import ObjectId

from db import get_pending_applications, get_resume_bytes, update_application_evaluation
from evaluators import evaluate_candidate
from tiering import compute_tier


def run_once(max_batch: int = 5):
    """Process a batch of pending applications."""
    pending_apps = get_pending_applications(limit=max_batch)

    if not pending_apps:
        print("No pending applications found.")
        return

    for app in pending_apps:
        app_id = app["_id"]
        job_id = app.get("jobId", "UNKNOWN")

        links: Dict[str, Any] = app.get("links", {})
        resume_info = app.get("resume", {})
        file_id = resume_info.get("fileId")

        resume_bytes = None
        if file_id:
            try:
                resume_bytes = get_resume_bytes(file_id)
            except Exception as e:
                print(f"Error reading resume for {app_id}: {e}")

        print(f"Evaluating application {app_id} (job {job_id})...")

        # TODO: fetch real job description from a jobs collection, for now None
        job_description = None

        scores, tier = evaluate_candidate(
            resume_bytes=resume_bytes,
            links=links,
            job_id=job_id,
            job_description=job_description,
        )

        print(f"Scores: {scores} | Tier: {tier}")

        update_application_evaluation(app_id, scores, tier)


def run_forever(poll_interval_seconds: int = 30):
    """Typical background agent loop."""
    while True:
        try:
            run_once()
        except Exception as e:
            print(f"[ERROR] Agent loop iteration failed: {e}")
        time.sleep(poll_interval_seconds)


if __name__ == "__main__":
    # For dev you can just run once:
    # run_once()
    # For a real worker process:
    run_forever()
