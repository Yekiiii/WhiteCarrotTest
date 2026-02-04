import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { type Company, type Job } from '../types';
import { useAuth } from '../context/AuthContext';

// Dummy job templates
const DUMMY_JOBS = [
  {
    id: 'frontend-dev',
    title: 'Senior Frontend Developer',
    location: 'Remote',
    jobType: 'Full-time',
    description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building user interfaces using React, TypeScript, and modern CSS. The ideal candidate has 5+ years of experience and a passion for creating beautiful, performant web applications.',
    category: 'Engineering',
  },
  {
    id: 'backend-dev',
    title: 'Backend Engineer',
    location: 'New York, NY',
    jobType: 'Full-time',
    description: 'Join our backend team to build scalable APIs and microservices. You will work with Node.js, Python, and cloud technologies like AWS. We value clean code, thorough testing, and collaborative problem-solving.',
    category: 'Engineering',
  },
  {
    id: 'product-designer',
    title: 'Product Designer',
    location: 'San Francisco, CA',
    jobType: 'Full-time',
    description: 'We are seeking a talented Product Designer to create intuitive and visually stunning user experiences. You will collaborate with product managers and engineers to design features from concept to launch. Proficiency in Figma and a strong portfolio required.',
    category: 'Design',
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    location: 'Remote',
    jobType: 'Full-time',
    description: 'Lead product strategy and roadmap for our core platform. You will work closely with engineering, design, and stakeholders to deliver features that delight users. 3+ years of PM experience in B2B SaaS preferred.',
    category: 'Product',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    location: 'Austin, TX',
    jobType: 'Full-time',
    description: 'Analyze large datasets to uncover insights that drive business decisions. You will build dashboards, create reports, and work with stakeholders across the company. Experience with SQL, Python, and visualization tools required.',
    category: 'Data',
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    location: 'Remote',
    jobType: 'Full-time',
    description: 'Build and maintain our CI/CD pipelines, cloud infrastructure, and monitoring systems. Experience with Kubernetes, Docker, Terraform, and AWS is essential. Join us in building reliable, scalable systems.',
    category: 'Engineering',
  },
  {
    id: 'marketing-manager',
    title: 'Marketing Manager',
    location: 'Los Angeles, CA',
    jobType: 'Full-time',
    description: 'Drive our marketing strategy across digital channels. You will manage campaigns, analyze performance metrics, and collaborate with the content team. 4+ years of B2B marketing experience preferred.',
    category: 'Marketing',
  },
  {
    id: 'customer-success',
    title: 'Customer Success Manager',
    location: 'Chicago, IL',
    jobType: 'Full-time',
    description: 'Be the voice of our customers and ensure their success with our platform. You will onboard new clients, provide training, and identify opportunities for expansion. Strong communication skills and empathy are key.',
    category: 'Customer Success',
  },
  {
    id: 'intern-software',
    title: 'Software Engineering Intern',
    location: 'Remote',
    jobType: 'Internship',
    description: 'Join our engineering team for a summer internship. You will work on real projects, learn from experienced engineers, and contribute to our product. Currently pursuing a CS degree or equivalent experience required.',
    category: 'Engineering',
  },
  {
    id: 'sales-rep',
    title: 'Sales Development Representative',
    location: 'Boston, MA',
    jobType: 'Full-time',
    description: 'Generate leads and set meetings for our sales team. You will reach out to prospects, qualify opportunities, and be the first point of contact for potential customers. Great opportunity for career growth in sales.',
    category: 'Sales',
  },
  {
    id: 'ux-researcher',
    title: 'UX Researcher',
    location: 'Seattle, WA',
    jobType: 'Full-time',
    description: 'Conduct user research to inform product decisions. You will plan and execute studies, synthesize findings, and present insights to stakeholders. Experience with qualitative and quantitative research methods required.',
    category: 'Design',
  },
  {
    id: 'qa-engineer',
    title: 'QA Engineer',
    location: 'Remote',
    jobType: 'Contract',
    description: 'Ensure the quality of our software through manual and automated testing. You will write test cases, identify bugs, and work with developers to resolve issues. Experience with Cypress or Playwright is a plus.',
    category: 'Engineering',
  },
];

