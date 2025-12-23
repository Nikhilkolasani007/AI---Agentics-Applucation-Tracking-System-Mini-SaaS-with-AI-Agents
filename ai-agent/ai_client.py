# ai_client.py
from google import genai
from config import GEMINI_API_KEY, GEMINI_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_text(prompt: str) -> str:
    """Simple wrapper around Gemini API for text responses."""
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
    )
    # In simple cases, response.text will hold the main reply
    return response.text