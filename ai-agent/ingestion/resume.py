import io
import logging
from typing import Dict, Any, Optional

from pdfminer.high_level import extract_text, extract_pages
from pdfminer.layout import LTTextContainer, LTChar

logger = logging.getLogger(__name__)

def analyze_resume_design(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Analyze the design of the resume (fonts, consistency, layout density).
    Returns a dictionary with metrics.
    """
    try:
        font_sizes = []
        font_names = set()
        text_density = 0.0
        total_chars = 0
        page_count = 0

        # We need a seekable stream for pdfminer
        stream = io.BytesIO(pdf_bytes)
        
        for page_layout in extract_pages(stream):
            page_count += 1
            for element in page_layout:
                if isinstance(element, LTTextContainer):
                    for text_line in element:
                        try:
                            for character in text_line:
                                if isinstance(character, LTChar):
                                    font_sizes.append(character.size)
                                    font_names.add(character.fontname)
                                    total_chars += 1
                        except TypeError:
                            # Sometimes text_line might not be iterable or structure matches unexpectedly
                            continue
        
        if not font_sizes:
            return {
                "design_score": 0,
                "details": "Could not extract text/fonts"
            }

        avg_font_size = sum(font_sizes) / len(font_sizes)
        font_variety = len(font_names)
        
        # Heuristics
        design_score = 85 # Base score (higher base)
        
        # Penalty for too many fonts (relaxed)
        if font_variety > 5:
            design_score -= (font_variety - 5) * 3
        
        # Penalty for inconsistent sizing (simple variance check could work, but sticking to basics)
        
        # Bonus for good length (1-3 pages for professionals)
        if 1 <= page_count <= 3:
            design_score += 10
        elif page_count > 5:
            design_score -= 5

        return {
            "design_score": max(0, min(100, design_score)),
            "page_count": page_count,
            "font_count": font_variety,
            "avg_font_size": round(avg_font_size, 2),
            "fonts": list(font_names)[:5] # Sample
        }

    except Exception as e:
        logger.error(f"Error analyzing resume design: {e}")
        return {"error": str(e), "design_score": 50}

def extract_resume_text(pdf_bytes: bytes) -> str:
    try:
        return extract_text(io.BytesIO(pdf_bytes))
    except Exception as e:
        logger.error(f"Error extracting text: {e}")
        return ""
