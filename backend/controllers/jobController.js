const Job = require("../models/Job");
const crypto = require("crypto");

const createJob = async (req, res) => {
  try {
    const { jobTitle, description } = req.body;
    const companyId = req.user.id;

    const publicFormId = crypto.randomUUID();

    const job = await Job.create({
      companyId,
      jobTitle,
      description,
      publicFormId
    });

    const protocol = req.protocol;
    const host = req.get("host");
    const publicFormLink = `${protocol}://${host}/apply/${publicFormId}`;

    res.json({
      message: "Job created successfully",
      publicFormLink
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, companyId: req.user.id });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    await Job.deleteOne({ _id: jobId });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createJob, getMyJobs, deleteJob };
