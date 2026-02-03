/**
 * Seed script to populate MongoDB with dummy companies and jobs from CSV
 * Run with: node scripts/seed.js
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load .env from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Models
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Recruiter from "../models/Recruiter.js";

// MongoDB connection string - use .env value
const MONGO_URI = process.env.MONGO_URI;

// Dummy companies to create
const DUMMY_COMPANIES = [
  {
    name: "TechCorp Global",
    heroTitle: "Build the Future with Us",
    heroSubtitle: "Join our innovative team and shape tomorrow's technology",
    primaryColor: "#3B82F6",
  },
  {
    name: "InnovateTech Solutions",
    heroTitle: "Innovation Starts Here",
    heroSubtitle: "Be part of a team that's changing the world",
    primaryColor: "#10B981",
  },
  {
    name: "DataDriven Inc",
    heroTitle: "Data Powers Everything",
    heroSubtitle: "Turn insights into impact with our data science team",
    primaryColor: "#8B5CF6",
  },
  {
    name: "CloudFirst Systems",
    heroTitle: "Elevate Your Career",
    heroSubtitle: "Join the cloud computing revolution",
    primaryColor: "#F59E0B",
  },
  {
    name: "DesignHub Creative",
    heroTitle: "Design Without Limits",
    heroSubtitle: "Where creativity meets technology",
    primaryColor: "#EC4899",
  },
];

// Helper: Generate slug from name
const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Helper: Parse CSV
const parseCSV = (csvContent) => {
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle quoted fields with commas
    const values = [];
    let current = "";
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      rows.push(row);
    }
  }
  
  return rows;
};

// Helper: Map CSV job type to schema enum
const mapJobType = (jobType) => {
  const mapping = {
    "Temporary": "Temporary",
    "Permanent": "Permanent",
    "Internship": "Internship",
  };
  return mapping[jobType] || "Full-time";
};

// Helper: Map employment type
const mapEmploymentType = (empType) => {
  const mapping = {
    "Full time": "Full time",
    "Part time": "Part time",
    "Contract": "Contract",
  };
  return mapping[empType] || "Full time";
};

// Helper: Map work policy
const mapWorkPolicy = (policy) => {
  const mapping = {
    "Remote": "Remote",
    "Hybrid": "Hybrid",
    "On-site": "On-site",
  };
  return mapping[policy] || "On-site";
};

// Helper: Map experience level
const mapExperienceLevel = (level) => {
  const mapping = {
    "Junior": "Junior",
    "Mid-level": "Mid-level",
    "Senior": "Senior",
  };
  return mapping[level] || "Mid-level";
};

// Helper: Generate random description
const generateDescription = (title, department) => {
  const descriptions = [
    `We are looking for a talented ${title} to join our ${department} team. You will work on exciting projects and collaborate with brilliant minds.`,
    `Join us as a ${title} and help shape the future of our ${department} department. We offer competitive benefits and growth opportunities.`,
    `As a ${title} in our ${department} team, you'll tackle challenging problems and make a real impact on our products and services.`,
    `We're seeking an experienced ${title} for our ${department} team. If you're passionate about making a difference, we want to hear from you.`,
    `Our ${department} team is growing! We need a skilled ${title} who thrives in a fast-paced, innovative environment.`,
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

async function seed() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing seed data...");
    await Job.deleteMany({});
    await Company.deleteMany({});
    await Recruiter.deleteMany({});
    console.log("✅ Cleared existing data");

    // Read CSV file
    const csvPath = path.resolve(__dirname, "../../Sample Jobs Data - Sample Jobs Data.csv");
    console.log(`📂 Reading CSV from: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }
    
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const jobRows = parseCSV(csvContent);
    console.log(`📊 Parsed ${jobRows.length} jobs from CSV`);

    // Create dummy recruiters and companies
    console.log("👥 Creating dummy recruiters and companies...");
    const companies = [];
    
    for (const companyData of DUMMY_COMPANIES) {
      // Create a dummy recruiter for this company
      const passwordHash = await bcrypt.hash("password123", 10);
      const recruiter = await Recruiter.create({
        email: `recruiter@${generateSlug(companyData.name)}.com`,
        passwordHash,
      });

      // Create company
      const company = await Company.create({
        name: companyData.name,
        slug: generateSlug(companyData.name),
        recruiterId: recruiter._id,
        theme: {
          primaryColor: companyData.primaryColor,
          secondaryColor: "#1E40AF",
          accentColor: "#10B981",
          backgroundColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        content: {
          heroTitle: companyData.heroTitle,
          heroSubtitle: companyData.heroSubtitle,
        },
        sections: [
          { id: "hero", type: "hero", title: companyData.heroTitle, subtitle: companyData.heroSubtitle, enabled: true, order: 0 },
          { id: "jobs", type: "jobs", title: "Open Positions", subtitle: "Find your next opportunity", enabled: true, order: 1 },
        ],
      });

      companies.push(company);
      console.log(`  ✅ Created company: ${company.name} (${company.slug})`);
    }

    // Distribute jobs across companies
    console.log("💼 Creating jobs from CSV...");
    let jobCount = 0;
    
    for (const row of jobRows) {
      // Assign to a random company
      const company = companies[Math.floor(Math.random() * companies.length)];
      
      const job = await Job.create({
        companyId: company._id,
        title: row.title,
        location: row.location,
        jobType: mapJobType(row.job_type),
        description: generateDescription(row.title, row.department),
        workPolicy: mapWorkPolicy(row.work_policy),
        department: row.department,
        employmentType: mapEmploymentType(row.employment_type),
        experienceLevel: mapExperienceLevel(row.experience_level),
        salaryRange: row.salary_range,
        slug: row.job_slug,
      });
      
      jobCount++;
    }
    
    console.log(`✅ Created ${jobCount} jobs`);

    // Summary
    console.log("\n📋 SEED SUMMARY:");
    console.log("================");
    for (const company of companies) {
      const count = await Job.countDocuments({ companyId: company._id });
      console.log(`  ${company.name}: ${count} jobs`);
    }

    console.log("\n🔑 LOGIN CREDENTIALS:");
    console.log("=====================");
    for (const companyData of DUMMY_COMPANIES) {
      console.log(`  Email: recruiter@${generateSlug(companyData.name)}.com`);
      console.log(`  Password: password123`);
      console.log("");
    }

    console.log("✅ Seed completed successfully!");
    
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run seed
seed();
