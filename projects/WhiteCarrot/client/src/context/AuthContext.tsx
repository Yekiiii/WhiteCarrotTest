import React, { createContext, useContext, useState, useEffect } from "react";
import { type Recruiter } from "../types";
import api from "../lib/axios";

interface AuthContextType {
  recruiter: Recruiter | null;
  token: string | null;
  loading: boolean;
  login: (token: string, recruiter: Recruiter) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setToken(storedToken);
        setRecruiter(data.recruiter);
        localStorage.setItem("recruiter", JSON.stringify(data.recruiter));
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem("token");
        localStorage.removeItem("recruiter");
        setToken(null);
        setRecruiter(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (newToken: string, newRecruiter: Recruiter) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("recruiter", JSON.stringify(newRecruiter));
    setToken(newToken);
    setRecruiter(newRecruiter);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("recruiter");
    setToken(null);
    setRecruiter(null);
  };

  return (
    <AuthContext.Provider value={{ recruiter, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
