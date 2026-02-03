import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";

export const Navbar: React.FC = () => {
  const { logout } = useAuth();

  // Don't show navbar on preview page to keep it clean, or maybe show a "Back to Editor" banner?
  // Spec says: "Rendering Rules: Render sections dynamically... exact as it would appear publicly"
  // So NO Navbar on preview.
  // We can render Navbar only in Editor/Layout.

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Careers Builder
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Recruiter Mode</span>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
