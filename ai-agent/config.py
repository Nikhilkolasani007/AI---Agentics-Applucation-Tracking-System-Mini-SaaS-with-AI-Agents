import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

if GEMINI_API_KEY is None:
    raise RuntimeError("GEMINI API Key Not Set In Environemt")