const CATEGORIES = ['All', 'Engineering', 'Design', 'Product', 'Data', 'Marketing', 'Customer Success', 'Sales'];

export const AddJobs: React.FC = () => {
  const { logout } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [existingJobs, setExistingJobs] = useState<Job[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('manage');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCompanyAndJobs = async () => {
    try {
      const { data } = await api.get<{ company: Company }>('/companies/me');
      setCompany(data.company);
      
      // Fetch existing jobs
      const jobsRes = await api.get<{ jobs: Job[] }>(`/jobs/public/${data.company._id}?limit=100`);
      setExistingJobs(jobsRes.data.jobs);
    } catch (error) {
      console.error('Failed to fetch company', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyAndJobs();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    setDeleting(jobId);
    try {
      await api.delete(`/jobs/${jobId}`);
      setExistingJobs(prev => prev.filter(job => job._id !== jobId));
      setToast({ type: 'success', message: 'Job deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete job', error);
      setToast({ type: 'error', message: 'Failed to delete job. Please try again.' });
    } finally {
      setDeleting(null);
    }
  };

  const filteredJobs = categoryFilter === 'All' 
    ? DUMMY_JOBS 
    : DUMMY_JOBS.filter(job => job.category === categoryFilter);

  const toggleJob = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const selectAll = () => {
    const allIds = filteredJobs.map(job => job.id);
    setSelectedJobs(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedJobs(new Set());
  };

  const handleAddJobs = async () => {
    if (!company || selectedJobs.size === 0) return;

    setLoading(true);
    try {
      const jobsToAdd = DUMMY_JOBS
        .filter(job => selectedJobs.has(job.id))
        .map(({ title, location, jobType, description }) => ({
          title,
          location,
          jobType,
          description,
        }));

      await api.post(`/jobs/${company._id}/jobs/bulk`, { jobs: jobsToAdd });
      
      setToast({ type: 'success', message: `${jobsToAdd.length} jobs added successfully!` });
      setSelectedJobs(new Set());
      
      // Refresh jobs list and switch to manage tab
      await fetchCompanyAndJobs();
      setActiveTab('manage');
    } catch (error) {
      console.error('Failed to add jobs', error);
      setToast({ type: 'error', message: 'Failed to add jobs. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium italic">Loading your workspace...</p>
        </div>
      ) : (
        <>
          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.message}
              <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">Manage Jobs</h1>
                  <p className="text-sm text-gray-500">{existingJobs.length} active job{existingJobs.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {activeTab === 'add' && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={handleAddJobs}
                      disabled={loading || selectedJobs.size === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Adding...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Selected Jobs
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="h-6 w-px bg-gray-200"></div>

                <button
                  onClick={logout}
                  className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  <div className="p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'manage'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Current Jobs ({existingJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'add'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Add from Templates
              </button>
            </div>


        {/* Manage Tab - Existing Jobs */}
        {activeTab === 'manage' && (
          <div>
            {existingJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
                <p className="text-gray-500 mb-4">Add jobs from templates to get started</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Jobs
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {existingJobs.map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1 max-w-md">{job.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {job.jobType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            disabled={deleting === job._id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete job"
                          >
                            {deleting === job._id ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Tab - Job Templates */}
        {activeTab === 'add' && (
          <>
            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      categoryFilter === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Select Actions */}
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => {
                const isSelected = selectedJobs.has(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => toggleJob(job.id)}
                    className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-blue-600' : 'bg-gray-100 border border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Category Badge */}
                    <span className="inline-block px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full mb-3">
                      {job.category}
                    </span>

                    {/* Job Info */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 pr-8">{job.title}</h3>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {job.jobType}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No jobs found in this category</p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )}
</div>
);
};
