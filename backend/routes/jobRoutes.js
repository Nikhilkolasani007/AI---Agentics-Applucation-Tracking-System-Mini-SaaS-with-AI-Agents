const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createJob, getMyJobs, deleteJob } = require("../controllers/jobController");

router.post("/create", authMiddleware, createJob);
router.get("/my-jobs", authMiddleware, getMyJobs);
router.delete("/:jobId", authMiddleware, deleteJob);

module.exports = router;
