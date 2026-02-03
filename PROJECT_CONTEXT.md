# Careers Page Builder — Project Context

This is a MERN-based prototype for an ATS-like product that allows companies to build branded public Careers pages.

The project has two primary user types:
1. Recruiters (authenticated)
2. Candidates (public, no authentication)

The system is multi-tenant: multiple companies exist, and each company manages its own careers page, branding, and job listings.

---

## Product Goals

Recruiters should be able to:
- Log in
- Create and manage a single company
- Customize branding (colors, logo, banner, culture video)
- Enable/disable and reorder content sections (About, Culture, Jobs)
- Preview their careers page before publishing
- Share a public careers page link

Candidates should be able to:
- Visit a public careers page via a company slug
- Learn about the company
- Browse open jobs
- Filter jobs by location and job type
- Search jobs by title
- Experience a clean, mobile-friendly, accessible UI
- See SEO-friendly, crawlable content

Out of scope:
- Job applications
- Candidate accounts
- Admin dashboards
- Payments
- Notifications

---

## Routes Overview

Recruiter routes:
- /login
- /:companySlug/edit
- /:companySlug/preview

Candidate route:
- /:companySlug/careers

---

## Tech Stack

Frontend:
- React (Vite)
- React Router
- Axios
- Tailwind CSS
- React Helmet Async (SEO)

Backend:
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication

Infrastructure:
- MongoDB Atlas (free tier)
- Vercel (frontend)
- Render or Railway (backend)

---

## Data Model Overview

### Recruiter
- email (unique)
- passwordHash
- createdAt

### Company
- name
- slug (unique, URL-safe)
- recruiterId (reference Recruiter)
- theme:
  - primaryColor
  - secondaryColor
  - logoUrl
  - bannerUrl
  - cultureVideoUrl
- sections (ordered array):
  - id
  - type (about | culture | jobs)
  - enabled (boolean)
  - order (number)
- createdAt
- updatedAt

Each recruiter owns exactly one company.

### Job
- companyId (reference Company)
- title
- location
- jobType (Full-time | Part-time | Contract)
- description
- createdAt

---

## Backend Architecture Guidelines

- REST APIs only
- Express routers
- Mongoose schemas
- JWT-based auth middleware
- Stateless backend
- JSON-only responses
- Basic error handling (400, 401, 404)

Folder structure:
server/
models/
controllers/
routes/
middleware/
index.js

---

## Frontend Architecture Guidelines

- Page-based routing
- Separate reusable components and page sections
- Data-driven rendering for company sections
- Tailwind utility classes for theming
- Minimal global state (Context only where needed)

Example frontend structure:
client/src/
pages/
components/
sections/
context/
services/

---

## Section Rendering Rules

Careers pages are built dynamically from the `sections` array stored on the company.

Rules:
- Only enabled sections are rendered
- Sections are rendered in ascending `order`
- Section type determines which UI component to render

No hardcoded page layouts.

---

## SEO & Accessibility Guidelines

SEO:
- Dynamic page titles per company
- Meta description based on company info
- OpenGraph tags
- Structured data (JobPosting JSON-LD)

Accessibility:
- Semantic HTML
- Labels for inputs
- Keyboard navigation
- Sufficient color contrast
- Focus styles visible

---

## Performance & Scale Assumptions

This is a prototype.
- Jobs filtering can be client-side
- No pagination required
- MongoDB indexes on slug and foreign keys
- Architecture supports horizontal scaling

---

## Development Philosophy

- Favor clarity over cleverness
- Avoid over-engineering
- Build features only if they directly support the product goals
- Code should be easy to explain in an interview deep-dive
- Prefer explicit logic over abstractions

---

## AI Usage Guidelines (For Copilot)

When generating code:
- Follow the defined scope strictly
- Do not invent features
- Do not add libraries unless requested
- Keep code readable and commented
- Prefer simple implementations
- Assume this will be reviewed live by a senior engineer

---

End of context.
