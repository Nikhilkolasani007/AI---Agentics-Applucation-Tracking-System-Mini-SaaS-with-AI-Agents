const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  jobId: mongoose.Schema.Types.ObjectId,
  companyId: mongoose.Schema.Types.ObjectId,

  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },

  // Resume file info (GridFS)
  resume: {
    fileId: mongoose.Schema.Types.ObjectId,
    filename: String,
    contentType: String,
    uploadDate: Date
  },

  // Social Links
  links: {
    linkedin: String,
    github: String,
    portfolio: String
  },

  tier: {
    letter: String,
    code: String
  },
  scores: {
    overallScore: Number,
    contentScore: Number,
    designScore: Number,
    projectsScore: Number,
    reasoningSummary: String
  },

  backendData: Object,

  status: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastEvaluatedAt: Date
}, { collection: 'applications' });

module.exports = mongoose.model("Candidate", candidateSchema);
