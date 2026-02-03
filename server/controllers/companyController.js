import Company from "../models/Company.js";
import Job from "../models/Job.js";

/**
 * Helper: convert company name to URL-safe slug.
 */
const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * POST /companies
 * Body: { name, theme?, sections? }
 * Protected: requires authenticated recruiter.
 */
export const createCompany = async (req, res) => {
  try {
    const { name, theme, sections } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    // Each recruiter can have only one company
    const existing = await Company.findOne({ recruiterId: req.recruiter.id });
    if (existing) {
      return res.status(400).json({ error: "Recruiter already has a company" });
    }

    let slug = generateSlug(name);

    // Ensure slug uniqueness
    const slugExists = await Company.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    const company = await Company.create({
      name,
      slug,
      recruiterId: req.recruiter.id,
      theme: theme || {},
      sections: sections || undefined,
    });

    res.status(201).json({ message: "Company created", company });
  } catch (err) {
    console.error("Create company error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /companies/me
 * Protected: returns the company belonging to the authenticated recruiter.
 */
export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ recruiterId: req.recruiter.id });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ company });
  } catch (err) {
    console.error("Get company error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /companies/public/:slug
 * Public: returns the company by slug.
 */
export const getCompanyBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
  
      const company = await Company.findOne({ slug });
  
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
  
      res.json({ company });
    } catch (err) {
      console.error("Get company by slug error:", err);
      res.status(500).json({ error: "Server error" });
    }
  };

/**
 * GET /companies/public
 * Public: returns all companies with their job counts for browsing.
 */
export const getAllPublicCompanies = async (req, res) => {
  try {
    // Get all companies
    const companies = await Company.find({}).lean();

    // Get job counts for each company
    const companiesWithJobCounts = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({ companyId: company._id });
        return {
          _id: company._id,
          name: company.name,
          slug: company.slug,
          theme: {
            logoUrl: company.theme?.logoUrl,
            primaryColor: company.theme?.primaryColor,
            bannerUrl: company.theme?.bannerUrl,
          },
          content: {
            heroTitle: company.content?.heroTitle,
            heroSubtitle: company.content?.heroSubtitle,
          },
          jobCount,
          createdAt: company.createdAt,
        };
      })
    );

    // Filter to only companies with at least 1 job (optional - can remove if you want all)
    const companiesWithJobs = companiesWithJobCounts.filter((c) => c.jobCount > 0);

    res.json({ companies: companiesWithJobs });
  } catch (err) {
    console.error("Get all public companies error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * PUT /companies/:id
 * Body: { name?, theme?, content?, sections? }
 * Protected: only the owning recruiter can update.
 */
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, theme, content, sections } = req.body;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    if (company.recruiterId.toString() !== req.recruiter.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (name) {
      company.name = name;
      // Optionally regenerate slug if name changes
      let newSlug = generateSlug(name);
      const slugExists = await Company.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      company.slug = slugExists ? `${newSlug}-${Date.now()}` : newSlug;
    }

    if (theme) {
      company.theme = { ...company.theme.toObject(), ...theme };
    }

    if (content) {
      company.content = { ...(company.content?.toObject() || {}), ...content };
    }

    if (sections) {
      company.sections = sections;
    }

    await company.save();

    res.json({ message: "Company updated", company });
  } catch (err) {
    console.error("Update company error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
