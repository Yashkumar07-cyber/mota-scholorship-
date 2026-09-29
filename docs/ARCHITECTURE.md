# System Architecture: MoTA Unified Scholarship Platform

## 1. Executive Overview

The **Ministry of Tribal Affairs (MoTA) Unified Scholarship Platform** is an enterprise-grade, mobile-first digital governance portal designed to streamline, authenticate, and accelerate scholarship delivery for Scheduled Tribe (ST) students across India.

Rooted in the official directives and scheme frameworks published on the [Ministry of Tribal Affairs Official Scholarship Portal](https://tribal.nic.in/ScholarshiP.aspx), the platform replaces fragmented regional processes with a unified national registry, automated eligibility computation, multi-tier document verification, real-time DBT disbursement tracking, and an interactive multilingual AI assistant (**JAGO**).

```
                      +-----------------------------------+
                      |      MoTA Scholarship Platform    |
                      +-----------------------------------+
                                        |
             +--------------------------+--------------------------+
             |                                                     |
             v                                                     v
+--------------------------+                             +--------------------------+
|  Mobile-First Student UI |                             |   Desktop Admin Portal   |
|  - React 18 / Tailwind   |                             |   - Verification Desk    |
|  - OTR & Multi-Role Auth |                             |   - Manual Review Queue  |
|  - Real-time Tracker     |                             |   - DBT / PFMS Monitor   |
|  - JAGO AI Voice/Chat    |                             |   - AI Outreach Engine   |
+--------------------------+                             +--------------------------+
             |                                                     |
             +--------------------------+--------------------------+
                                        |
                                        v
                      +-----------------------------------+
                      |        RESTful Gateway (Node/TS)  |
                      |  - JWT / OTP Authentication       |
                      |  - Rule-Based Eligibility Engine  |
                      |  - Prototype Verification Mesh    |
                      |  - Audit Log & Event Dispatcher   |
                      +-----------------------------------+
                                        |
             +--------------------------+--------------------------+
             |                          |                          |
             v                          v                          v
+------------------------+  +------------------------+  +------------------------+
|   Relational Database  |  |  Prototype Verifiers   |  |   JAGO AI Assistant    |
| - SQLite (Zero-dep Dev)|  | - DigiLocker API       |  | - Live Student Context |
| - PostgreSQL 16 (Prod) |  | - State e-District     |  | - Scheme FAQ Retrieval |
| - Prisma ORM 5.15      |  | - AISHE / UDISE+       |  | - Action Routing       |
+------------------------+  +------------------------+  +------------------------+
```

---

## 2. Design Principles & Guidelines

### 2.1 Mobile-First Experience for Rural & Tribal Regions
- **Low-Bandwidth Optimized**: Lightweight SVG assets, minimal bundle footprint, and progressive loading with skeleton screens.
- **Ergonomic Bottom Navigation**: 5-point thumb-reachable navigation designed for modern 360px - 430px smartphone viewports.
- **Clear Typography & Contrast**: Government forest green (`#0c5c3a`), warm off-white (`#fbfaf6`), and high-contrast charcoal text meeting WCAG 2.1 AA accessibility standards.
- **Biometric & OTP Simulation**: Frictionless login via 10-digit mobile number with simulated high-assurance OTP delivery.

### 2.2 Integrity & Source of Truth
- All 5 scholarship schemes implemented are directly linked to official MoTA notifications:
  1. **Pre-Matric Scholarship for ST Students** (Classes IX & X)
  2. **Post-Matric Scholarship for ST Students** (Class XI through Post-Doctoral)
  3. **National Scholarship for Higher Education of ST Students** (Top Class Education across 265 Premier Institutes)
  4. **National Fellowship for ST Students** (NFST for M.Phil / Ph.D. scholars)
  5. **National Overseas Scholarship for ST Students** (NOS for Master's/Ph.D. abroad)
- No synthetic schemes or unverified thresholds: Income ceilings (₹2.50L/₹6.00L), gender equity rules, and PVTG (Particularly Vulnerable Tribal Groups) priority quotas are strictly enforced.

---

## 3. Core Engine Subsystems

### 3.1 Deterministic Eligibility Engine (`eligibilityEngine.ts`)
The eligibility engine evaluates candidate profiles against formal scheme requirements using a multi-rule deterministic pipeline:
- **Tribe & Caste Validation**: Verifies applicant belongs to a recognized Scheduled Tribe community.
- **Income Assessment**: Checks parental annual income against statutory caps (₹2,50,000 for Pre/Post Matric; ₹6,00,000 for Top Class & Overseas).
- **Institution & Academic Fit**: Cross-verifies AISHE codes, course level, and enrollment status.
- **Exclusion Safeguards**: Prevents dual claiming across overlapping Centrally Sponsored Schemes while allowing complementary state top-up allowances.

### 3.2 Prototype Verification Adapter Mesh (`verificationService.ts`)
To emulate India's digital public infrastructure (DPI) without external network dependencies, the platform incorporates high-fidelity prototype verification adapters:
- **DigiLocker Adapter**: Emulates machine-to-machine SHA-256 certificate validation for Aadhaar and Caste certificates.
- **e-District State Revenue Adapter**: Validates authenticity of State Tehsildar/Revenue income certificates with simulated discrepancy handling.
- **AISHE / UDISE+ Adapter**: Verifies institute accreditation and student enrollment status.
- **Automated Fallback to Manual Review**: If verification reports any ambiguity (e.g. slight name spelling variations or legacy paper certificates), the engine shifts the application to `MANUAL_REVIEW` status rather than outright rejection.

### 3.3 State Machine Application Lifecycle
Applications progress through an 11-stage state machine:
```
DRAFT -> SUBMITTED -> INSTITUTE_VERIFICATION -> STATE_VERIFICATION
      -> MINISTRY_VERIFICATION -> MANUAL_REVIEW -> SANCTIONED
      -> DBT_PROCESSING -> DISBURSED
[Exceptions: DEFICIENCY (returns to student for re-upload) | REJECTED]
```
Every transition records immutable status history with timestamp, actor ID, and formal justification.

### 3.4 JAGO Contextual Chatbot (`jagoChatbot.ts`)
Named **JAGO** ("Jaago" - Awaken/Informed), the platform's conversational AI assistant provides proactive guidance:
- Connects directly to the student's active database profile.
- Knows active application numbers, current verification stages, and pending deficiencies without prompting.
- Answers scheme-specific rules, allowance calculations, and required document checklists.

### 3.5 Proactive Outreach & Demographic Cross-Matching (`outreachService.ts`)
Discovers ST students present in national educational databases (UDISE+ school enrollment, APAAR student identity registry) who have not applied for tribal scholarships:
- Identifies target populations in tribal-dominated districts.
- Computes scholarship drop-off rates between Class X and XI.
- Enables district welfare officers to organize targeted outreach camps.

---

## 4. Security, Compliance & Auditability

1. **Role-Based Access Control (RBAC)**: Strict separation between `STUDENT`, `VERIFICATION_OFFICER`, and `ADMIN` roles.
2. **Password & Token Security**: Passwords hashed using `bcrypt` (12 rounds); stateless API requests authenticated via signed JSON Web Tokens (`HS256`).
3. **Data Masking**: Masked Aadhaar (`XXXX-XXXX-1234`) and bank account numbers (`XXXXXX7890`) displayed across all UI views.
4. **Tamper-Evident Audit Logging**: Every administrative action (document approval, correction request, rejection, status change) is recorded in an immutable `AuditLog` table with actor metadata and diff payload.
