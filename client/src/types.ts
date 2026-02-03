export interface Recruiter {
  id: string;
  email: string;
}

// Per-section theme overrides
export interface SectionTheme {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export interface Section {
  id: string;
  type: "hero" | "text" | "gallery" | "video" | "jobs" | "cta" | "custom";
  title: string;
  subtitle?: string;
  content?: string;
  enabled: boolean;
  order: number;
  theme?: SectionTheme;
  // Additional config for specific types
  config?: {
    videoUrl?: string;
    imageUrls?: string[];
    ctaButtonText?: string;
    ctaButtonUrl?: string;
    layout?: "left" | "center" | "right";
    backgroundImageUrl?: string;
    backgroundType?: "image" | "color" | "gradient";
    backgroundValue?: string; // Hex color or gradient string
    overlayOpacity?: number; // 0 to 1
  };
}

export interface Theme {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Typography
  fontFamily: string;
  headingFont: string;
  baseFontSize: string;
  
  // Layout
  borderRadius: string;
  spacing: "compact" | "normal" | "relaxed";
  buttonStyle: "rounded" | "pill" | "sharp" | "minimal";
  
  // Assets
  logoUrl: string;
  bannerUrl: string;
  cultureVideoUrl?: string;
  
  // Preset & Custom
  preset: string;
  customCSS: string;
}

export interface Content {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle?: string;
  aboutText?: string;
  cultureTitle?: string;
  cultureText?: string;
  jobsTitle?: string;
  jobsSubtitle?: string;
}

export interface Job {
  _id: string;
  companyId: string;
  title: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract";
  description: string;
  createdAt: string;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  recruiterId: string;
  theme: Theme;
  content: Content;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  recruiter: Recruiter;
}

