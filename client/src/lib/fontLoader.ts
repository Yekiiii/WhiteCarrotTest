// Google Fonts loader utility
// Maps font family names to their Google Fonts URLs

const GOOGLE_FONTS_BASE = "https://fonts.googleapis.com/css2";

// Font configurations with weights
const FONT_CONFIG: Record<string, { weights: string[]; display?: string }> = {
  Inter: { weights: ["400", "500", "600", "700"], display: "swap" },
  Poppins: { weights: ["400", "500", "600", "700"], display: "swap" },
  "DM Sans": { weights: ["400", "500", "600", "700"], display: "swap" },
  "Source Sans Pro": { weights: ["400", "600", "700"], display: "swap" },
  Roboto: { weights: ["400", "500", "700"], display: "swap" },
  "Open Sans": { weights: ["400", "600", "700"], display: "swap" },
  Lato: { weights: ["400", "700"], display: "swap" },
  Montserrat: { weights: ["400", "500", "600", "700"], display: "swap" },
  "Playfair Display": { weights: ["400", "600", "700"], display: "swap" },
  Raleway: { weights: ["400", "500", "600", "700"], display: "swap" },
  "Work Sans": { weights: ["400", "500", "600", "700"], display: "swap" },
  Nunito: { weights: ["400", "600", "700"], display: "swap" },
};

// Track loaded fonts to avoid duplicate loading
const loadedFonts = new Set<string>();

/**
 * Extract the primary font name from a CSS font-family string
 */
export function extractFontName(fontFamily: string): string | null {
  if (!fontFamily) return null;
  
  // Get the first font in the stack
  const firstFont = fontFamily.split(",")[0].trim();
  
  // Remove quotes if present
  const cleanName = firstFont.replace(/['"]/g, "");
  
  // Check if it's a system font
  const systemFonts = ["system-ui", "-apple-system", "sans-serif", "serif", "monospace", "Georgia"];
  if (systemFonts.includes(cleanName)) {
    return null; // System fonts don't need loading
  }
  
  return cleanName;
}

/**
 * Generate Google Fonts URL for a font
 */
function generateFontUrl(fontName: string): string | null {
  const config = FONT_CONFIG[fontName];
  if (!config) return null;
  
  const family = fontName.replace(/ /g, "+");
  const weights = config.weights.join(";");
  
  return `${GOOGLE_FONTS_BASE}?family=${family}:wght@${weights}&display=${config.display || "swap"}`;
}

/**
 * Load a Google Font dynamically
 */
export function loadFont(fontFamily: string): void {
  const fontName = extractFontName(fontFamily);
  if (!fontName || loadedFonts.has(fontName)) return;
  
  const url = generateFontUrl(fontName);
  if (!url) return;
  
  // Check if link already exists
  const existingLink = document.querySelector(`link[href*="${fontName.replace(/ /g, "+")}"]`);
  if (existingLink) {
    loadedFonts.add(fontName);
    return;
  }
  
  // Create and inject link element
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.crossOrigin = "anonymous";
  
  document.head.appendChild(link);
  loadedFonts.add(fontName);
}

/**
 * Load multiple fonts at once
 */
export function loadFonts(fontFamilies: string[]): void {
  fontFamilies.forEach(loadFont);
}

/**
 * Preload common fonts used in presets
 */
export function preloadCommonFonts(): void {
  loadFonts([
    "Inter, sans-serif",
    "Poppins, sans-serif",
    "DM Sans, sans-serif",
    "Source Sans Pro, sans-serif",
    "Montserrat, sans-serif",
  ]);
}
