# AI-Powered Talent Evaluation Platform

## Overview
This platform evaluates candidates using AI to assess Resume Content, Resume Design, and Projects (GitHub, Portfolio). It assigns a tier (A1-A10, B1-B10, C1-C10) based on a 30-layer matrix.

## Features
- **Resume Parsing**: Extracts text and analyzes design (fonts, layout) from PDFs.
- **GitHub Analysis**: Scores candidates based on stars, repositories, and languages.
- **Multi-Source Ingestion**: Scrapes LinkedIn and Portfolio sites for a 360° view.
- **AI Evaluation**: Uses LLMs (`google-genai` / Gemini) to synthesize data and score candidates.
- **30-Layer Tiering**: Detailed classification matrix.
- **API**: FastAPI-based REST API for submission and retrieval.

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set environment variables in `.env`:
   ```
   MONGODB_URI=mongodb+srv://...
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.0-flash-exp
   GITHUB_TOKEN=...
   ```

## Usage

### Run the API
```bash
uvicorn api:app --reload
```

### Run the Background Agent
```bash
python agent_loop.py
```

### API Endpoints
- `POST /candidates`: Submit resume + links.
- `GET /candidates/{id}`: Get evaluation status and results.
- `GET /candidates/{id}/report`: View HTML report.

## Testing
Run unit and integration tests:
```bash
pytest tests
```
