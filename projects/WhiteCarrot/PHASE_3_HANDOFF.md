# WhiteCarrot - Development Handoff Document
## Careers Page Builder - MERN Stack

**Last Updated:** February 3, 2026  
**Phases Completed:** 1, 2, 3 + Additional Features

---

## 📋 Project Overview

WhiteCarrot is a MERN-based Careers Page Builder that allows recruiters to create and customize beautiful careers pages for their companies. Job seekers can browse companies and view their open positions.

---

## 🏗️ Tech Stack

### Frontend (client/)
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS v4** for styling
- **React Router v7** for navigation
- **Axios** for API calls
- **@dnd-kit** for drag-and-drop functionality

### Backend (server/)
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **multer** for file uploads

---

## 📁 Project Structure

```
WhiteCarrot/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Reusable UI components (Button, Input)
│   │   │   ├── editor/       # Editor-specific components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   ├── axios.ts      # API client configuration
│   │   │   └── fontLoader.ts # Google Fonts loader
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CompanyEditor.tsx
│   │   │   ├── CompanyPreview.tsx
│   │   │   ├── CareersPage.tsx    # Public careers page
│   │   │   └── BrowseCompanies.tsx # Job seeker browse page
│   │   ├── types.ts
│   │   └── App.tsx
│   └── package.json
│
├── server/                    # Express backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── companyController.js
│   │   └── jobController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Recruiter.js
│   │   ├── Company.js
│   │   └── Job.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── jobRoutes.js
│   │   └── uploadRoutes.js
│   ├── uploads/              # Uploaded files storage
│   └── index.js
│
└── *.md                      # Documentation files
```

---

## 🛣️ Routes

### Frontend Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | Redirect | Public | Redirects to `/browse` |
| `/browse` | BrowseCompanies | Public | Job seeker homepage - browse all companies |
| `/login` | Login | Public | Recruiter login |
| `/register` | Register | Public | Recruiter + company registration |
| `/dashboard` | Dashboard | Protected | Recruiter dashboard |
| `/:companySlug/edit` | CompanyEditor | Protected | Careers page editor |
| `/:companySlug/preview` | CompanyPreview | Public | Preview mode (no SEO) |
| `/:companySlug/careers` | CareersPage | Public | Public careers page with SEO |

### Backend API Endpoints

#### Auth Routes (`/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new recruiter |
| POST | `/auth/login` | No | Login recruiter |
| GET | `/auth/me` | Yes | Get current user |

#### Company Routes (`/companies`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/companies/public` | No | Get all public companies with job counts |
| GET | `/companies/public/:slug` | No | Get company by slug |
| GET | `/companies/me` | Yes | Get current recruiter's company |
| POST | `/companies` | Yes | Create new company |
| PUT | `/companies/:id` | Yes | Update company |

#### Job Routes (`/companies/:companyId/jobs`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/companies/:companyId/jobs` | No | Get all jobs for a company |
| POST | `/companies/:companyId/jobs` | Yes | Create new job |
| PUT | `/companies/:companyId/jobs/:jobId` | Yes | Update job |
| DELETE | `/companies/:companyId/jobs/:jobId` | Yes | Delete job |

#### Upload Routes (`/upload`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload/logo` | Yes | Upload company logo |
| POST | `/upload/banner` | Yes | Upload company banner |
| POST | `/upload/gallery` | Yes | Upload gallery images |

---

## 🎨 Features Implemented

### Phase 1: Backend Foundation
- ✅ MongoDB models (Recruiter, Company, Job)
- ✅ JWT authentication
- ✅ CRUD for companies and jobs
- ✅ File upload handling
- ✅ Slug-based company URLs

### Phase 2: Recruiter Editor
- ✅ Full careers page editor
- ✅ Theme customization (colors, fonts, spacing)
- ✅ Section management (hero, text, gallery, video, jobs, CTA, custom)
- ✅ Drag-and-drop section reordering
- ✅ Live preview
- ✅ Style presets
- ✅ Per-section theme overrides
- ✅ Logo/banner uploads
- ✅ Job management (add, edit, delete)

### Phase 3: Public Careers Page
- ✅ SEO optimized (`/:companySlug/careers`)
  - Dynamic page title
  - Meta description
  - OpenGraph tags
  - Twitter Card tags
  - JobPosting JSON-LD structured data
