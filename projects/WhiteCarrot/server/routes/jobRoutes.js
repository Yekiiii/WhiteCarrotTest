import { Router } from "express";
import { createJob, getJobs } from "../controllers/jobController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /jobs/public/:companyId - Strictly Public (bypass company auth middleware)
router.get("/public/:companyId", getJobs);

// GET /companies/:companyId/jobs - Public (but often blocked by companyRoutes middleware if monted under /companies)
router.get("/:companyId/jobs", getJobs);

// POST /companies/:companyId/jobs - Protected
router.post("/:companyId/jobs", authenticate, createJob);

export default router;
