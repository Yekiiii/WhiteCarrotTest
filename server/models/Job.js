import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Temporary", "Permanent", "Internship"],
      required: true,
    },
    description: { type: String, required: true },
    // Additional fields for richer job data
    workPolicy: { type: String, enum: ["Remote", "Hybrid", "On-site"], default: "On-site" },
    department: { type: String, trim: true },
    employmentType: { type: String, enum: ["Full time", "Part time", "Contract"], default: "Full time" },
    experienceLevel: { type: String, enum: ["Junior", "Mid-level", "Senior"], default: "Mid-level" },
    salaryRange: { type: String, trim: true },
    slug: { type: String, trim: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export default mongoose.model("Job", jobSchema);
