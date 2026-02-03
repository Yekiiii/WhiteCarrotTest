import React from "react";
import { type Company, type Section, type Job, type Theme, type SectionTheme } from "../../types";
import { Pagination } from "../ui/Pagination";

interface LivePreviewProps {
  company: Company;
  jobs: Job[];
  jobsPagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

// Helper: Resolve Image URL
const resolveImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("/")) {
    return `http://localhost:5000${url}`;
  }
  return url;
};

// Helper to add alpha to hex color
const addAlpha = (color: string, opacity: number) => {
  if (!color) return color;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    if (hex.length === 3) {
      return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${alpha}`;
    }
    return `#${hex}${alpha}`;
  }
  return color;
};

// Helper to get spacing classes based on theme
const getSpacingClasses = (spacing: string) => {
  switch (spacing) {
    case "compact":
      return { section: "py-10 px-4", gap: "gap-3", text: "mb-4" };
    case "relaxed":
      return { section: "py-20 px-8", gap: "gap-6", text: "mb-8" };
    default:
      return { section: "py-16 px-6", gap: "gap-4", text: "mb-6" };
  }
};

// Helper to get button styles based on theme
const getButtonStyles = (style: string, accentColor: string, borderRadius: string) => {
  const base = "px-6 py-2.5 text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md";
  let specificStyle: React.CSSProperties = {};
  let classes = base;

  switch (style) {
    case "pill":
      specificStyle = { borderRadius: "9999px", backgroundColor: accentColor, color: "#fff" };
      break;
    case "sharp":
      specificStyle = { borderRadius: "0", backgroundColor: accentColor, color: "#fff" };
      break;
    case "minimal":
      specificStyle = { 
        borderRadius: borderRadius, 
        backgroundColor: "transparent", 
        color: accentColor, 
        border: `2px solid ${accentColor}` 
      };
      classes += " hover:bg-opacity-10";
      break;
    default:
      specificStyle = { borderRadius: borderRadius, backgroundColor: accentColor, color: "#fff" };
      break;
  }

  return { classes, style: specificStyle };
};

// Merge section theme with global theme
const getSectionColors = (theme: Theme, sectionTheme?: SectionTheme) => ({
  backgroundColor: sectionTheme?.backgroundColor || theme.backgroundColor,
  textColor: sectionTheme?.textColor || theme.textColor,
  accentColor: sectionTheme?.accentColor || theme.accentColor,
});

// Parse YouTube URL for embed
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

