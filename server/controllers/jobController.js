import Job from "../models/Job.js";
import Company from "../models/Company.js";

/**
 * POST /companies/:companyId/jobs
 * Body: { title, location, jobType, description }
 * Protected: only the company owner can add jobs.
 */
export const createJob = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { title, location, jobType, description } = req.body;

    // Validate required fields
    if (!title || !location || !jobType || !description) {
      return res.status(400).json({ error: "All job fields are required" });
    }

    // Verify company exists and belongs to recruiter
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    if (company.recruiterId.toString() !== req.recruiter.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const job = await Job.create({
      companyId,
      title,
      location,
      jobType,
      description,
    });

    res.status(201).json({ message: "Job created", job });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /companies/:companyId/jobs
 * Query params: search, location, jobType
 * Public: anyone can view jobs for a company.
 */
export const getJobs = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { search, location, jobType, page = 1, limit = 9 } = req.query;

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Build query
    const query = { companyId };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    // Pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitInt),
      Job.countDocuments(query),
    ]);

    res.json({
      jobs,
      total,
      page: pageInt,
      pages: Math.ceil(total / limitInt),
    });
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
