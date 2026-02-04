import { Router } from "express";
import { createJob, getJobs, createBulkJobs } from "../controllers/jobController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /jobs/public/:companyId - Strictly Public (bypass company auth middleware)
router.get("/public/:companyId", getJobs);

// GET /companies/:companyId/jobs - Public (but often blocked by companyRoutes middleware if monted under /companies)
router.get("/:companyId/jobs", getJobs);

// POST /companies/:companyId/jobs - Protected
router.post("/:companyId/jobs", authenticate, createJob);

// POST /companies/:companyId/jobs/bulk - Protected (bulk add)
router.post("/:companyId/jobs/bulk", authenticate, createBulkJobs);

export default router;
