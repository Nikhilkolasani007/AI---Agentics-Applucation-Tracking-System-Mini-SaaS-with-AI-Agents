from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import pytest
from api import app

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch("api.applications") as mock_apps, \
         patch("api.fs") as mock_fs, \
         patch("api.evaluations") as mock_evals:
        yield {
            "applications": mock_apps,
            "fs": mock_fs,
            "evaluations": mock_evals
        }

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "message": "AI Talent Evaluation Platform API"}

def test_submit_candidate(mock_db):
    mock_db["fs"].put.return_value = "dummy_file_id"
    mock_db["applications"].insert_one.return_value.inserted_id = "dummy_app_id"
    
    files = {"resume": ("resume.pdf", b"dummy pdf content", "application/pdf")}
    data = {"job_id": "JOB123", "linkedin": "https://linkedin.com/in/test"}
    
    response = client.post("/candidates", files=files, data=data)
    
    assert response.status_code == 200
    assert response.json()["candidate_id"] == "dummy_app_id"
    assert response.json()["status"] == "pending"

from datetime import datetime

def test_get_candidate_evaluation_found(mock_db):
    # Mock finding an application
    valid_id = "000000000000000000000001"
    mock_app = {
        "_id": valid_id,
        "status": "evaluated",
        "scores": {"overallScore": 85},
        "tier": {"code": "A9"},
        "lastEvaluatedAt": datetime(2023, 1, 1)
    }
    # We need to handle ObjectId matching if generic find_one is used, 
    # but for simplicity let's just make the mock return this for any find_one call
    mock_db["applications"].find_one.return_value = mock_app
    
    response = client.get(f"/candidates/{valid_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "evaluated"
    assert data["scores"]["overallScore"] == 85

def test_get_candidate_evaluation_not_found(mock_db):
    mock_db["applications"].find_one.return_value = None
    
    # Use a valid 24-char hex string to avoid InvalidId error which causes 500
    response = client.get("/candidates/000000000000000000000000")
    assert response.status_code == 404
