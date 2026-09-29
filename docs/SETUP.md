# Quickstart & Setup Guide: MoTA Unified Scholarship Platform

This guide walks you through setting up and running the MoTA Unified Scholarship Platform locally or via Docker.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node.js v20.18.0 LTS)
- **npm**: v9.0.0 or higher
- **Git** (optional)
- **Docker & Docker Compose** (optional, for production PostgreSQL container)

---

## 2. Local Development (Zero-Dependency SQLite)

The platform comes pre-configured with a zero-dependency SQLite database (`backend/dev.db`), complete with 10 realistic ST student profiles, 15 multi-stage applications, verified documents, and DBT payments.

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Database Preparation (Already Seeded)
If you wish to re-seed or reset the database from scratch:
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to SQLite
npx prisma db push

# Seed realistic demo data
npm run seed
```

### Step 3: Start the Backend Server
```bash
npm run dev
```
The REST API server will start on: **`http://localhost:5000`**
Health check: `http://localhost:5000/api/health`

### Step 4: Install Frontend Dependencies & Start UI
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React 18 / Vite application will start on: **`http://localhost:5173`**

---

## 3. Demo Credentials

The platform is seeded with realistic credentials for evaluation:

### Student Persona
- **Mobile Number**: `9999999999`
- **One-Time Password (OTP)**: `123456` *(Demo mode displays the OTP on screen)*
- **Profile**: Rahul Munda, B.Tech CSE at Birsa Munda Institute of Technology, Ranchi, Jharkhand.
- **Family**: Sister Priya Munda (Pre-Matric scholar), Brother Aman Munda (Middle School).

### Administrator / Verification Officer Persona
- **Email**: `admin@mota-demo.local`
- **Password**: `Admin@123`
- **Designation**: Senior Verification Officer, Ministry of Tribal Affairs (MoTA).

---

## 4. End-to-End Demo Workflow (Requirement 38)

To evaluate the complete lifecycle of a scholarship application:

1. **Student Login**:
   - Navigate to `http://localhost:5173/login`.
   - Select **Student Login**, enter mobile `9999999999`, click *Send OTP*.
   - Enter `123456` and submit.
2. **Explore & Check Eligibility**:
   - Visit the **Scholarships** tab (`/scholarships`).
   - Use the **AI Eligibility Engine** to test criteria across all 5 official MoTA schemes.
3. **Submit Post-Matric Application**:
   - Click *Apply Now* on **Post-Matric Scholarship for ST Students**.
   - Review pre-filled OTR demographic information and bank DBT link.
   - Run the **Prototype Verification Mesh**:
     - ST Caste Certificate $\rightarrow$ Verified via DigiLocker.
     - Academic Enrollment $\rightarrow$ Verified via AISHE.
     - Income Certificate $\rightarrow$ Flags threshold discrepancy $\rightarrow$ routes to **Manual Review**.
   - Submit the application and receive tracking number `MOTA-2026-XXXXXX`.
4. **Officer Review & Correction Request**:
   - Log out and log in as Admin (`admin@mota-demo.local` / `Admin@123`).
   - Navigate to the **Manual Review Desk**.
   - Open the student's case and click **Request Correction** with note: *"Please upload certified sub-divisional magistrate income certificate."*
5. **Student Correction & Sanction**:
   - Log back in as Student `9999999999`.
   - Notice the high-priority alert on the Dashboard and Application Tracker.
   - Upload the corrected document in the Document Wallet and click *Resubmit Application*.
   - Officer reviews and clicks **Approve & Issue Sanction Order**.
6. **DBT Disbursement & JAGO AI**:
   - Student's payment passbook (`/payments`) reflects newly credited scholarship amount.
   - Open **JAGO Chatbot** (`/chatbot`) and type: *"What is my application status?"*
   - JAGO responds with live database details, confirming sanction and PFMS transaction ID.

---

## 5. Running Automated Tests

A comprehensive suite of automated integration tests covers authentication, the eligibility engine, application creation, prototype verification adapters, admin decisions, and JAGO contextual chat:

```bash
cd backend
npm test
```

Expected output:
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

Tests: 11 passed, 11 total
```

---

## 6. Production Deployment with Docker (PostgreSQL 16)

For containerized cloud deployments:

```bash
# Start PostgreSQL database and platform services
docker compose up -d

# Verify containers are healthy
docker compose ps
```

The database configuration in `docker-compose.yml` mounts PostgreSQL 16 on port 5432 and executes the schema defined in `database/schema.postgres.prisma`.
