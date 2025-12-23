// =======================
// Base URLs
// =======================

// Node.js Backend (App Engine)
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// AI Agent (FastAPI)
const AI_AGENT_URL =
  import.meta.env.VITE_AI_AGENT_URL || "http://localhost:8000";


// =======================
// PUBLIC FORM (Node Backend)
// =======================

export const getPublicJob = async (formId) => {
  const res = await fetch(`${BACKEND_URL}/api/public/jobs/${formId}`);
  if (!res.ok) throw new Error("Failed to fetch public job");
  return res.json();
};

export const applyCandidate = async (formId, data) => {
  const res = await fetch(`${BACKEND_URL}/api/public/apply/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to apply candidate");
  return res.json();
};


// =======================
// AUTH / JOBS (Node Backend)
// =======================

export const getMyJobs = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BACKEND_URL}/api/jobs/my-jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
};


// =======================
// AI AGENT APIs
// =======================

export const submitCandidate = async (formData) => {
  const res = await fetch(`${AI_AGENT_URL}/candidates`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Submission failed");
  }

  return res.json();
};

export const updateCandidateStatus = async (candidateId, status) => {
  const res = await fetch(`${AI_AGENT_URL}/candidates/${candidateId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};

export const getEvaluation = async (candidateId) => {
  const res = await fetch(`${AI_AGENT_URL}/candidates/${candidateId}`);
  if (!res.ok) throw new Error("Failed to fetch evaluation");
  return res.json();
};

export const getDashboardStats = async () => {
  const res = await fetch(`${AI_AGENT_URL}/stats`);
  return res.ok ? res.json() : null;
};

export const getCandidatesList = async () => {
  const res = await fetch(`${AI_AGENT_URL}/candidates_list`);
  return res.ok ? res.json() : [];
};

export const getJobAnalytics = async (jobId) => {
  const res = await fetch(`${AI_AGENT_URL}/analytics/${jobId}`);
  return res.ok ? res.json() : null;
};
