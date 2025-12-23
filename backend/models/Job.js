const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  jobTitle: String,
  description: String,
  publicFormId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Job", jobSchema);
