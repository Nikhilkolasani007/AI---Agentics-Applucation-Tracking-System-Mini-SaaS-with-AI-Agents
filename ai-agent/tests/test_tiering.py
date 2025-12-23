
import pytest
from tiering import compute_tier

def test_tier_a():
    scores = {
        "contentScore": 80,
        "designScore": 80,
        "projectsScore": 80,
        "overallScore": 85
    }
    result = compute_tier(scores)
    assert result["letter"] == "A"
    assert result["level"] == 8 # round(8.5) is 8 in Python 3 (nearest even)
    
    assert result["code"] == "A8"

def test_tier_b():
    # Good content, poor design, strong projects
    scores = {
        "contentScore": 70, # > 60
        "designScore": 40,  # < 75
        "projectsScore": 80,# > 75
        "overallScore": 65
    }
    result = compute_tier(scores)
    assert result["letter"] == "B"
    # 65/10 = 6.5 -> 6 or 7
    assert result["level"] in [6, 7]

def test_tier_c():
    # Strong projects only
    scores = {
        "contentScore": 50,
        "designScore": 50,
        "projectsScore": 80, # > 70
        "overallScore": 60
    }
    result = compute_tier(scores)
    assert result["letter"] == "C"

def test_tier_f():
    scores = {
        "contentScore": 50,
        "designScore": 50,
        "projectsScore": 50,
        "overallScore": 50
    }
    result = compute_tier(scores)
    assert result["letter"] == "F"

def test_level_bounds():
    scores = {"overallScore": 100}
    assert compute_tier(scores)["level"] == 10
    
    scores = {"overallScore": 0}
    assert compute_tier(scores)["level"] == 1
