You are building Phase 1 of a MERN-based Careers Page Builder.

PHASE GOAL:
Implement the backend foundation using Node.js, Express, MongoDB (Mongoose), and JWT authentication.

SCOPE:
- Recruiter authentication only
- Company creation and configuration
- Job storage and retrieval
- REST APIs only
- No frontend code

DATA MODELS:

1. Recruiter
- email (unique, required)
- passwordHash
- createdAt

2. Company
- name
- slug (unique, URL-safe)
- recruiterId (ObjectId reference)
- theme:
  - primaryColor
  - secondaryColor
  - logoUrl
  - bannerUrl
  - cultureVideoUrl
- sections (ordered array):
  - id (string)
  - type ("about" | "culture" | "jobs")
  - enabled (boolean)
  - order (number)
- createdAt
- updatedAt

3. Job
- companyId (ObjectId reference)
- title
- location
- jobType ("Full-time" | "Part-time" | "Contract")
- description
- createdAt

API ENDPOINTS:

Auth
- POST /auth/register
- POST /auth/login

Company (Protected)
- POST /companies
- GET /companies/me
- PUT /companies/:id

Jobs
- POST /companies/:companyId/jobs
- GET /companies/:companyId/jobs
  - Supports query params: search, location, jobType

TECH RULES:
- Use Express routers
- Use Mongoose schemas
- Use async/await
- Hash passwords with bcrypt
- JWT auth middleware
- JSON responses only
- Basic error handling (400, 401, 404)

FOLDER STRUCTURE:

server/
  models/
  controllers/
  routes/
  middleware/
  index.js

DO NOT:
- Add pagination
- Add roles other than recruiter
- Add job application flows
- Add admin functionality
- Add tests in this phase

Write clean, readable, interview-ready code.
