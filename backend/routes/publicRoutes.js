const express = require("express");
const router = express.Router();

const {
  getPublicJob,
  applyCandidate
} = require("../controllers/candidateController");

/**
 * ✅ Health / test route
 * URL: GET /api/public
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Public API is working ✅"
  });
});

/**
 * ✅ Get public job by formId
 * URL: GET /api/public/jobs/:formId
 */
router.get("/jobs/:formId", getPublicJob);

/**
 * ✅ Apply candidate to a job
 * URL: POST /api/public/apply/:formId
 */
router.post("/apply/:formId", applyCandidate);

module.exports = router;
