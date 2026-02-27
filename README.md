# 🚀 PathFinder AI — Intelligent Campus Placement ERP

**Team algoRhythmss | Hackathon 2026** Thejas • Raghavendra • Abhishek • Abhijith

---

## 📌 What Is This?

PathFinder AI is a full-stack campus placement management system that uses a **hybrid AI pipeline** to match students with job drives — fairly, transparently, and without any external API.

The system works in two stages:
1. **Policy Gateway** — Hard rule engine (CGPA, backlogs, branch). If a student fails here, AI never runs.
2. **AI Semantic Matcher** — Uses `all-MiniLM-L6-v2` (HuggingFace) to compute a Career Readiness Score (CRS) based on resume, skills, and projects vs the job description.

Every decision is logged in an **immutable audit trail** — who was selected, why, and by whom. The platform also features **real-time WebSocket integration** for instant status updates.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TailwindCSS, Recharts, Lucide Icons |
| **Backend** | Python, FastAPI, WebSockets |
| **Database** | SQLite (dev environment) |
| **AI Model** | HuggingFace `all-MiniLM-L6-v2` (Local NLP inference) |
| **ORM** | SQLAlchemy |
| **Document Processing** | PDFMiner (parsing), ReportLab (PDF Generation) |

---

## 📁 Project Structure

```text
pathfinder-ai/
├── backend/
│   ├── main.py                    ← FastAPI entry point & WebSockets
│   ├── requirements.txt
│   ├── database/
│   │   ├── models.py              ← SQLAlchemy ORM models
│   │   └── seed.py                ← 20 mock students + 5 drives
│   └── ai_engine/
│       ├── policy_gateway.py      ← Rule engine (CGPA, backlogs, branch)
│       ├── matcher.py             ← CRS computation + NLP matching
│       └── audit_logger.py        ← Immutable audit log writer (JSON/CSV/PDF)
│
└── frontend/
    ├── package.json               ← React Scripts configuration
    ├── tailwind.config.js
    └── src/
        ├── App.js                 ← Router + all routes
        ├── services/api.js        ← Axios API layer
        ├── components/
        │   ├── ui.jsx             ← Shared UI components
        │   ├── Sidebar.jsx
        │   └── Layout.jsx
        └── pages/
            ├── Landing.jsx        ← Home with role selector
            ├── student/           ← Dashboard, Resume Upload, Apply, Roadmap
            ├── recruiter/         ← Create Drive, View Shortlist
            └── admin/             ← Analytics, Audit Logs, Export

⚡ How to RunPrerequisitesPython 3.10+Node.js 18+npm 9+Step 1 — BackendBashcd pathfinder-ai/backend

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
✅ Backend: http://localhost:8000✅ API Docs: http://localhost:8000/docsNote: The SQLite DB is automatically created with 20 mock students + 5 drives on first run.Step 2 — FrontendOpen a new terminal:Bashcd pathfinder-ai/frontend

# Install dependencies
npm install

# Start the React development server
npm start
✅ App: http://localhost:3000🧠 How the AI WorksPolicy Gateway (Runs First)Hard rules are checked before any AI processing to guarantee 100% compliance:PlaintextRule 1: student.cgpa >= drive.min_cgpa
Rule 2: student.active_backlogs <= drive.max_backlogs
Rule 3: student.branch in drive.eligible_branches

Any rule FAILS → instant rejection. AI never runs.
All rules PASS → proceed to AI matcher.
CRS (Career Readiness Score)PlaintextCRS = (Semantic Score × 0.50) + (Project Score × 0.30) + (Completeness × 0.20)
ComponentWeightHow It Is CalculatedSemantic Skill Match50%Cosine similarity between extracted resume text and JD using all-MiniLM-L6-v2Project Relevance30%Semantic similarity between student projects and JD requirementsResume Completeness20%Analyzes missing structural elements (Skills, projects, certifications)Score Thresholds:75–100 → Strong match50–75 → Good match25–50 → Skill gaps exist0–25 → Poor fit🎭 3 Role DashboardsRoleFeaturesStudentView CRS, upload resume, browse drives, apply, track live eligibility via WebSocketsRecruiterCreate job drives, set dynamic eligibility rules, view AI-ranked candidate shortlistAdmin/TPOPlatform analytics, monitor all students/drives, export immutable audit logs (JSON/CSV/PDF)📊 Mock Data (Pre-seeded)20 Students — CGPA range 6.5–9.6, branches CSE/IT/ECE/MCA, varied tech skills.5 Pre-configured Drives:CompanyRoleMin CGPAPackageTCSSoftware Developer6.07–9 LPAGoogleSWE8.530–45 LPAInfosysSystems Engineer6.53.5–5 LPAAmazonSDE-17.524–32 LPADeloitteData Analyst7.08–12 LPA🔗 Key API EndpointsCore EntitiesBashGET  /students                          # List all students
GET  /drives                            # List all active drives
POST /create-drive                      # Create a new placement drive
PUT  /drives/{drive_id}/status          # Update drive status (active/closed)
Application & AI FlowBashPOST /upload-resume                     # Upload PDF or paste text (extracts skills)
GET  /eligibility/{student_id}          # Check eligibility across all drives
POST /apply                             # Apply to drive (triggers Policy + AI Engine)
GET  /shortlist/{drive_id}              # Get AI-ranked candidates for a specific drive
POST /shortlist/approve                 # TPO approves a candidate
WS   /ws/live-status/{student_id}       # WebSocket for real-time application updates
Analytics & GovernanceBashGET  /analytics/overview                # Platform-wide statistics and pass rates
GET  /analytics/drive/{drive_id}        # Specific drive metrics
GET  /audit-logs                        # View full immutable audit trail
GET  /audit-logs/export/csv             # Export AI decisions as CSV
GET  /audit-logs/export/json            # Export AI decisions as JSON
GET  /audit-logs/export/pdf             # Export AI decisions as PDF Report
Full interactive documentation is available at http://localhost:8000/docs when the backend is running.🎨 UI ThemeDark cyber aesthetic — Background #0a0a1a, Accent violet #7c3aed, Cyan #06b6d4Built with ❤️ by Team algoRhythmss | Hackathon 2026
Once you paste this in, just run these three Git commands to push the final, perfect version to GitHub:
```bash
git add README.md
git commit -m "Update README to perfectly match codebase features and commands"
git push origin main
