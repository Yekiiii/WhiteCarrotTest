import React, { useState, useMemo } from "react";
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

  // Filter states for jobs section
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");

  // Filter jobs based on search criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !locationFilter || 
        job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesType = !jobTypeFilter || job.jobType === jobTypeFilter;
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [jobs, searchTerm, locationFilter, jobTypeFilter]);

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
              {(company.logoUrl || theme.logoUrl) && (
                <img
                  src={resolveImageUrl(company.logoUrl || theme.logoUrl)}
                  alt={`${company.name} Logo`}
                  className="mx-auto mb-6 bg-white rounded-full p-2 object-contain"
                  style={{ height: "5rem", width: "5rem", borderRadius: "9999px" }}
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
        // Support both legacy imageUrls and new images format with captions
        const galleryImagesData = section.config?.images || 
          (section.config?.imageUrls || []).map((url: string) => ({ url, caption: "" }));
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
                {galleryImagesData.length > 0 ? (
                  galleryImagesData.map((img: { url: string; caption?: string }, i: number) => (
                    <div
                      key={i}
                      className="overflow-hidden"
                      style={{ borderRadius: theme.borderRadius }}
                    >
                      <div className="aspect-square">
                        <img
                          src={resolveImageUrl(img.url)}
                          alt={img.caption || `Gallery ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {img.caption && (
                        <div 
                          className="p-3 text-center text-sm"
                          style={{ 
                            backgroundColor: addAlpha(colors.textColor, 0.05),
                            color: colors.textColor,
                            opacity: 0.8,
                            fontFamily: theme.fontFamily 
                          }}
                        >
                          {img.caption}
                        </div>
                      )}
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

              {/* Job Filters */}
              <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search jobs</label>
                    <input
                      type="text"
                      placeholder="Title or keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote, Berlin"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Job Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job type</label>
                    <select
                      value={jobTypeFilter}
                      onChange={(e) => setJobTypeFilter(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none transition-all cursor-pointer"
                    >
                      <option value="">All types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchTerm || locationFilter || jobTypeFilter) && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setLocationFilter("");
                        setJobTypeFilter("");
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg" style={{ color: colors.textColor, opacity: 0.6 }}>
                    {jobs.length === 0 ? "No open positions at the moment." : "No jobs match your filters."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {filteredJobs.map((job) => (
                      <article
                        key={job._id}
                        className="job-card bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-200 group"
                        style={{ borderRadius: theme.borderRadius }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3
                              className="job-title text-xl font-bold transition-colors"
                              style={{ fontFamily: theme.headingFont, color: colors.textColor }}
                            >
                              {job.title}
                            </h3>
                            <div
                              className="mt-2 flex flex-wrap items-center gap-3 text-sm"
                              style={{ color: colors.textColor, opacity: 0.6 }}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {job.jobType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p
                          className="mt-4 line-clamp-3 text-sm leading-relaxed"
                          style={{ fontFamily: theme.fontFamily, color: colors.textColor, opacity: 0.7 }}
                        >
                          {job.description}
                        </p>
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <span
                            className="apply-button inline-block px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                            style={{
                              backgroundColor: addAlpha(colors.accentColor, 0.1),
                              color: colors.accentColor,
                              borderRadius: theme.borderRadius,
                            }}
                          >
                            View Details →
                          </span>
                        </div>
                      </article>
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
        className="footer py-10 text-center"
        style={{
          backgroundColor: addAlpha(theme.textColor, 0.05),
          color: theme.textColor,
        }}
      >
        {/* Social Links */}
        {company.socialLinks && Object.values(company.socialLinks).some(v => v) && (
          <div className="flex justify-center gap-4 mb-6">
            {company.socialLinks.linkedin && (
              <a
                href={company.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: addAlpha(theme.accentColor, 0.1), color: theme.accentColor }}
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
            {company.socialLinks.twitter && (
              <a
                href={company.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: addAlpha(theme.accentColor, 0.1), color: theme.accentColor }}
                aria-label="Twitter / X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {company.socialLinks.instagram && (
              <a
                href={company.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: addAlpha(theme.accentColor, 0.1), color: theme.accentColor }}
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            )}
            {company.socialLinks.facebook && (
              <a
                href={company.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: addAlpha(theme.accentColor, 0.1), color: theme.accentColor }}
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {company.socialLinks.youtube && (
              <a
                href={company.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: addAlpha(theme.accentColor, 0.1), color: theme.accentColor }}
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
            {company.socialLinks.website && (
              <a
                href={company.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: addAlpha(theme.accentColor, 0.1), color: theme.accentColor }}
                aria-label="Website"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            )}
          </div>
        )}
        <p className="text-sm" style={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
