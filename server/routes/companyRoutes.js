import { Router } from "express";
import {
  createCompany,
  getMyCompany,
  updateCompany,
  getCompanyBySlug,
  getAllPublicCompanies,
} from "../controllers/companyController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/public", getAllPublicCompanies);
router.get("/public/:slug", getCompanyBySlug);

// Protected routes
router.use(authenticate);

// POST /companies
router.post("/", createCompany);

// GET /companies/me
router.get("/me", getMyCompany);

// PUT /companies/:id
router.put("/:id", updateCompany);

export default router;
