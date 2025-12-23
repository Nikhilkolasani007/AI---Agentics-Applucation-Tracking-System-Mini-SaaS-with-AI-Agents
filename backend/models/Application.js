const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            required: true,
        },
        resume: {
            fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS ID
            filename: { type: String, required: true },
            contentType: { type: String, required: true },
        },
        links: {
            linkedin: { type: String },
            github: { type: String },
            portfolio: { type: String },
        },
        jobDescription: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "evaluated", "rejected", "accepted"],
            default: "pending",
        },
        scores: {
            contentScore: Number,
            designScore: Number,
            projectsScore: Number,
            overallScore: Number,
            reasoningSummary: String,
        },
        tier: {
            letter: String, // A, B, C, F
            level: Number,  // 1-10
            code: String,   // A1...C10
        },
        lastEvaluatedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
