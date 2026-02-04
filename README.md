
Website URL: https://white-carrot-test-57vh.vercel.app
API : https://whitecarrottest.onrender.com

WhiteCarrot is a specialized content management system (CMS) for company career pages. It allows recruiters to manage job postings and design a branded career site without writing code.

---

##  What I Built

A full-stack MERN application that serves two distinct user groups:

  **Recruiters**:
1) Analytics overview and quick actions.
2) A "What You See Is What You Get" (WYSIWYG) editor for the public career page. Supports custom sections (Hero, Text, Gallery, Video, Jobs).
3) A tool to create jobs effectively, including a "Bulk Add" feature using templates.
4) Secure login/registration flows with persistent sessions.

**Candidates** (Public View):
1) A dynamic, branded page displaying the company's content and open roles.
2) Ability to filter roles by category/department.

---

##  How to Run Locally

 Prerequisites
Node.js (v16+)
MongoDB (running locally or Atlas URI)

### 1. Backend Setup
```bash
cd server
npm install
# Create .env file with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/whitecarrot (your key)
# Here's mine for convenience: mongodb+srv://admin:N0IdRbdS4TnqQB8l@whitecarrottest.gpgk2jz.mongodb.net/?appName=WhiteCarrotTest (removed ip restriction for now)
# Run Seed script with: node scripts/seed.js if new db with no entries
# JWT_SECRET=development_secret_key
npm run dev
```

Client setup
cd client
npm install
# Create .env file with:
# VITE_API_URL=http://localhost:5000
npm run dev


The application will be available at `http://localhost:5173`.

---

## Step-by-Step User Guide (Recruiter Flow)

1.Registration
Go to `/register`.
Create an account with email and password.
You will be redirected to the dashboard.

2.Setting up the Profile
On the first login, default company data is initialized.
Navigate to "Edit Career Page" from the sidebar.

3.Designing the Career Page
Use the Sidebar to reorder sections (Hero, Culture, Jobs).
Use the Styles tab to change the global color theme and fonts.
Changes are auto-saved.

4.Managing Jobs
Go to the "Jobs" tab.
Use "Add from Templates" to quickly populate roles (Engineering, Sales, etc.).
Or add manual job listings.
Use "Select All" to bulk add multiple template jobs at once.

5.Publishing
The "View Live Page" button in the editor opens the public-facing URL.
Share this URL with candidates.

---

## Improvement Plan (Future Work)

 Add real tracking for page views and "Apply" button clicks.
 Make other static features ready for later.
 Use redis for queueing for scaling.
 Integrate Cloudinary or AWS S3 for better image hosting performance.
 Allow multiple recruiters to manage a single company page.
 Add more types of prebuilt omponents with more customizability. 
 



