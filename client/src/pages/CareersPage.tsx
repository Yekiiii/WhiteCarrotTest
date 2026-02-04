import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import { type Company, type Job, type Section, type Theme, type SectionTheme } from "../types";

// Helper: Resolve Image URL
const resolveImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("/")) {
    return `https://whitecarrottest.onrender.com${url}`;
  }
  return url;
};

// Helper: Resolve header style for hero section
const resolveHeaderStyle = (section: Section, theme: Theme): React.CSSProperties => {
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
  return headerStyle;
};

// Helper to add alpha to hex color
const addAlpha = (color: string, opacity: number) => {
  if (!color) return color;
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0");
    if (hex.length === 3) {
      return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${alpha}`;
    }
    return `#${hex}${alpha}`;
  }
  return color;
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
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// Generate JSON-LD for JobPosting
const generateJobPostingJsonLd = (job: Job, company: Company) => ({
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  title: job.title,
  description: job.description,
  datePosted: job.createdAt,
  hiringOrganization: {
    "@type": "Organization",
    name: company.name,
    logo: company.theme?.logoUrl ? resolveImageUrl(company.theme.logoUrl) : undefined,
  },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: job.location,
    },
  },
  employmentType: job.jobType?.replace("-", "_").toUpperCase(),
});

// Custom hook to manage document head for SEO
const useDocumentHead = (company: Company | null, jobs: Job[]) => {
  useEffect(() => {
    if (!company) return;

    const metaDescription = `Explore career opportunities at ${company.name}. Browse our open positions and join our team.`;
    
    // Set title
    document.title = `${company.name} - Careers`;

    // Helper to create or update meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Meta description
    setMetaTag("description", metaDescription);

    // OpenGraph tags
    setMetaTag("og:title", `${company.name} - Careers`, true);
    setMetaTag("og:description", metaDescription, true);
    setMetaTag("og:type", "website", true);
    if (company.theme?.logoUrl) {
      setMetaTag("og:image", resolveImageUrl(company.theme.logoUrl), true);
    }

    // Twitter Card
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", `${company.name} - Careers`);
    setMetaTag("twitter:description", metaDescription);

    // JobPosting JSON-LD
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (jobs.length > 0) {
      const jsonLd = jobs.map((job) => generateJobPostingJsonLd(job, company));
      if (!jsonLdScript) {
        jsonLdScript = document.createElement("script");
        jsonLdScript.setAttribute("type", "application/ld+json");
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup
    return () => {
      document.title = "WhiteCarrot";
    };
  }, [company, jobs]);
};

import { Pagination } from "../components/ui/Pagination";

// ... existing imports

export const CareersPage: React.FC = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const JOBS_PER_PAGE = 9;

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  
  // Initial loading state
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Debounce search to prevent excessive API calls
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, jobTypeFilter]);

  // SEO: Update document head
  useDocumentHead(company, jobs);

  useEffect(() => {
    const fetchCompanyAndJobs = async () => {
      try {
        if (!companySlug) return;
        if (initialLoading) setLoading(true);
        
        // 1. Fetch Company
        const companyRes = await api.get<{ company: Company }>(
          `/companies/public/${companySlug}`
        );
        const companyData = companyRes.data.company;
        setCompany(companyData);

        // 2. Fetch Jobs (with filters & pagination)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: JOBS_PER_PAGE.toString(),
          search: searchTerm,
          location: locationFilter,
          jobType: jobTypeFilter
        });

        const jobsRes = await api.get<{ jobs: Job[], total: number, pages: number }>(
          `/jobs/public/${companyData._id}?${params.toString()}`
        );
        
        setJobs(jobsRes.data.jobs);
        setTotalPages(jobsRes.data.pages);
        setInitialLoading(false);
      } catch (err) {
        console.error(err);
        setError("Company not found");
        setInitialLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyAndJobs();
  }, [companySlug, currentPage, searchTerm, locationFilter, jobTypeFilter, initialLoading]);

  // Extract unique locations and job types - NOTE: This ideally should come from backend aggregation 
  // since we only fetch one page of jobs now. For now, we might lose some filter options if they aren't on page 1.
  // To fix this properly, we'd need a separate endpoint for "available filters" or fetch ALL for filters.
  // For simplicity in this iteration, we accept filters might be limited to current view 
  // OR we can implement a separate "metadata" fetch.
  // Let's rely on what we have or implement a quick "get all filters" if needed.
  // Actually, standard pattern is to show filters based on query results or pre-fetch facets.
  // I will keep the useMemo logic but be aware it only filters within fetched jobs unless I change it.
  // Wait, if I'm filtering on backend, the frontend filtering logic inside useMemo is redundant/wrong 
  // because `jobs` is already filtered.
  // I should REMOVE frontend filtering and rely on the API response.
  
  // Since we are now server-side filtering, we don't need useMemo for filteredJobs.
  // BUT we do need to populate the dropdowns. 
  // Ideally, I should fetch "facets" from backend. 
  // I'll skip dynamic facets for now and hardcode standard ones or user-provided ones if I had them.
  // Or I can do a separate lightweight fetch for "all job locations" if critical.
  // For now, let's just show options from the current page + standard options or maybe just text input for location.
  // Let's stick to text input for location to avoid empty dropdowns.
  
  // ... refactoring render to use `jobs` directly instead of `filteredJobs`


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company not found</h1>
          <p className="text-gray-600">{error || "This careers page doesn't exist."}</p>
        </div>
      </div>
    );
  }

  const sortedSections = [...company.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const { theme, content } = company;
  const hasHeroSection = sortedSections.some((s) => s.type === "hero");

  // Render sections (excluding jobs, which we handle separately with filters)
  const renderSection = (section: Section) => {
    const colors = getSectionColors(theme, section.theme);

    switch (section.type) {
      case "hero":
        return (
          <header
            key={section.id}
            className="relative text-white"
            style={resolveHeaderStyle(section, theme)}
            role="banner"
          >
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: section.config?.overlayOpacity ?? 0.5 }}
              aria-hidden="true"
            />
            <div className="relative max-w-4xl mx-auto py-20 px-4 text-center">
              {(company.logoUrl || theme.logoUrl) && (
                <img
                  src={resolveImageUrl(company.logoUrl || theme.logoUrl)}
                  alt={`${company.name} Logo`}
                  className="h-20 w-20 object-contain bg-white rounded-full p-2 mx-auto mb-6"
                />
              )}
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: theme.headingFont }}
              >
                {section.title || content.heroTitle}
              </h1>
              <p className="text-xl text-white/90">
                {section.subtitle || content.heroSubtitle}
              </p>
            </div>
          </header>
        );

      case "text":
        return (
          <section
            key={section.id}
            className="py-16 px-6"
            style={{ backgroundColor: colors.backgroundColor }}
            aria-labelledby={`section-${section.id}`}
          >
            <div
              className={`max-w-4xl mx-auto ${
                section.config?.layout === "left"
                  ? "text-left"
                  : section.config?.layout === "right"
                  ? "text-right"
                  : "text-center"
              }`}
            >
              <h2
                id={`section-${section.id}`}
                className="text-3xl font-bold mb-4"
                style={{ color: colors.textColor }}
              >
                {section.title}
              </h2>
              {section.subtitle && (
                <p
                  className="text-lg mb-6"
                  style={{ color: colors.textColor, opacity: 0.7 }}
                >
                  {section.subtitle}
                </p>
              )}
              <p
                className="text-lg whitespace-pre-wrap"
                style={{ color: colors.textColor, opacity: 0.8 }}
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
            className="py-16 px-6"
            style={{ backgroundColor: colors.backgroundColor }}
            aria-labelledby={`section-${section.id}`}
          >
            <div className="max-w-6xl mx-auto">
              <h2
                id={`section-${section.id}`}
                className="text-3xl font-bold text-center mb-8"
                style={{ color: colors.textColor }}
              >
                {section.title}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                          alt={img.caption || `${company.name} gallery image ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {img.caption && (
                        <div 
                          className="p-3 text-center text-sm"
                          style={{ 
                            backgroundColor: addAlpha(colors.textColor, 0.05),
                            color: colors.textColor,
                            opacity: 0.8 
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
                      <span style={{ color: colors.textColor, opacity: 0.4 }}>
                        Image {i}
                      </span>
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
            className="py-16 px-6"
            style={{ backgroundColor: colors.backgroundColor }}
            aria-labelledby={`section-${section.id}`}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2
                id={`section-${section.id}`}
                className="text-3xl font-bold mb-8"
                style={{ color: colors.textColor }}
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
                    loading="lazy"
                  />
                </div>
              ) : (
                <div
                  className="aspect-video w-full max-w-3xl mx-auto flex items-center justify-center"
                  style={{
                    backgroundColor: addAlpha(colors.accentColor, 0.1),
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <span style={{ color: colors.textColor, opacity: 0.5 }}>
                    Video placeholder
                  </span>
                </div>
              )}
            </div>
          </section>
        );

      case "jobs":
        // Render jobs section with filters
        return (
          <section
            key={section.id}
            className="py-16 px-6"
            style={{ backgroundColor: colors.backgroundColor }}
            aria-labelledby={`section-${section.id}`}
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2
                  id={`section-${section.id}`}
                  className="text-3xl font-bold mb-4"
                  style={{ color: colors.textColor }}
                >
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p style={{ color: colors.textColor, opacity: 0.7 }}>
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location Filter (Text Input for now as we don't have facets) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote, Berlin"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Job Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job type</label>
                    <select
                      value={jobTypeFilter}
                      onChange={(e) => setJobTypeFilter(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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

              {/* Job Listings */}
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg" style={{ color: colors.textColor, opacity: 0.6 }}>
                    No jobs found.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {jobs.map((job) => (
                      <article
                        key={job._id}
                        className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-200 group"
                        style={{ borderRadius: theme.borderRadius }}
                      >
                         <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className="text-xl font-bold group-hover:text-blue-600 transition-colors"
                            style={{ color: colors.textColor }}
                          >
                            {job.title}
                          </h3>
                          <div
                            className="mt-2 flex flex-wrap items-center gap-3 text-sm"
                            style={{ color: colors.textColor, opacity: 0.6 }}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {/* Location Icon */}
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                               {/* Type Icon */}
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
                        style={{ color: colors.textColor, opacity: 0.7 }}
                      >
                        {job.description}
                      </p>
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <span
                          className="inline-block px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                          style={{
                            backgroundColor: addAlpha(colors.accentColor, 0.1),
                            color: colors.accentColor,
                          }}
                        >
                          View Details →
                        </span>
                      </div>
                      </article>
                    ))}
                  </div>

                  {/* Pagination Control */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    theme={{
                      primaryColor: colors.accentColor || theme.accentColor,
                      textColor: colors.textColor || theme.textColor,
                      borderRadius: theme.borderRadius,
                    }}
                  />
                </>
              )}
            </div>
          </section>
        );

      case "cta":
        return (
          <section
            key={section.id}
            className="py-16 px-6"
            style={{ backgroundColor: colors.backgroundColor }}
            aria-labelledby={`section-${section.id}`}
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2
                id={`section-${section.id}`}
                className="text-3xl font-bold mb-4"
                style={{ color: colors.textColor }}
              >
                {section.title}
              </h2>
              {section.subtitle && (
                <p
                  className="text-lg mb-8"
                  style={{ color: colors.textColor, opacity: 0.7 }}
                >
                  {section.subtitle}
                </p>
              )}
              <a
                href={section.config?.ctaButtonUrl || "#"}
                className="inline-block px-6 py-3 text-white font-semibold rounded-md transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: colors.accentColor,
                  borderRadius: theme.borderRadius,
                }}
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
            className="py-16 px-6"
            style={{ backgroundColor: colors.backgroundColor }}
            aria-labelledby={`section-${section.id}`}
          >
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2
                  id={`section-${section.id}`}
                  className="text-3xl font-bold text-center mb-6"
                  style={{ color: colors.textColor }}
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
      className="min-h-screen"
      style={{ fontFamily: theme.fontFamily, backgroundColor: theme.backgroundColor }}
    >
      {/* Custom CSS injection */}
      {theme.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />
      )}

      {/* Legacy Hero Fallback (if no hero section exists) */}
      {!hasHeroSection && (
        <header
          className="relative text-white"
          style={{
            backgroundColor: theme.primaryColor,
            backgroundImage: theme.bannerUrl
              ? `url(${resolveImageUrl(theme.bannerUrl)})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          role="banner"
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
            <div className="relative max-w-4xl mx-auto py-20 px-4 text-center">
              {theme.logoUrl && (
                <img
                  src={resolveImageUrl(theme.logoUrl)}
                  alt={`${company.name} Logo`}
                  className="h-20 w-20 object-contain bg-white rounded-full p-2 mx-auto mb-6"
                />
              )}
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: theme.headingFont }}
              >
                {content.heroTitle}
              </h1>
              <p className="text-xl text-white/90">{content.heroSubtitle}</p>
            </div>
          </header>
        )}

        <main role="main">
          {sortedSections.map((section) => renderSection(section))}
        </main>

        <footer
          className="py-10 text-center"
          style={{
            backgroundColor: addAlpha(theme.textColor, 0.05),
            color: theme.textColor,
          }}
          role="contentinfo"
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
