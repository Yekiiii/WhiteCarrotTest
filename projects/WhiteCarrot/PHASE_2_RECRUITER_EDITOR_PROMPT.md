You are building Phase 2 of a MERN-based Careers Page Builder.

PHASE GOAL:
Implement the Recruiter-facing frontend that allows editing and previewing a company’s Careers page.

PAGES:
- /login
- /:companySlug/edit
- /:companySlug/preview

NOTE ON ROUTING:
- companySlug is used only for routing and URLs
- Company data is fetched via authenticated API: GET /companies/me

TECH:
- React (Vite)
- React Router
- Axios
- Tailwind CSS
- Context API for auth/session only

DATA SOURCE:
- All company data (theme, sections) comes from the Phase 1 backend
- No mock data
- No hardcoded company config

FUNCTIONAL REQUIREMENTS:

Login Page:
- Email + password login
- Call POST /auth/login
- Store JWT (localStorage is acceptable)
- After login, redirect to /:companySlug/edit using the company slug from API

Company Editor Page (/edit):
- Fetch company using GET /companies/me
- Allow editing:
  - Primary color
  - Secondary color
  - Logo URL
  - Banner URL
  - Culture video URL
- Section controls:
  - Toggle enabled/disabled
  - Reorder sections using up/down buttons
- Save changes using PUT /companies/:id
- Show loading and success states on save

Jobs Section (Editor):
- Read-only
- Show placeholder or job count
- Do NOT implement job CRUD in this phase

Preview Page (/preview):
- Fetch company using GET /companies/me
- Render the Careers page exactly as it would appear publicly
- Use only saved backend data (no draft state)
- Page must not be indexed by search engines

RENDERING RULES:
- Render sections dynamically
- Only render sections where enabled === true
- Render in ascending order value
- Do not hardcode layout order

UX & ACCESSIBILITY:
- Clear labels for all inputs
- Keyboard accessible controls
- Mobile-friendly layout
- Visible focus states
- Clear error messages

DO NOT:
- Add drag-and-drop
- Add job application flows
- Add job editing
- Add role switching
- Add Redux or complex state libraries
- Add draft or versioning systems

Focus on clarity, simplicity, and interview-ready code.
