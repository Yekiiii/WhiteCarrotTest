import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { type Company, type Section, type Job, type Content, type Theme } from "../types";
import { useAuth } from "../context/AuthContext";
import { EditorSidebar } from "../components/editor/EditorSidebar";
import { LivePreview } from "../components/editor/LivePreview";

// Custom hook to detect screen size
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// Default theme structure
const DEFAULT_THEME: Theme = {
  primaryColor: "#3B82F6",
  secondaryColor: "#1E40AF",
  accentColor: "#10B981",
  backgroundColor: "#FFFFFF",
  textColor: "#1F2937",
  fontFamily: "Inter, system-ui, sans-serif",
  headingFont: "Inter, system-ui, sans-serif",
  baseFontSize: "16px",
  borderRadius: "0.5rem",
  spacing: "normal",
  buttonStyle: "rounded",
  logoUrl: "",
  bannerUrl: "",
  cultureVideoUrl: "",
  preset: "",
  customCSS: "",
};

// Default content structure for new companies
const DEFAULT_CONTENT: Content = {
  heroTitle: "Join Our Team",
  heroSubtitle: "Build the future with us",
  aboutTitle: "About Us",
  aboutText: "We are a team dedicated to excellence and innovation.",
  cultureTitle: "Our Culture",
  cultureText: "Experience what it's like to work with us.",
  jobsTitle: "Open Positions",
  jobsSubtitle: "Find the role that fits you best",
};

