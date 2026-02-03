import mongoose from "mongoose";

// Per-section theme overrides
const sectionThemeSchema = new mongoose.Schema(
  {
    backgroundColor: { type: String },
    textColor: { type: String },
    accentColor: { type: String },
  },
  { _id: false }
);

// Section config for type-specific options
const sectionConfigSchema = new mongoose.Schema(
  {
    // Video section
    videoUrl: { type: String },
    
    // Gallery section - now supports captions
    imageUrls: [{ type: String }], // Legacy support
    images: [{
      url: { type: String },
      caption: { type: String, default: "" }
    }],
    
    // CTA section
    ctaButtonText: { type: String },
    ctaButtonUrl: { type: String },
    
    // Text section
    layout: { type: String, enum: ["left", "center", "right"], default: "center" },
    
    // Hero section background
    backgroundType: { type: String, enum: ["image", "color", "gradient"], default: "image" },
    backgroundImageUrl: { type: String },
    backgroundValue: { type: String }, // For color or gradient CSS
    overlayOpacity: { type: Number, default: 0.4 },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["hero", "text", "gallery", "video", "jobs", "cta", "custom"], 
      required: true 
    },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    content: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    theme: { type: sectionThemeSchema },
    config: { type: sectionConfigSchema },
  },
  { _id: false }
);

const themeSchema = new mongoose.Schema(
  {
    // Colors
    primaryColor: { type: String, default: "#3B82F6" },
    secondaryColor: { type: String, default: "#1E40AF" },
    accentColor: { type: String, default: "#10B981" },
    backgroundColor: { type: String, default: "#FFFFFF" },
    textColor: { type: String, default: "#1F2937" },
    
    // Typography
    fontFamily: { type: String, default: "Inter, system-ui, sans-serif" },
    headingFont: { type: String, default: "Inter, system-ui, sans-serif" },
    baseFontSize: { type: String, default: "16px" },
    
    // Layout
    borderRadius: { type: String, default: "0.5rem" },
    spacing: { type: String, enum: ["compact", "normal", "relaxed"], default: "normal" },
    buttonStyle: { type: String, enum: ["rounded", "pill", "sharp", "minimal"], default: "rounded" },
    
    // Assets (deprecated - use company.logoUrl and company.bannerUrl)
    logoUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    
    // Style preset applied
    preset: { type: String, default: "" },
    
    // Custom CSS
    customCSS: { type: String, default: "" },
  },
  { _id: false }
);

// Social links schema
const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    youtube: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { _id: false }
);

// Content schema for hero section (kept minimal)
const contentSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "Join Our Team" },
    heroSubtitle: { type: String, default: "Build the future with us" },
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
    
    // Company branding (profile)
    logoUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    
    // Social links
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    
    theme: { type: themeSchema, default: () => ({}) },
    content: { type: contentSchema, default: () => ({}) },
    sections: {
      type: [sectionSchema],
      default: [
        { id: "hero-1", type: "hero", title: "Join Our Team", subtitle: "Build the future with us", enabled: true, order: 0 },
        { id: "about-1", type: "text", title: "About Us", content: "We are a team dedicated to excellence and innovation.", enabled: true, order: 1 },
        { id: "culture-1", type: "text", title: "Our Culture", content: "Experience what it's like to work with us.", enabled: true, order: 2 },
        { id: "jobs-1", type: "jobs", title: "Open Positions", subtitle: "Find the role that fits you best", enabled: true, order: 3 },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
