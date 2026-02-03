import React, { useEffect, useState } from "react";
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

// Start of LivePreview logic (reused for consistency)
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
}

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

export const CompanyPreview: React.FC = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!companySlug) return;
        const companyRes = await api.get<{ company: Company }>(`/companies/public/${companySlug}`);
        const companyData = companyRes.data.company;
        setCompany(companyData);

        const jobsRes = await api.get<{ jobs: Job[] }>(
          `/companies/${companyData._id}/jobs`
        );
        setJobs(jobsRes.data.jobs);
      } catch (err) {
        console.error(err);
        setError("Failed to load preview data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companySlug]);

  if (loading) return <div className="p-10 text-center">Loading preview...</div>;
  if (!company) return <div className="p-10 text-center text-red-500">{error}</div>;

  const sortedSections = [...company.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const { theme, content } = company;
  const hasHeroSection = sortedSections.some(s => s.type === "hero");

  const renderSection = (section: Section) => {
    const colors = getSectionColors(theme, section.theme);

    switch (section.type) {
      case "hero":
        return (
            <header key={section.id} className="relative text-white" style={resolveHeaderStyle(section, theme)}>
                <div className="absolute inset-0 bg-black" style={{ opacity: section.config?.overlayOpacity ?? 0.5 }} />
                <div className="relative max-w-4xl mx-auto py-20 px-4 text-center">
                {theme.logoUrl && <img src={resolveImageUrl(theme.logoUrl)} alt={`${company.name} Logo`} className="h-20 w-20 object-contain bg-white rounded-full p-2 mx-auto mb-6" />}
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: theme.headingFont }}>{section.title || content.heroTitle}</h1>
                <p className="text-xl text-white/90">{section.subtitle || content.heroSubtitle}</p>
                </div>
            </header>
        );

      case "text":
        return (
          <section key={section.id} className="py-16 px-6" style={{ backgroundColor: colors.backgroundColor }}>
            <div className={`max-w-4xl mx-auto ${section.config?.layout === 'left' ? 'text-left' : section.config?.layout === 'right' ? 'text-right' : 'text-center'}`}>
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.textColor }}>{section.title}</h2>
              {section.subtitle && <p className="text-lg mb-6" style={{ color: colors.textColor, opacity: 0.7 }}>{section.subtitle}</p>}
              <p className="text-lg whitespace-pre-wrap" style={{ color: colors.textColor, opacity: 0.8 }}>{section.content}</p>
            </div>
          </section>
        );

      case "gallery":
        const galleryImages = (section.config?.imageUrls as string[]) || [];
        return (
          <section key={section.id} className="py-16 px-6" style={{ backgroundColor: colors.backgroundColor }}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8" style={{ color: colors.textColor }}>{section.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.length > 0 ? (
                  galleryImages.map((url, i) => (
                    <div key={i} className="aspect-square overflow-hidden" style={{ borderRadius: theme.borderRadius }}>
                      <img src={resolveImageUrl(url)} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square flex items-center justify-center" style={{ backgroundColor: addAlpha(colors.accentColor, 0.1), borderRadius: theme.borderRadius }}>
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
          <section key={section.id} className="py-16 px-6" style={{ backgroundColor: colors.backgroundColor }}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8" style={{ color: colors.textColor }}>{section.title}</h2>
              {embedUrl ? (
                <div className="aspect-video w-full max-w-3xl mx-auto shadow-lg overflow-hidden" style={{ borderRadius: theme.borderRadius }}>
                  <iframe src={embedUrl} title={section.title} className="w-full h-full" allowFullScreen />
                </div>
              ) : (
                <div className="aspect-video w-full max-w-3xl mx-auto flex items-center justify-center" style={{ backgroundColor: addAlpha(colors.accentColor, 0.1), borderRadius: theme.borderRadius }}>
                  <span style={{ color: colors.textColor, opacity: 0.5 }}>Video placeholder</span>
                </div>
              )}
            </div>
          </section>
        );

      case "jobs":
        return (
          <section key={section.id} className="py-16 px-6" style={{ backgroundColor: colors.backgroundColor }}>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.textColor }}>{section.title}</h2>
                {section.subtitle && <p style={{ color: colors.textColor, opacity: 0.7 }}>{section.subtitle}</p>}
              </div>
              {jobs.length === 0 ? (
                <p className="text-center" style={{ color: colors.textColor, opacity: 0.5 }}>No open positions at the moment.</p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {jobs.map((job) => (
                    <div key={job._id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: theme.borderRadius }}>
                      <h3 className="text-xl font-bold" style={{ color: colors.textColor }}>{job.title}</h3>
                      <div className="mt-2 flex items-center gap-4 text-sm" style={{ color: colors.textColor, opacity: 0.6 }}>
                        <span>📍 {job.location}</span>
                        <span>💼 {job.jobType}</span>
                      </div>
                      <p className="mt-4 line-clamp-3" style={{ color: colors.textColor, opacity: 0.7 }}>{job.description}</p>
                      <div className="mt-6">
                        <button className="text-white px-4 py-2 rounded-md font-medium" style={{ backgroundColor: colors.accentColor, borderRadius: theme.borderRadius }}>Apply Now</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case "cta":
        return (
          <section key={section.id} className="py-16 px-6" style={{ backgroundColor: colors.backgroundColor }}>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.textColor }}>{section.title}</h2>
              {section.subtitle && <p className="text-lg mb-8" style={{ color: colors.textColor, opacity: 0.7 }}>{section.subtitle}</p>}
              <a href={section.config?.ctaButtonUrl || "#"} className="inline-block px-6 py-3 text-white font-semibold rounded-md" style={{ backgroundColor: colors.accentColor, borderRadius: theme.borderRadius }}>
                {section.config?.ctaButtonText || "Get Started"}
              </a>
            </div>
          </section>
        );

      case "custom":
        return (
          <section key={section.id} className="py-16 px-6" style={{ backgroundColor: colors.backgroundColor }}>
            <div className="max-w-4xl mx-auto">
              {section.title && <h2 className="text-3xl font-bold text-center mb-6" style={{ color: colors.textColor }}>{section.title}</h2>}
              {section.content && <div className="prose prose-lg max-w-none" style={{ color: colors.textColor }} dangerouslySetInnerHTML={{ __html: section.content }} />}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: theme.fontFamily, backgroundColor: theme.backgroundColor }}>
      <meta name="robots" content="noindex" />

      {/* Custom CSS injection */}
      {theme.customCSS && <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />}

      {/* Legacy Hero Fallback (if no hero section exists) */}
      {!hasHeroSection && (
        <header className="relative text-white" style={{ backgroundColor: theme.primaryColor, backgroundImage: theme.bannerUrl ? `url(${resolveImageUrl(theme.bannerUrl)})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative max-w-4xl mx-auto py-20 px-4 text-center">
            {theme.logoUrl && <img src={resolveImageUrl(theme.logoUrl)} alt={`${company.name} Logo`} className="h-20 w-20 object-contain bg-white rounded-full p-2 mx-auto mb-6" />}
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: theme.headingFont }}>{content.heroTitle}</h1>
            <p className="text-xl text-white/90">{content.heroSubtitle}</p>
            </div>
        </header>
      )}

      <main>{sortedSections.map((section) => renderSection(section))}</main>

      <footer className="py-8 text-center text-sm" style={{ backgroundColor: addAlpha(theme.textColor, 0.05), color: theme.textColor, opacity: 0.8 }}>
        © {new Date().getFullYear()} {company.name}. All rights reserved.
      </footer>
    </div>
  );
};
