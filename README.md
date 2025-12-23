# AI - Agentics Application Tracking System Mini SaaS with AI Agents

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

## Deployment on Railway

This project is set up as a **Monorepo**. You will need to deploy 3 separate services (Frontend, Backend, AI Agent) from the same GitHub repository.

### Prerequisites
1.  Sign up at [Railway.app](https://railway.app/).
2.  Install the [Railway CLI](https://docs.railway.app/guides/cli) (Optional, but useful).

### Steps
1.  **Create a New Project** on Railway.
2.  **Add a Database**:
    -   Select "New" -> "Database" -> "MongoDB".
    -   Once created, get the `MONGO_URL` from the "Variables" tab.

3.  **Deploy Backend**:
    -   "New" -> "GitHub Repo" -> Select this repo.
    -   Go to "Settings" -> "Root Directory" -> Set to `/backend`.
    -   Go to "Variables" -> Add:
        -   `PORT`: `5000` (Railway will override/assign this, but good to set).
        -   `MONGO_URI`: Paste your Railway MongoDB URL.
        -   `JWT_SECRET`: Your secret key.
    -   Railway should automatically detect `package.json` and `npm start`.

4.  **Deploy AI Agent**:
    -   "New" -> "GitHub Repo" -> Select this repo (again).
    -   Go to "Settings" -> "Root Directory" -> Set to `/ai-agent`.
    -   Go to "Variables" -> Add:
        -   `PORT`: `8000`.
        -   `GEMINI_API_KEY`: Your Google Gemini Key.
        -   `GITHUB_TOKEN`: Your GitHub Token.
        -   `MONGODB_URI`: Paste your Railway MongoDB URL.
    -   **Build Command**: `pip install -r requirements.txt` (Railway usually detects this).
    -   **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`

5.  **Deploy Frontend**:
    -   "New" -> "GitHub Repo" -> Select this repo (again).
    -   Go to "Settings" -> "Root Directory" -> Set to `/frontend`.
    -   Go to "Variables" -> Add:
        -   `VITE_BACKEND_URL`: The **Public Domain** of your Deployed Backend (e.g., `https://backend-production.up.railway.app`).
        -   Note: You might need to redeploy the frontend after setting this variable.
    -   Railway should detect `vite build` and serve the static files.
