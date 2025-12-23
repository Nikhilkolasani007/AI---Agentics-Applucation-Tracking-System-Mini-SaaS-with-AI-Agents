import logging
import requests
from bs4 import BeautifulSoup
from typing import Dict, Any

logger = logging.getLogger(__name__)

def analyze_portfolio(url: str) -> Dict[str, Any]:
    """
    Check portfolio website availability and extract basic text content.
    """
    if not url:
        return {}

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code != 200:
            return {"active": False, "status": resp.status_code}
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        text_content = soup.get_text()
        
        # Basic heuristic for visual quality (existence of images, css)
        img_count = len(soup.find_all('img'))
        script_count = len(soup.find_all('script'))
        css_count = len(soup.find_all('link', rel='stylesheet'))
        
        # "Visual Richness" proxy
        richness_score = 0
        if img_count > 5: richness_score += 20
        if css_count > 0: richness_score += 20
        if script_count > 0: richness_score += 10
        if "portfolio" in text_content.lower() or "projects" in text_content.lower():
             richness_score += 30
             
        return {
            "active": True,
            "richness_score": min(100, richness_score),
            "text_preview": text_content[:500].strip(),
            "meta_description": soup.find("meta", attrs={"name":"description"})
        }

    except Exception as e:
        logger.warning(f"Portfolio check failed for {url}: {e}")
        return {"active": False, "error": str(e)}
