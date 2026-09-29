# Database Schema & Data Models: MoTA Platform

## 1. Overview & Dual Environment Strategy

The MoTA Unified Scholarship Platform uses **Prisma ORM (v5.15)** with a dual-database deployment architecture:

| Environment | Engine | Configuration File | Use Case |
| :--- | :--- | :--- | :--- |
| **Development** | SQLite (`dev.db`) | `backend/prisma/schema.prisma` | Zero-dependency, zero-configuration local development. |
| **Production** | PostgreSQL 16 | `database/schema.postgres.prisma` | High-concurrency, ACID-compliant cloud / containerized deployment via Docker Compose. |

Both schemas maintain 100% structural parity across all tables, fields, enums, foreign keys, and indexes.

---

## 2. Entity Relationship Model

```
+------------------+         1:1         +----------------------+
|       User       | ------------------> |    StudentProfile    |
| (Auth, Role, JWT)|                     | (Aadhaar, OTR, Bank) |
+------------------+                     +----------------------+
         |                                           |
         | 1:1 (Admin)                               | 1:N
         v                                           v
+------------------+                     +----------------------+
|    AdminUser     |                     |    FamilyMember      |
+------------------+                     +----------------------+
                                                     |
                                                     | 1:N
                                                     v
+------------------+         1:N         +----------------------+
|   Scholarship    | ------------------> |     Application      |
| (5 MoTA Schemes) |                     | (11 Lifecycle Stages)|
+------------------+                     +----------------------+
                                                     |
                         +---------------------------+---------------------------+
                         | 1:N                                                   | 1:N
                         v                                                       v
              +----------------------+                                +----------------------+
              |       Document       |                                |       Payment        |
              | (Wallet & Metadata)  |                                | (PFMS / DBT Records) |
              +----------------------+                                +----------------------+
                         |
                         | 1:N
                         v
              +----------------------+
              | DocumentVerification |
              | (DigiLocker, AISHE)  |
              +----------------------+
```

---

## 3. Core Tables and Schema Definitions

### 3.1 `User` & `AdminUser`
- **User**: Stores authentication credentials, mobile number (primary key for students), email, hashed password (`bcrypt`), role (`STUDENT`, `VERIFICATION_OFFICER`, `ADMIN`), and active status.
- **AdminUser**: Administrative profile linking department (e.g. "Tribal Welfare Division"), designation, and official employee ID.

### 3.2 `StudentProfile`
- **Identity & Demographics**: `name`, `dateOfBirth`, `gender`, `mobile`, `email`, `state`, `district`.
- **Tribal Credentials**: `tribeCategory`, `tribeName` (e.g., Santhal, Gond, Bhil, Munda), and boolean `pvtgStatus` (Particularly Vulnerable Tribal Groups).
- **National Registry Identifiers**: One-Time Registration ID (`otrId`, e.g. `OTR-2026-JH-883921`) and masked Aadhaar reference.
- **Academic Enrollment**: `institution`, `institutionId` (AISHE code), `course`, `academicYear`.
- **Financial & DBT**: Annual `familyIncome`, `bankStatus`, masked account number (`accountNumberMasked`), `ifscCode`, and `dbtStatus` (`LINKED_ACTIVE`).
- **Profile Completion**: Computed `profileCompletionPct` (0 - 100%).

### 3.3 `FamilyMember`
Enables the **Family Scholarship View**:
- Tracks siblings/dependents, their relation, age, current education level, and active scholarship status (e.g. Priya Munda availing Pre-Matric).

### 3.4 `Scholarship` (Official MoTA Schemes)
Stores scheme master data matching the official portal:
- `code`: `PRE_MATRIC`, `POST_MATRIC`, `TOP_CLASS`, `NFST`, `NOS`.
- `schemeType`: `CENTRALLY_SPONSORED` or `CENTRAL_SECTOR`.
- `eligibility`, `benefits`, `applicationProcess`, `requiredDocuments` (JSON).
- `importantDates` (JSON).
- `sourceUrl`: Verified official domain (e.g., `dbttribal.gov.in`, `scholarships.gov.in`).
- `lastVerifiedAt`: Audit date of scheme guidelines.

### 3.5 `Application` & `ApplicationStatusHistory`
- **Application**: Tracks unique alphanumeric ID (format: `MOTA-2026-XXXXXX`), current status, current stage string, submission date, sanction date, and officer remarks.
- **ApplicationStatusHistory**: Immutable event log tracking each transition (`fromStatus`, `toStatus`, `remarks`, `changedBy`, `changedAt`).

### 3.6 `Document` & `DocumentVerification`
- **Document**: Manages uploaded files in the student's digital wallet (caste certificate, income certificate, marksheet, fee receipt).
- **DocumentVerification**: Records results from verification adapters:
  - `verificationAdapter`: `DIGILOCKER`, `EDISTRICT`, `AISHE`, `APAAR`, `UIDAI`.
  - `externalReference`: Verification transaction / certificate ID.
  - `status`: `VERIFIED`, `MISMATCH`, `UNAVAILABLE`, `MANUAL_REVIEW`.
  - `details`: Verification payload diff.

### 3.7 `Payment` (DBT / PFMS)
- Stores direct benefit transfer records:
  - `amount`: Sanctioned monetary amount in INR.
  - `status`: `PENDING`, `PROCESSING`, `CREDITED`, `FAILED`.
  - `transactionId`: PFMS reference number (e.g. `PFMS-2026-ST-482910`).
  - `paymentDate`: Settlement timestamp.
  - `dbtStatus`: Bank credit confirmation code.

### 3.8 `OutreachCandidate` & `AuditLog`
- **OutreachCandidate**: Stores discovered students from cross-dataset matching (UDISE+, APAAR, tribal census).
- **AuditLog**: Tamper-evident administrative action log capturing `userId`, `userRole`, `action`, `entity`, `entityId`, `oldValue`, and `newValue`.

---

## 4. Seed Data Summary

The local development SQLite database is pre-seeded with rich, realistic data:
- **10 Verified Students** across Jharkhand, Odisha, Madhya Pradesh, Maharashtra, Assam, and Rajasthan representing diverse communities (Munda, Santhal, Gond, Bhil, Bodo, Katkari PVTG).
- **15 Multi-Stage Applications** illustrating all 11 lifecycle statuses.
- **30+ Verified & Pending Documents** linked to prototype verifier records.
- **10 PFMS Payment Disbursements** with live transaction IDs.
- **50 Potential Outreach Beneficiaries** mapped across rural tribal clusters.
