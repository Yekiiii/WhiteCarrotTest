import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { BrowseCompanies } from "./pages/BrowseCompanies";
import { CompanyEditor } from "./pages/CompanyEditor";
import { CompanyPreview } from "./pages/CompanyPreview";
import { CareersPage } from "./pages/CareersPage";
import { Dashboard } from "./pages/Dashboard";
import { AddJobs } from "./pages/AddJobs";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/browse" replace />} />
          <Route path="/browse" element={<BrowseCompanies />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/jobs/add" element={<ProtectedRoute><AddJobs /></ProtectedRoute>} />
          <Route 
            path="/:companySlug/edit" 
            element={
              <ProtectedRoute>
                <CompanyEditor />
              </ProtectedRoute>
            } 
          />
          
          {/* Company public routes */}
          <Route path="/:companySlug/preview" element={<CompanyPreview />} />
          <Route path="/:companySlug/careers" element={<CareersPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
