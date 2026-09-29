# Ministry of Tribal Affairs (MoTA) Unified Scholarship Platform

[![SIH Reference](https://img.shields.io/badge/Official_Source-tribal.nic.in-0c5c3a.svg)](https://tribal.nic.in/ScholarshiP.aspx)
[![License](https://img.shields.io/badge/License-Government_Open_Data-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.15-2d3748.svg)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/Tests-11_Passed_100%25-brightgreen.svg)](#)

A fully functional, full-stack, mobile-first unified scholarship platform engineered specifically for the **Ministry of Tribal Affairs (MoTA), Government of India**.

---

## 🏛️ 1. Official Source of Truth

Built strictly upon the official scholarship guidelines and statutory notifications published on the **[Ministry of Tribal Affairs Official Portal](https://tribal.nic.in/ScholarshiP.aspx)**. The platform strictly implements the 5 authorized schemes with zero synthetic rules:

| Scheme Name | Code | Target Group | Income Cap | Official Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Pre-Matric Scholarship for ST Students** | `PRE_MATRIC` | Classes IX & X | $\le$ ₹2.50 Lakh | [dbttribal.gov.in](https://dbttribal.gov.in) |
| **Post-Matric Scholarship for ST Students** | `POST_MATRIC` | Class XI to Ph.D. | $\le$ ₹2.50 Lakh | [dbttribal.gov.in](https://dbttribal.gov.in) |
| **National Scholarship for Higher Education (Top Class)** | `TOP_CLASS` | Degree/PG in 265 Premier Institutes | $\le$ ₹6.00 Lakh | [scholarships.gov.in](https://scholarships.gov.in) |
| **National Fellowship for ST Students (NFST)** | `NFST` | Regular M.Phil & Ph.D. (750 slots) | UGC Norms | [fellowship.tribal.gov.in](https://fellowship.tribal.gov.in) |
| **National Overseas Scholarship for ST Students (NOS)** | `NOS` | Master's/Ph.D. Abroad (20 slots, 3 PVTG) | $\le$ ₹6.00 Lakh | [overseas.tribal.gov.in](https://overseas.tribal.gov.in) |

---

## 🌟 2. Key Capabilities & Features

### 📱 Mobile-First Student Experience
- **Optimized for Low-Connectivity**: Designed for rural smartphone screens (360px - 430px) with 5-point thumb navigation and low-bandwidth SVG assets.
- **One-Time Registration (OTR)**: Unified digital identity mapped with masked Aadhaar and DBT-linked bank accounts.
- **Family Scholarship View**: Visualizes scholarship availing status across siblings (e.g. Priya Munda availing Pre-Matric).
- **11-Stage Application Tracker**: Visual milestone stepper from submission to PFMS DBT disbursement.

### 🤖 JAGO Contextual AI Chatbot
- Multilingual-ready assistant named **JAGO** ("Awaken / Informed").
- Deeply integrated into the student's live database record — answers questions regarding active application numbers, current verification hurdles, and required document formats without manual entry.

### 🛡️ Prototype Verification Adapter Mesh
Emulates real Indian Digital Public Infrastructure (DPI) with zero external network dependencies:
- **DigiLocker Adapter**: Machine-to-machine validation of ST Caste certificates.
- **e-District Revenue Adapter**: Automated income certificate verification with simulated manual review flagging.
- **AISHE / UDISE+ Adapter**: Academic institution accreditation and enrollment verification.
- **Intelligent Fallback**: Inconsistencies route directly to the officer **Manual Review Desk** rather than blind rejections.

### 📊 Administrative & Verification Portal
- **Real-Time KPI Dashboard**: Tracks state-wise disbursals, top-performing tribal districts, and gender ratios.
- **Manual Review Adjudication**: Officers review document discrepancy diffs, approve with sanction orders, or issue structured deficiency correction notices.
- **Unreached Beneficiary AI Engine**: Cross-matches educational rosters (UDISE+, APAAR) against tribal scholarship registries to identify eligible non-applicants for district outreach camps.
- **Immutable Audit Trail**: Tamper-evident logging of all official actions in accordance with government IT compliance standards.

---

## 🚀 3. Quickstart & Running Instructions

### System Requirements
- Node.js v18.0.0+ (Tested on Node.js v20.18.0)
- npm v9.0.0+

### Clone & Run

```bash
# 1. Start the Backend API (runs on http://localhost:5000)
cd backend
npm install
npm run dev

# 2. In a second terminal, start the Frontend UI (runs on http://localhost:5173)
cd frontend
npm install
npm run dev
```

### Accessing the Platform
- **Student Portal**: `http://localhost:5173/login`
  - Mobile: `9999999999`
  - Demo OTP: `123456`
- **Admin Verification Portal**: `http://localhost:5173/login`
  - Email: `admin@mota-demo.local`
  - Password: `Admin@123`

---

## 🧪 4. Automated Test Suite

Run the full end-to-end integration test suite verifying authentication, eligibility logic, prototype verifiers, application state machines, and JAGO AI responses:

```bash
cd backend
npm test
```

```
✓ 1. Auth Flow: Send OTP and Verify OTP (Student)
✓ 2. Auth Flow: Admin Password Login
✓ 3. Schemes API: Fetch all 5 official MoTA scholarship schemes
✓ 4. Eligibility Engine: Evaluate Post-Matric ST applicant
✓ 5. Student Profile & Family View: Fetch Rahul Munda profile & family members
✓ 6. Digital Document Wallet: Fetch student documents
✓ 7. Prototype Verification Service: Verify Caste cert via DigiLocker
✓ 8. Application Lifecycle: Submit new Post-Matric application
✓ 9. Admin Flow: Fetch Manual Review queue and adjudicate decision
✓ 10. Payment & DBT Tracking: Verify credited passbook entries
✓ 11. JAGO Contextual Chatbot: Ask about active application status

Tests: 11 passed, 11 total (100% Pass Rate)
```

---

## 🏗️ 5. Project Directory Structure

```
mota-scholarship-platform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # SQLite development schema (18 models)
│   ├── src/
│   │   ├── controllers/         # API Route Handlers (Auth, Apps, Admin, Docs, Chat)
│   │   ├── middleware/          # JWT & RBAC role guards
│   │   ├── routes/              # Express REST routing
│   │   ├── services/
│   │   │   ├── chatbot/         # JAGO Contextual Assistant
│   │   │   ├── eligibility/     # Statutory MoTA Eligibility Engine
│   │   │   ├── outreach/        # UDISE+ & APAAR Cross-Matcher
│   │   │   ├── scholarship/     # Scraped Official MoTA Scheme Masters
│   │   │   └── verification/    # DigiLocker / e-District Adapters
│   │   ├── seed.ts              # Realistic Seed Generator
│   │   └── server.ts            # Express Server Bootstrap
│   └── test/
│       └── api.test.ts          # Comprehensive Integration Test Suite
├── frontend/
│   ├── src/
│   │   ├── components/          # StatusTracker, SkeletonLoader, EmptyState
│   │   ├── context/             # AuthContext (JWT & Persona management)
│   │   ├── layouts/             # StudentLayout (Mobile) & AdminLayout (Desktop)
│   │   ├── pages/
│   │   │   ├── admin/           # Dashboard, Manual Review Desk, Outreach, Audit
│   │   │   ├── applications/    # Application Wizard, List & Live Tracker
│   │   │   ├── auth/            # OTP & Admin Password Login
│   │   │   ├── chatbot/         # Interactive JAGO Chat Interface
│   │   │   ├── dashboard/       # Student Dashboard & Family View
│   │   │   ├── documents/       # Digital Document Wallet & Prototype Verifier
│   │   │   ├── payments/        # Direct Benefit Transfer (DBT) Passbook
│   │   │   ├── profile/         # Student OTR Profile & Academic Credentials
│   │   │   └── scholarships/    # Official Scheme Catalog & Eligibility Checker
│   │   ├── services/            # Axios API Client
│   │   ├── App.tsx              # React Router Navigation
│   │   └── main.tsx             # React DOM Root
├── database/
│   ├── schema.prisma            # Reference schema
│   └── schema.postgres.prisma   # PostgreSQL 16 schema for Docker container
├── docs/
│   ├── ARCHITECTURE.md          # In-depth architectural design
│   ├── DATABASE.md              # Relational models and schema dictionary
│   ├── API.md                   # OpenAPI-style REST reference
│   └── SETUP.md                 # Deployment & development instructions
├── docker-compose.yml           # Multi-container PostgreSQL setup
└── README.md
```

---

## ⚖️ 6. Regulatory Alignment & Attribution

This solution was developed in accordance with the official scheme implementation guidelines of the **Ministry of Tribal Affairs, Government of India**. Data references, eligibility criteria, and benefit structures are strictly aligned with [tribal.nic.in](https://tribal.nic.in/ScholarshiP.aspx). Prototype adapters are designed for seamless migration to production National Data & Analytics Platform (NDAP) and API Setu endpoints.
