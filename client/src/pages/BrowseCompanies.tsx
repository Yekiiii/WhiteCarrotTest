import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";

interface PublicCompany {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
  };
  theme: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    bannerUrl?: string;
  };
  content: {
    heroTitle?: string;
    heroSubtitle?: string;
  };
  jobCount: number;
  createdAt: string;
}

// Helper: Resolve Image URL
const resolveImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("/")) {
    return `https://whitecarrottest.onrender.com${url}`;
  }
  return url;
};

export const BrowseCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "jobs" | "recent">("jobs");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get<{ companies: PublicCompany[] }>("/companies/public");
        setCompanies(res.data.companies);
      } catch (err) {
        console.error(err);
        setError("Failed to load companies");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Filtered and sorted companies
  const filteredCompanies = useMemo(() => {
    let result = companies.filter((company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    switch (sortBy) {
      case "name":
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "jobs":
        result = result.sort((a, b) => b.jobCount - a.jobCount);
        break;
      case "recent":
        result = result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [companies, searchTerm, sortBy]);

  // Update document title
  useEffect(() => {
    document.title = "Browse Companies - WhiteCarrot Jobs";
    return () => {
      document.title = "WhiteCarrot";
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <style>{`
        /* Smooth, GPU-friendly background pan */
        .bg-animated {
          background-size: 400% 400%;
          animation: bgPan 18s cubic-bezier(.22,.9,.3,1) infinite;
          will-change: background-position, filter;
        }

        @keyframes bgPan {
          0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
          50% { background-position: 100% 50%; filter: hue-rotate(12deg); }
          100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
        }
      `}</style>
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white bg-animated">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/browse" className="text-xl font-bold tracking-wider hover:opacity-90 transition-opacity">
            WhiteCarrot
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              For Recruiters
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Explore career pages from amazing companies and discover roles that match your ambitions.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg"
                aria-label="Search companies"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredCompanies.length}</span>{" "}
              {filteredCompanies.length === 1 ? "company" : "companies"} hiring
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="sort-by" className="text-sm text-gray-600">
              Sort by:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "jobs" | "recent")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="jobs">Most Jobs</option>
              <option value="name">Alphabetical</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredCompanies.length === 0 && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No companies found</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No companies are currently hiring"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Companies Grid */}
        {filteredCompanies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link
                key={company._id}
                to={`/${company.slug}/careers`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200 hover:-translate-y-1"
              >
                {/* Banner/Header */}
                <div
                  className="h-24 relative"
                  style={{
                    backgroundColor: company.theme?.primaryColor || "#3B82F6",
                    backgroundImage: (company.bannerUrl || company.theme?.bannerUrl)
                      ? `url(${resolveImageUrl(company.bannerUrl || company.theme?.bannerUrl)})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {(company.bannerUrl || company.theme?.bannerUrl) && (
                    <div className="absolute inset-0 bg-black/20" />
                  )}
                </div>

                {/* Logo */}
                <div className="relative px-6">
                  <div className="absolute -top-8 left-6">
                    {(company.logoUrl || company.theme?.logoUrl) ? (
                      <img
                        src={resolveImageUrl(company.logoUrl || company.theme?.logoUrl)}
                        alt={`${company.name} logo`}
                        className="h-16 w-16 rounded-xl bg-white border-4 border-white shadow-md object-cover"
                      />
                    ) : (
                      <div
                        className="h-16 w-16 rounded-xl bg-white border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold"
                        style={{ color: company.theme?.primaryColor || "#3B82F6" }}
                      >
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-10 pb-6 px-6">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {company.name}
                  </h2>
                  {company.content?.heroSubtitle && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {company.content.heroSubtitle}
                    </p>
                  )}

                  {/* Job count badge */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {company.jobCount} {company.jobCount === 1 ? "job" : "jobs"}
                    </span>
                    <span className="text-blue-600 text-sm font-medium group-hover:underline">
                      View careers →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-lg font-bold text-gray-900">WhiteCarrot</span>
              <span className="text-sm text-gray-500">
                The modern careers page builder
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/login" className="hover:text-gray-900 transition-colors">
                Recruiter Login
              </Link>
              <Link to="/register" className="hover:text-gray-900 transition-colors">
                Post Jobs
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} WhiteCarrot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
