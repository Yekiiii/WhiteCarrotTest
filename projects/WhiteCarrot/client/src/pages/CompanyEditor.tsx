import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { type Company, type Section, type Job, type Content, type Theme } from "../types";
import { useAuth } from "../context/AuthContext";
import { EditorSidebar } from "../components/editor/EditorSidebar";
import { LivePreview } from "../components/editor/LivePreview";

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

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    setToast(null);

    try {
      await api.put(`/companies/${company._id}`, {
        theme: company.theme,
        content: company.content,
        sections: company.sections,
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
            ← Dashboard
          </Link>
          <span className="text-gray-400 text-sm">|</span>
          <span className="text-gray-300 text-sm">{company.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Share URL Button */}
          <button
            onClick={handleShareUrl}
            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-2"
            title="Copy careers page URL"
          >
            {copySuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </>
            )}
          </button>
          <Link
            to={`/${company.slug}/preview`}
            target="_blank"
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Open Preview ↗
          </Link>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Editor Controls (20% width) */}
        <aside className="w-80 flex-shrink-0 overflow-hidden">
          <EditorSidebar
            company={company}
            saving={saving}
            onThemeChange={handleThemeChange}
            onThemeBatchUpdate={handleThemeBatchUpdate}
            onContentChange={handleContentChange}
            onSectionsChange={handleSectionsChange}
            onSave={handleSave}
          />
        </aside>

        {/* Right Panel - Live Preview (80% width) */}
        <main className="flex-1 overflow-auto bg-gray-200 p-4">
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
      </div>
    </div>
  );
};
