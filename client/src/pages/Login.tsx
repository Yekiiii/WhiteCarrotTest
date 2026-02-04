import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { type Company } from "../types";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, recruiter } = res.data;

      login(token, recruiter);

      // Fetch company to redirect
      try {
        await api.get<{ company: Company }>("/companies/me", {
          headers: { Authorization: `Bearer ${token}` }, // Explicitly pass token as state update might lag slightly if not careful, though usually synchronous in setToken it's safer to rely on API interceptor if we wait, but better here.
        });
        
        navigate(`/dashboard`);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // No company found, Phase 1 spec says "Create Company" is done.
          // But if a recruiter has no company, we should probably prompt them?
          // For now, I'll redirect to a helper page or just show error.
          // Actually, let's just create a basic one if missing (auto-onboard) or error.
          // Spec doesn't define on-boarding UI. I'll just show an error or redirect to a default.
           setError("No company found for this recruiter. Please contact support.");
        } else {
          setError("Failed to fetch company details.");
        }
      }

    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
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

        /* Soft pulsing circles - smoother timing and GPU hints */
        .pulse-soft {
          animation: pulseSoft 10s cubic-bezier(.4,0,.2,1) infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }

        @keyframes pulseSoft {
          0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.08; }
          50% { transform: translate3d(0,0,0) scale(1.08); opacity: 0.16; }
        }

        /* Floating central blob - reduced travel and smoother curve */
        .float {
          animation: float 18s cubic-bezier(.4,0,.2,1) infinite;
          will-change: transform;
        }

        @keyframes float {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          33% { transform: translate3d(12px, -12px, 0) scale(1.03); }
          66% { transform: translate3d(-8px, 10px, 0) scale(0.98); }
        }
      `}</style>
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600 overflow-hidden bg-animated">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-wider">WhiteCarrot</h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Build your company's <br />
              career page in minutes.
            </h2>
            <p className="text-blue-100 text-lg max-w-md">
              Showcase your culture, list your open roles, and attract the best talent with our intuitive editor.
            </p>
          </div>
          <div className="text-sm text-blue-200">
            © {new Date().getFullYear()} WhiteCarrot. All rights reserved.
          </div>
        </div>
        
        {/* Decorative elements with pulse and float */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl pulse-soft" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500 blur-3xl transform -translate-x-1/2 -translate-y-1/2 float opacity-20" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Job Seeker Banner */}
          <Link 
            to="/browse" 
            className="block p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Looking for a job?</p>
                <p className="text-sm text-indigo-600 group-hover:underline">Browse open positions →</p>
              </div>
            </div>
          </Link>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your details to sign in
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="bg-white"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="bg-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 flex items-center">
                 <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl transform transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 rounded-lg"
                isLoading={isLoading}
              >
                <span className="inline-flex items-center gap-3 justify-center">
                  <svg className="w-4 h-4 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span>Sign in</span>
                </span>
              </Button>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register your company
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
