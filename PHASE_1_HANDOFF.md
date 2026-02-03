# Phase 1 Backend - Implementation Handoff Document

## Project Overview

**Project:** MERN Careers Page Builder - Phase 1 Backend  
**Status:** ✅ Complete and Tested  
**Date:** February 1, 2026

---

## Architecture Summary

```
server/
├── index.js                    # Express app entry point
├── package.json                # Dependencies & scripts
├── nodemon.json                # Dev server configuration
├── .env                        # Environment variables (local)
├── .env.example                # Environment template
├── controllers/
│   ├── authController.js       # Register/Login logic
│   ├── companyController.js    # Company CRUD operations
│   └── jobController.js        # Job CRUD operations
├── middleware/
│   └── auth.js                 # JWT authentication middleware
├── models/
│   ├── Recruiter.js            # Recruiter schema
│   ├── Company.js              # Company schema with theme/sections
│   └── Job.js                  # Job posting schema
└── routes/
    ├── authRoutes.js           # /auth/* routes
    ├── companyRoutes.js        # /companies/* routes (protected)
    └── jobRoutes.js            # /companies/:companyId/jobs routes
```

---

## Data Models

### 1. Recruiter
| Field | Type | Constraints |
|-------|------|-------------|
| `email` | String | Required, Unique, Lowercase, Trimmed |
| `passwordHash` | String | Required (bcrypt hashed) |
| `createdAt` | Date | Auto-generated |

### 2. Company
| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | Required, Trimmed |
| `slug` | String | Required, Unique, Lowercase, URL-safe |
| `recruiterId` | ObjectId | Ref → Recruiter, Required |
| `theme` | Object | See below |
| `sections` | Array | See below |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

**Theme Object:**
- `primaryColor` (String, default: "#3B82F6")
- `secondaryColor` (String, default: "#1E40AF")
- `logoUrl` (String)
- `bannerUrl` (String)
- `cultureVideoUrl` (String)

**Sections Array (default):**
```json
[
  { "id": "about", "type": "about", "enabled": true, "order": 0 },
  { "id": "culture", "type": "culture", "enabled": true, "order": 1 },
  { "id": "jobs", "type": "jobs", "enabled": true, "order": 2 }
]
```

### 3. Job
| Field | Type | Constraints |
|-------|------|-------------|
| `companyId` | ObjectId | Ref → Company, Required |
| `title` | String | Required, Trimmed |
| `location` | String | Required, Trimmed |
| `jobType` | Enum | "Full-time" \| "Part-time" \| "Contract" |
| `description` | String | Required |
| `createdAt` | Date | Auto-generated |

---

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/auth/register` | Register new recruiter | `{ email, password }` |
| POST | `/auth/login` | Login & get JWT | `{ email, password }` |

**Response (both):**
```json
{
  "message": "...",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "recruiter": { "id": "...", "email": "..." }
}
```

### Company (Protected - Requires Bearer Token)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/companies` | Create company | `{ name, theme?, sections? }` |
| GET | `/companies/me` | Get recruiter's company | - |
| PUT | `/companies/:id` | Update company | `{ name?, theme?, sections? }` |

**Authorization:** `Authorization: Bearer <token>`

### Jobs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/companies/:companyId/jobs` | Required | Create job posting |
| GET | `/companies/:companyId/jobs` | Public | List jobs (with filters) |

**Create Job Body:**
```json
{
  "title": "Senior Developer",
  "location": "Remote",
  "jobType": "Full-time",
  "description": "Job description..."
}
```

**Query Params (GET):**
- `search` - Filter by title (case-insensitive regex)
- `location` - Filter by location (case-insensitive regex)
- `jobType` - Filter by exact job type

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5.x
- **Database:** MongoDB with Mongoose 9.x
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **CORS:** Enabled globally
- **Dev Server:** nodemon

---

## Security Implementation

1. **Password Hashing:** bcrypt with 10 salt rounds
2. **JWT Tokens:** 7-day expiration, signed with HS256
3. **Authorization Middleware:** Validates Bearer token, attaches `req.recruiter`
4. **Ownership Checks:** Company/Job mutations verify `recruiterId` matches token

---

## Error Handling

| Status | Meaning |
|--------|---------|
| 400 | Bad Request (validation error, duplicate email) |
| 401 | Unauthorized (missing/invalid token, wrong credentials) |
| 404 | Not Found (company/job doesn't exist) |
| 500 | Server Error (unexpected failures) |

---

## Tested Workflows ✅

1. **Register Recruiter** → Returns JWT
2. **Login Recruiter** → Returns JWT
3. **Create Company** (with token) → Creates with auto-generated slug
4. **Get My Company** (with token) → Returns recruiter's company
5. **Update Company** (with token) → Updates theme/sections
6. **Create Job** (with token) → Adds job to company
7. **Get Jobs** (public) → Lists jobs with optional filters

---

## Running the Server

```bash
cd server
npm install
npm run dev      # Development with nodemon
npm start        # Production
```

---

## What's NOT Included (Per Phase 1 Spec)

- ❌ Pagination
- ❌ Roles other than recruiter
- ❌ Job application flows
- ❌ Admin functionality
- ❌ Tests
- ❌ Frontend code

---

## Next Steps (Phase 2 Recommendations)

1. **Frontend:** React app with recruiter dashboard
2. **Public Careers Page:** Render company page by slug
3. **Job Applications:** Candidate model + application flow
4. **File Uploads:** Logo/banner image handling
5. **Validation:** Add express-validator for input sanitization
6. **Rate Limiting:** Prevent brute-force attacks
7. **Testing:** Jest/Supertest for API tests

---

## File Reference

| File | Purpose |
|------|---------|
| [index.js](server/index.js) | Express app setup, routes, MongoDB connection |
| [models/Recruiter.js](server/models/Recruiter.js) | Recruiter schema |
| [models/Company.js](server/models/Company.js) | Company schema with embedded theme/sections |
| [models/Job.js](server/models/Job.js) | Job schema |
| [middleware/auth.js](server/middleware/auth.js) | JWT verification middleware |
| [controllers/authController.js](server/controllers/authController.js) | Register/Login logic |
| [controllers/companyController.js](server/controllers/companyController.js) | Company CRUD |
| [controllers/jobController.js](server/controllers/jobController.js) | Job CRUD |
| [routes/authRoutes.js](server/routes/authRoutes.js) | Auth route definitions |
| [routes/companyRoutes.js](server/routes/companyRoutes.js) | Company route definitions |
| [routes/jobRoutes.js](server/routes/jobRoutes.js) | Job route definitions |

---

## Sample cURL Commands

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@company.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@company.com","password":"SecurePass123"}'

# Create Company (use token from login)
curl -X POST http://localhost:5000/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Acme Corp"}'

# Get My Company
curl http://localhost:5000/companies/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Job
curl -X POST http://localhost:5000/companies/COMPANY_ID/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Developer","location":"Remote","jobType":"Full-time","description":"Build stuff"}'

# Get Jobs (public)
curl "http://localhost:5000/companies/COMPANY_ID/jobs?search=developer&location=remote"
```

---

**Handoff Complete.** The Phase 1 backend is fully implemented, tested, and ready for frontend integration or further development.
