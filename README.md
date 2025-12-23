# Beta Hyd - AI Talent Evaluation Platform

This project is a comprehensive AI-powered talent evaluation platform capable of analyzing resumes, GitHub profiles, and LinkedIn profiles to provide a holistic candidate score.

## Project Structure

-   **frontend**: React-based user interface.
-   **backend**: Node.js/Express server handling API requests and database interactions.
-   **ai-agent**: Python-based AI agent using Gemini for resume analysis and profile scoring.

## Prerequisites

Before running the project, ensure you have the following installed:

-   **Node.js** (v18 or higher)
-   **Python** (3.8 or higher)
-   **MongoDB** (running locally or a cloud URI)

## Setup Instructions

### 1. Environment Configuration

You need to set up `.env` files for each component.

**Backend (`/backend/.env`)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-auth  # Or your MongoDB URI
JWT_SECRET=supersecretkey
```

**AI Agent (`/ai-agent/.env`)**
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GITHUB_TOKEN=your_github_token
MONGODB_URI=mongodb://localhost:27017/mern-auth
```

**Frontend (`/frontend/.env`)**
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 2. Installation

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd frontend
npm install
```

**AI Agent**
```bash
cd ai-agent
python -m venv .venv
# Activate virtual environment:
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

## Running the Application

It is recommended to run each component in a separate terminal.

**1. Start Backend**
```bash
cd backend
npm start
```

**2. Start AI Agent**
```bash
cd ai-agent
# Ensure venv is activated
uvicorn api:app --reload
```

**3. Start Frontend**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`.

## Deployment

### GitHub
1.  Initialize git: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Initial commit"`
4.  Push to your repository.

### Manual Verification
-   Ensure MongoDB is running.
-   Check console logs for any connection errors in backend and ai-agent.
-   Verify frontend can fetch data from backend.
