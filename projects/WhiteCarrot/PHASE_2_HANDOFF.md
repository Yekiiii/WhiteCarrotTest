# Phase 2 Frontend - Implementation Handoff Document

## Project Overview

**Project:** MERN Careers Page Builder - Phase 2 Recruiter Editor  
**Status:** ✅ Complete and Ready for Review  
**Date:** February 1, 2026

---

## Architecture Summary

```
client/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components (Button, Input)
│   │   ├── DashboardLayout.tsx # Recruiter dashboard wrapper
│   │   └── Navbar.tsx          # Navigation bar
│   ├── context/
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── lib/
│   │   └── axios.ts            # Configured Axios instance
│   ├── pages/
│   │   ├── Login.tsx           # Recruiter login
│   │   ├── CompanyEditor.tsx   # Main editor interface
│   │   └── CompanyPreview.tsx  # Production-like preview
│   ├── types.ts                # TypeScript interfaces
│   └── App.tsx                 # Routing configuration
├── tailwind.config.js          # Tailwind CSS configuration (v4 via PostCSS)
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies
```

---

## Key Features Implemented

### 1. Authentication Flow
- **Login Page:** Authenticates using email/password against backend `POST /auth/login`.
- **Token Management:** JWT stored in `localStorage` and managed via `AuthContext`.
- **Protected Routes:** `DashboardLayout` redirects unauthenticated users to login.
- **Auto-Redirect:** Upon login, fetches recruiter's company and redirects to `/:slug/edit`.

### 2. Company Editor
- **Data Fetching:** Loads company data via protected `GET /companies/me`.
- **Theme Editing:** Real-time updates for:
  - Primary/Secondary colors
  - Logo/Banner URLs
  - Culture Video URL
- **Section Management:**
  - Toggle visibility (Enabled/Disabled)
  - Reorder sections (Up/Down)
- **Persist Changes:** Saves data via `PUT /companies/:id`.

### 3. Preview Page
- **Route:** `/:companySlug/preview`
- **Behavior:** Renders the careers page exactly as candidates would see it.
- **Dynamic Styling:** Applies company's theme (colors, banner) dynamically.
- **Live Content:** Fetches and displays real jobs from the backend.
- **SEO:** Includes `noindex` meta tag as per requirements.

---

## Tech Stack & Decisions

- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** React Context (Auth), Local State (Editor)
- **Routing:** React Router v7
- **HTTP Client:** Axios with Interceptors (auto-injects Bearer token)

---

## Running the Project

### Prerequisites
- Backend server must be running on port 5000.

### Setup & Run
```bash
cd client
npm install
npm run dev
```

Server will start at `http://localhost:5173`.

### Build for Production
```bash
npm run build
npm run preview
```

---

## Integration Details

- **API URL:** Defaults to `http://localhost:5000`. Set `VITE_API_URL` in `.env` to override.
- **Frontend/Backend Sync:**
  - Frontend assumes `GET /companies/me` is available.
  - Frontend matches `Company` and `Job` types to Backend Mongoose schemas.

---

## Verified Workflows ✅

1. **Login:**
   - Enter credentials -> Redirects to Editor.
   - Handles errors (invalid credentials).
2. **Editing:**
   - Change colors/URLs -> State updates.
   - Reorder sections -> Order updates.
   - Save -> Success message appears.
3. **Preview:**
   - Click "Preview Page" -> Opens in new tab.
   - Visuals match Editor settings.
   - Job list renders correctly.

---

## Next Steps (Phase 3)

- **Public Access:** Ensure `GET /companies/:slug` endpoint exists on backend for public viewing (currently Preview uses protected `me` endpoint).
- **Job Applications:** Implement "Apply Now" button functionality.
- **Rich Text:** Add rich text editor for job descriptions if needed.

---

**Handoff Complete.** The Phase 2 frontend is fully functional and integrated with the Phase 1 backend.
