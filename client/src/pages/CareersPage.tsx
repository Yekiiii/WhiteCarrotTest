import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import { type Company, type Job, type Section, type Theme, type SectionTheme } from "../types";

// Helper: Resolve Image URL
const resolveImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("/")) {
    return `http://localhost:5000${url}`;
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
        setLoading(true);
        
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
      } catch (err) {
        console.error(err);
        setError("Company not found");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyAndJobs();
  }, [companySlug, currentPage, searchTerm, locationFilter, jobTypeFilter]);

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
        const galleryImages = (section.config?.imageUrls as string[]) || [];
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
                {galleryImages.length > 0 ? (
                  galleryImages.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden"
                      style={{ borderRadius: theme.borderRadius }}
                    >
                      <img
                        src={resolveImageUrl(url)}
                        alt={`${company.name} gallery image ${i + 1}`}
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
          className="py-8 text-center text-sm"
          style={{
            backgroundColor: addAlpha(theme.textColor, 0.05),
            color: theme.textColor,
            opacity: 0.8,
          }}
          role="contentinfo"
        >
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </footer>
      </div>
  );
};