export const LivePreview: React.FC<LivePreviewProps> = ({ company, jobs, jobsPagination }) => {
  const { theme, content, sections } = company;
  const spacingClasses = getSpacingClasses(theme.spacing);

  // Sort and filter enabled sections
  const visibleSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: Section) => {
    const colors = getSectionColors(theme, section.theme);
    const buttonInfo = getButtonStyles(theme.buttonStyle, colors.accentColor, theme.borderRadius);

    switch (section.type) {
      case "hero":
        const bgType = section.config?.backgroundType || "image";
        const bgImage = section.config?.backgroundImageUrl || theme.bannerUrl;
        const bgValue = section.config?.backgroundValue;
        
        let headerStyle: React.CSSProperties = {
            backgroundColor: theme.primaryColor,
            backgroundSize: "cover",
            backgroundPosition: "center",
        };

        if (bgType === "image" && bgImage) {
            headerStyle.backgroundImage = `url(${resolveImageUrl(bgImage)})`;
        } else if (bgType === "color" && bgValue) {
             headerStyle.backgroundColor = bgValue;
             headerStyle.backgroundImage = "none";
        } else if (bgType === "gradient" && bgValue) {
             headerStyle.backgroundImage = bgValue;
        }

        return (
          <header
            key={section.id}
            className="hero-section relative text-white"
            style={headerStyle}
          >
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: section.config?.overlayOpacity ?? 0.4 }} 
            />
            <div
              className="relative max-w-4xl mx-auto text-center"
              style={{
                padding: theme.spacing === "compact" ? "3rem 1rem" : theme.spacing === "relaxed" ? "6rem 2rem" : "5rem 1.5rem",
              }}
            >
              {theme.logoUrl && (
                <img
                  src={resolveImageUrl(theme.logoUrl)}
                  alt="Logo"
                  className="mx-auto mb-6 bg-white/90 p-2 object-contain"
                  style={{ height: "4rem", width: "4rem", borderRadius: theme.borderRadius }}
                />
              )}
              <h1
                className="hero-title text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: theme.headingFont }}
              >
                {section.title || content.heroTitle}
              </h1>
              <p className="hero-subtitle text-xl text-white/90" style={{ fontFamily: theme.fontFamily }}>
                {section.subtitle || content.heroSubtitle}
              </p>
            </div>
          </header>
        );

      case "text":
        // Handle alignment
        const alignClass = 
          section.config?.layout === "left" ? "text-left" : 
          section.config?.layout === "right" ? "text-right" : 
          "text-center";
        
        // Dynamic max-width based on alignment (optional refinement)
        const containerMax = section.config?.layout === "left" ? "max-w-5xl" : "max-w-4xl";

        return (
          <section
            key={section.id}
            className={`section ${spacingClasses.section}`}
            style={{ backgroundColor: colors.backgroundColor }}
          >
            <div className={`${containerMax} mx-auto ${alignClass}`}>
              <h2
                className={`section-title text-3xl font-bold ${spacingClasses.text}`}
                style={{ fontFamily: theme.headingFont, color: colors.textColor }}
              >
                {section.title}
              </h2>
              {section.subtitle && (
                <p
                  className="text-lg mb-6"
                  style={{ fontFamily: theme.fontFamily, color: colors.textColor, opacity: 0.7 }}
                >
                  {section.subtitle}
                </p>
              )}
              <p
                className="section-text text-lg leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: theme.fontFamily, color: colors.textColor, opacity: 0.8 }}
              >
                {section.content}
              </p>
            </div>
          </section>
        );

      case "gallery":
        const galleryImages = (section.config?.imageUrls as string[]) || [];
        return (
          <section
            key={section.id}
            className={`section ${spacingClasses.section}`}
            style={{ backgroundColor: colors.backgroundColor }}
          >
            <div className="max-w-6xl mx-auto">
              <h2
                className={`section-title text-3xl font-bold text-center ${spacingClasses.text}`}
                style={{ fontFamily: theme.headingFont, color: colors.textColor }}
              >
                {section.title}
              </h2>
              {/* Gallery grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {galleryImages.length > 0 ? (
                  galleryImages.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden"
                      style={{ borderRadius: theme.borderRadius }}
                    >
                      <img
                        src={resolveImageUrl(url)}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square flex items-center justify-center"
                      style={{
                        backgroundColor: addAlpha(colors.accentColor, 0.1),
                        borderRadius: theme.borderRadius,
                      }}
                    >
                      <span style={{ color: colors.textColor, opacity: 0.4 }}>Image {i}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        );

      case "video":
        const embedUrl = getYouTubeEmbedUrl(section.config?.videoUrl || "");
        return (
          <section
            key={section.id}
            className={`section ${spacingClasses.section}`}
            style={{ backgroundColor: colors.backgroundColor }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2
                className={`section-title text-3xl font-bold ${spacingClasses.text}`}
                style={{ fontFamily: theme.headingFont, color: colors.textColor }}
              >
                {section.title}
              </h2>
              {embedUrl ? (
                <div
                  className="aspect-video w-full max-w-3xl mx-auto shadow-lg overflow-hidden"
                  style={{ borderRadius: theme.borderRadius }}
                >
                  <iframe
                    src={embedUrl}
                    title={section.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div
                  className="aspect-video w-full max-w-3xl mx-auto flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: addAlpha(colors.accentColor, 0.1),
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: addAlpha(colors.accentColor, 0.2) }}
                    >
                      <svg
                        className="w-8 h-8 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: colors.accentColor }}
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span style={{ color: colors.textColor, opacity: 0.5 }}>Add a video URL</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case "jobs":
        return (
          <section
            key={section.id}
            className={`section ${spacingClasses.section}`}
            style={{ backgroundColor: colors.backgroundColor }}
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2
                  className={`section-title text-3xl font-bold ${spacingClasses.text}`}
                  style={{ fontFamily: theme.headingFont, color: colors.textColor }}
                >
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p style={{ fontFamily: theme.fontFamily, color: colors.textColor, opacity: 0.7, fontSize: "1.1rem" }}>
                    {section.subtitle}
                  </p>
                )}
              </div>

              {jobs.length === 0 ? (
                <div
                  className="text-center py-12 rounded-xl border-2 border-dashed"
                  style={{ borderColor: addAlpha(colors.textColor, 0.2) }}
                >
                  <p style={{ color: colors.textColor, opacity: 0.5 }}>
                    No open positions at the moment.
                  </p>
                </div>
              ) : (
                <>
                  <div className={`grid md:grid-cols-2 ${spacingClasses.gap}`}>
                    {jobs.map((job) => (
                      <div
                        key={job._id}
                        className="job-card p-6 border transition-all hover:shadow-xl group"
                        style={{
                          backgroundColor: colors.backgroundColor,
                          borderRadius: theme.borderRadius,
                          borderColor: addAlpha(colors.textColor, 0.1),
                        }}
                      >
                        <h3
                          className="job-title font-bold text-xl mb-2 transition-colors"
                          style={{ fontFamily: theme.headingFont, color: colors.textColor }}
                        >
                          {job.title}
                        </h3>
                        <div
                          className="flex items-center gap-3 text-sm mb-4"
                          style={{ color: colors.textColor, opacity: 0.6 }}
                        >
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.jobType}
                          </span>
                        </div>
                        <p
                          className="text-sm line-clamp-3 mb-6"
                          style={{ fontFamily: theme.fontFamily, color: colors.textColor, opacity: 0.7, lineHeight: "1.6" }}
                        >
                          {job.description}
                        </p>
                        <button className={`apply-button ${buttonInfo.classes}`} style={buttonInfo.style}>
                          Apply Now
                        </button>
                      </div>
                    ))}
                  </div>
                  {jobsPagination && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={jobsPagination.currentPage}
                        totalPages={jobsPagination.totalPages}
                        onPageChange={jobsPagination.onPageChange}
                        theme={{
                          primaryColor: colors.accentColor,
                          textColor: colors.textColor,
                          borderRadius: theme.borderRadius
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        );

      case "cta":
        return (
          <section
            key={section.id}
            className={`section ${spacingClasses.section}`}
            style={{ backgroundColor: colors.backgroundColor }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2
                className={`section-title text-3xl font-bold ${spacingClasses.text}`}
                style={{ fontFamily: theme.headingFont, color: colors.textColor }}
              >
                {section.title}
              </h2>
              {section.subtitle && (
                <p
                  className="text-lg mb-8"
                  style={{ fontFamily: theme.fontFamily, color: colors.textColor, opacity: 0.7 }}
                >
                  {section.subtitle}
                </p>
              )}
              <a
                href={section.config?.ctaButtonUrl || "#"}
                className={`inline-block ${buttonInfo.classes}`}
                style={buttonInfo.style}
              >
                {section.config?.ctaButtonText || "Get Started"}
              </a>
            </div>
          </section>
        );

      case "custom":
        return (
          <section
            key={section.id}
            className={`section ${spacingClasses.section}`}
            style={{ backgroundColor: colors.backgroundColor }}
          >
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2
                  className={`section-title text-3xl font-bold text-center ${spacingClasses.text}`}
                  style={{ fontFamily: theme.headingFont, color: colors.textColor }}
                >
                  {section.title}
                </h2>
              )}
              {section.content && (
                <div
                  className="prose prose-lg max-w-none"
                  style={{ color: colors.textColor }}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily: theme.fontFamily,
        fontSize: theme.baseFontSize,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      {/* Custom CSS injection */}
      {theme.customCSS && <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />}

      {/* Dynamic Sections */}
      <main>
        {visibleSections.length > 0 ? (
          visibleSections.map((section) => renderSection(section))
        ) : (
          <div className="py-20 text-center opacity-50">
            No visible sections. Add one from the sidebar.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="footer py-8 text-center text-sm"
        style={{
          backgroundColor: addAlpha(theme.textColor, 0.05),
          color: theme.textColor,
          opacity: 0.8,
        }}
      >
        © {new Date().getFullYear()} {company.name}. All rights reserved.
      </footer>
    </div>
  );
};
