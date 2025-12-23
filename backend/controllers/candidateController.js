const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const mongoose = require("mongoose");
const multer = require("multer");
const { Readable } = require("stream");

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const getPublicJob = async (req, res) => {
  try {
    const job = await Job.findOne({ publicFormId: req.params.formId });

    if (!job) {
      return res.status(404).json({ message: "Invalid link" });
    }

    res.json({
      jobTitle: job.jobTitle,
      description: job.description
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const applyCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, linkedin, github, portfolio } = req.body;
    const file = req.file;

    const job = await Job.findOne({ publicFormId: req.params.formId });
    if (!job) {
      return res.status(404).json({ message: "Invalid link" });
    }

    // 1. Upload to GridFS
    let resumeInfo = {};
    if (file) {
      const db = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "fs" });

      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype
      });

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);

      await new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream)
          .on("error", reject)
          .on("finish", resolve);
      });

      resumeInfo = {
        fileId: uploadStream.id,
        filename: file.originalname,
        contentType: file.mimetype,
        uploadDate: new Date()
      };
    }

    // 2. Create Candidate
    await Candidate.create({
      jobId: job._id,
      companyId: job.companyId,
      personalInfo: {
        firstName,
        lastName,
        email
      },
      resume: resumeInfo,
      links: {
        linkedin,
        github,
        portfolio
      },
      tier: {
        letter: "pending",
        code: "Processing..."
      },
      scores: {
        overallScore: 0,
        contentScore: 0,
        designScore: 0,
        projectsScore: 0,
        reasoningSummary: "Evaluation in progress"
      },
      backendData: {},
      status: "pending"
    });

    res.json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("APPLY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPublicJob,
  applyCandidate: [upload.single("resume"), applyCandidate]
};