export const CompanyEditor: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [showCloud, setShowCloud] = useState(false);

  // Detect if we're at tablet width or below (1024px breakpoint)
  const isTabletOrBelow = useMediaQuery('(max-width: 1024px)');

  // Show the "cloud" notification when switching to tablet/mobile view
  useEffect(() => {
    if (isTabletOrBelow) {
      setShowCloud(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShowCloud(false), 10000);
      return () => clearTimeout(timer);
    } else {
      setShowCloud(false);
    }
  }, [isTabletOrBelow]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShareUrl = () => {
    if (!company) return;
    const careersUrl = `${window.location.origin}/${company.slug}/careers`;
    navigator.clipboard.writeText(careersUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [token]);
  
  // Refetch jobs when page changes
  useEffect(() => {
     if (company) {
       fetchJobs(company._id, jobsPage);
     }
  }, [jobsPage]);

  const fetchJobs = async (companyId: string, page: number) => {
    try {
      const jobsRes = await api.get<{ jobs: Job[], total: number, pages: number }>(
          `/jobs/public/${companyId}?page=${page}&limit=9`
          // Using public endpoint to get paginated results easily. 
          // Alternatively, update authenticated endpoint to support pagination.
          // Since user has auth, we might want to use authenticated endpoint /companies/:id/jobs 
          // checking backend: /companies/:companyId/jobs supports pagination now too because update was to controller.
      );
      setJobs(jobsRes.data.jobs);
      setJobsTotalPages(jobsRes.data.pages);
    } catch (error) {
       console.error("Error fetching jobs pagination:", error);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch company
      const companyRes = await api.get<{ company: Company }>("/companies/me");
      const companyData = companyRes.data.company;
      
      // Ensure content object exists (backward compatibility)
      if (!companyData.content) {
        companyData.content = DEFAULT_CONTENT;
      }
      
      // Ensure theme object has all fields (backward compatibility)
      companyData.theme = { ...DEFAULT_THEME, ...companyData.theme };
      
      setCompany(companyData);

      // Fetch jobs (initial page 1)
      await fetchJobs(companyData._id, 1);

    } catch (err: any) {
      console.error(err);
      setError("Failed to load company data.");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (field: string, value: string) => {
    if (!company) return;
    setCompany({
      ...company,
      theme: { ...company.theme, [field]: value },
    });
  };

  const handleThemeBatchUpdate = (updates: Partial<Theme>) => {
    if (!company) return;
    setCompany({
      ...company,
      theme: { ...company.theme, ...updates },
    });
  };

  const handleContentChange = (field: string, value: string) => {
    if (!company) return;
    setCompany({
      ...company,
      content: { ...company.content, [field]: value },
    });
  };

  const handleSectionsChange = (newSections: Section[]) => {
    if (!company) return;
    setCompany({ ...company, sections: newSections });
  };

  const handleCompanyChange = (updates: Partial<Company>) => {
    if (!company) return;
    setCompany({ ...company, ...updates });
  };

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    setToast(null);

    try {
      await api.put(`/companies/${company._id}`, {
        theme: company.theme,
        content: company.content,
        sections: company.sections,
        logoUrl: company.logoUrl,
        bannerUrl: company.bannerUrl,
        description: company.description,
        socialLinks: company.socialLinks,
      });
      setToast({ type: "success", message: "Changes saved successfully!" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading editor...</span>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Company not found."}</p>
          <button onClick={() => navigate("/login")} className="text-blue-600 hover:underline">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <header className="h-14 bg-gray-900 text-white flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="font-semibold hover:text-blue-300 transition-colors">
            ← <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="text-gray-400 text-sm hidden sm:inline">|</span>
          <span className="text-gray-300 text-sm truncate max-w-[120px] sm:max-w-none">{company.name}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share URL Button */}
          <button
            onClick={handleShareUrl}
            className="px-2 sm:px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-2"
            title="Copy careers page URL"
          >
            {copySuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
          <Link
            to={`/${company.slug}/preview`}
            target="_blank"
            className="px-2 sm:px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center gap-1"
          >
            <span className="hidden sm:inline">Preview</span>
            <span>↗</span>
          </Link>
          <button
            onClick={logout}
            className="px-2 sm:px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Main Content: Sidebar + Preview */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop: Left Sidebar - Editor Controls (fixed width) */}
        {!isTabletOrBelow && (
          <aside className="w-80 flex-shrink-0 overflow-hidden">
            <EditorSidebar
              company={company}
              saving={saving}
              onThemeChange={handleThemeChange}
              onThemeBatchUpdate={handleThemeBatchUpdate}
              onContentChange={handleContentChange}
              onSectionsChange={handleSectionsChange}
              onCompanyChange={handleCompanyChange}
              onSave={handleSave}
            />
          </aside>
        )}

        {/* Right Panel - Live Preview */}
        <main className={`flex-1 overflow-auto bg-gray-200 p-2 sm:p-4 ${isTabletOrBelow ? 'pb-20' : ''}`}>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-full">
            <LivePreview 
              company={company} 
              jobs={jobs} 
              jobsPagination={{
                currentPage: jobsPage,
                totalPages: jobsTotalPages,
                onPageChange: setJobsPage
              }}
            />
          </div>
        </main>

        {/* Mobile/Tablet: Bottom Sheet Toggle Button */}
        {isTabletOrBelow && (
          <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
            {/* Educational Cloud/Tooltip */}
            {showCloud && !bottomSheetOpen && (
              <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-bounce relative mr-2 max-w-[200px] text-center">
                <div className="flex items-center gap-2">
                  <span>Editor panel shifted here!</span>
                  <button 
                    onClick={() => setShowCloud(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Speech Bubble Pointer */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-indigo-600 rotate-45 shadow-2xl" />
              </div>
            )}
            
            <button
              onClick={() => {
                setBottomSheetOpen(true);
                setShowCloud(false);
              }}
              className="bg-gray-900 text-white p-4 rounded-full shadow-xl hover:bg-gray-800 transition-all active:scale-95 group relative"
              aria-label="Open editor panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {/* Optional Pulse Effect when cloud is shown */}
              {showCloud && (
                <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20" />
              )}
            </button>
          </div>
        )}

        {/* Mobile/Tablet: Bottom Sheet Overlay */}
        {isTabletOrBelow && bottomSheetOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setBottomSheetOpen(false)}
          />
        )}

        {/* Mobile/Tablet: Bottom Sheet Panel */}
        {isTabletOrBelow && (
          <div 
            className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
              bottomSheetOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ height: '85vh', maxHeight: '85vh' }}
          >
            {/* Bottom Sheet Handle */}
            <div 
              className="flex justify-center py-3 cursor-pointer border-b border-gray-100"
              onClick={() => setBottomSheetOpen(false)}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            
            {/* Bottom Sheet Close Button */}
            <button
              onClick={() => setBottomSheetOpen(false)}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close editor panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Editor Sidebar Content */}
            <div className="h-full overflow-hidden">
              <EditorSidebar
                company={company}
                saving={saving}
                onThemeChange={handleThemeChange}
                onThemeBatchUpdate={handleThemeBatchUpdate}
                onContentChange={handleContentChange}
                onSectionsChange={handleSectionsChange}
                onCompanyChange={handleCompanyChange}
                onSave={() => {
                  handleSave();
                  // Close bottom sheet after save on mobile
                  setTimeout(() => setBottomSheetOpen(false), 500);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