- ✅ Company branding rendering
- ✅ Dynamic section rendering
- ✅ Job listings with filters:
  - Search by job title
  - Filter by location
  - Filter by job type
- ✅ Accessibility (ARIA labels, semantic HTML, keyboard focus)
- ✅ Responsive design

### Additional Features
- ✅ **Register Page** (`/register`)
  - Company name + recruiter credentials
  - Auto-creates company on registration
  - Redirects to editor

- ✅ **Browse Companies Page** (`/browse`)
  - Public page for job seekers
  - Lists all companies with job counts
  - Search by company name
  - Sort by: Most Jobs, Alphabetical, Recently Added
  - Company cards with logo, banner, job count
  - Links to company careers pages

---

## 🗃️ Data Models

### Recruiter
```javascript
{
  email: String (unique),
  passwordHash: String,
  createdAt: Date
}
```

### Company
```javascript
{
  name: String,
  slug: String (unique),
  recruiterId: ObjectId (ref: Recruiter),
  theme: {
    primaryColor: String,
    secondaryColor: String,
    accentColor: String,
    backgroundColor: String,
    textColor: String,
    fontFamily: String,
    headingFont: String,
    baseFontSize: String,
    borderRadius: String,
    spacing: String,
    buttonStyle: String,
    logoUrl: String,
    bannerUrl: String,
    preset: String,
    customCSS: String
  },
  content: {
    heroTitle: String,
    heroSubtitle: String
  },
  sections: [{
    id: String,
    type: String,
    title: String,
    subtitle: String,
    content: String,
    enabled: Boolean,
    order: Number,
    theme: {
      backgroundColor: String,
      textColor: String,
      accentColor: String
    },
    config: {
      videoUrl: String,
      imageUrls: [String],
      ctaButtonText: String,
      ctaButtonUrl: String,
      layout: String,
      backgroundImageUrl: String,
      backgroundType: String,
      backgroundValue: String,
      overlayOpacity: Number
    }
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Job
```javascript
{
  companyId: ObjectId (ref: Company),
  title: String,
  location: String,
  jobType: String (Full-time, Part-time, Contract),
  description: String,
  createdAt: Date
}
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Environment Variables

Create `.env` in `server/`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whitecarrot
JWT_SECRET=your-secret-key
```

### Commands

```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📝 User Flows

### Recruiter Flow
1. Register at `/register` → Creates account + company
2. Redirected to `/:companySlug/edit`
3. Customize theme, sections, and branding
4. Add jobs in the Jobs tab
5. Preview at `/:companySlug/preview`
6. Share public link: `/:companySlug/careers`

### Job Seeker Flow
1. Visit `/browse` (homepage)
2. Search/filter companies
3. Click on a company card
4. Browse careers page at `/:companySlug/careers`
5. Filter jobs by title, location, type
6. View job details

---

## 🎯 What's NOT Implemented (Per Spec)

- ❌ Apply buttons (per Phase 3 spec)
- ❌ Pagination for jobs
- ❌ Analytics
- ❌ Forgot password functionality
- ❌ Multiple recruiters per company
- ❌ Application tracking

---

## 📦 Key Files Quick Reference

| Purpose | File Path |
|---------|-----------|
| App entry | `client/src/App.tsx` |
| Auth context | `client/src/context/AuthContext.tsx` |
| Type definitions | `client/src/types.ts` |
| API client | `client/src/lib/axios.ts` |
| Browse page | `client/src/pages/BrowseCompanies.tsx` |
| Careers page | `client/src/pages/CareersPage.tsx` |
| Editor | `client/src/pages/CompanyEditor.tsx` |
| Server entry | `server/index.js` |
| Company API | `server/controllers/companyController.js` |
| Auth API | `server/controllers/authController.js` |

---

## ✅ Status Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 | ✅ Complete | Backend + Auth |
| Phase 2 | ✅ Complete | Editor UI |
| Phase 3 | ✅ Complete | Public page + SEO |
| Browse Page | ✅ Complete | Job seeker homepage |
| Register | ✅ Complete | Recruiter onboarding |

**Next Steps (Phase 4 - Polish):**
- Additional testing
- Performance optimizations
- Error boundary implementation
- Loading states refinement
