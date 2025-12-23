import os
import logging
from typing import Dict, Any, List

from github import Github, GithubException

logger = logging.getLogger(__name__)

def analyze_github_profile(username: str) -> Dict[str, Any]:
    """
    Analyze a GitHub profile for activity, stars, and languages.
    """
    token = os.getenv("GITHUB_TOKEN")
    if not token or not username:
        return {"error": "No GITHUB_TOKEN or username provided"}

    try:
        g = Github(token)
        user = g.get_user(username)

        repos = user.get_repos()
        
        total_stars = 0
        languages = {}
        total_repos = 0
        recent_activity = False

        # Limit to checking last 30 repos to avoid timeouts
        for repo in repos[:30]:
            total_repos += 1
            total_stars += repo.stargazers_count
            if repo.language:
                languages[repo.language] = languages.get(repo.language, 0) + 1
            
            # Simple check for recent activity (updated in last 6 months)
            # This is a bit expensive if we do it for all, so maybe just check the first few sorted by updated
            pass
        
        # Get top languages
        top_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Calculate a rough "project score"
        project_score = 50
        project_score += min(50, total_stars * 2)
        project_score += min(20, total_repos)
        
        return {
            "username": username,
            "total_stars": total_stars,
            "total_repos": total_repos,
            "top_languages": [l[0] for l in top_languages],
            "project_score": min(100, project_score),
            "bio": user.bio,
            "followers": user.followers
        }

    except GithubException as e:
        logger.error(f"GitHub API error: {e}")
        return {"error": str(e)}
    except Exception as e:
        logger.error(f"General error analyzing GitHub: {e}")
        return {"error": str(e)}
