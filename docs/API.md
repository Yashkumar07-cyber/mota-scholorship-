# MoTA Unified Scholarship Platform: REST API Reference

All API endpoints are mounted under the `/api` prefix. Protected routes require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt-token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Send OTP
Initiates mobile login for students.
- **Method**: `POST`
- **Path**: `/api/auth/otp/send`
- **Request Body**:
  ```json
  {
    "mobile": "9999999999"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to 9999999999",
    "demoOtp": "123456"
  }
  ```

### 1.2 Verify OTP
Authenticates a student and returns a signed JWT token.
- **Method**: `POST`
- **Path**: `/api/auth/otp/verify`
- **Request Body**:
  ```json
  {
    "mobile": "9999999999",
    "otp": "123456"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "cm0abc...",
      "mobile": "9999999999",
      "role": "STUDENT",
      "student": { "id": "cm0xyz...", "name": "Rahul Munda" }
    }
  }
  ```

### 1.3 Administrator Password Login
Authenticates desk officers and portal administrators.
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@mota-demo.local",
    "password": "Admin@123"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "cm0adm...",
      "email": "admin@mota-demo.local",
      "role": "ADMIN",
      "admin": { "department": "Tribal Welfare Division", "designation": "Senior Director" }
    }
  }
  ```

### 1.4 Get Current Session Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Scholarship Master & Eligibility (`/api/scholarships`)

### 2.1 List All Official Schemes
- **Method**: `GET`
- **Path**: `/api/scholarships`
- **Query Params**: `type=CENTRALLY_SPONSORED|CENTRAL_SECTOR`, `active=true`
- **Response**: Array of 5 official MoTA scholarship schemes with verified eligibility criteria, allowances, and source URLs.

### 2.2 Check Multi-Scheme Eligibility
Evaluates applicant profile data against the official rule engine.
- **Method**: `POST`
- **Path**: `/api/scholarships/check-eligibility`
- **Request Body**:
  ```json
  {
    "casteCategory": "ST",
    "annualFamilyIncome": 180000,
    "academicLevel": "POST_GRADUATE",
    "state": "Jharkhand",
    "institutionName": "Birsa Munda Institute of Technology",
    "isPvtg": false
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "success": true,
    "evaluations": [
      {
        "scholarshipCode": "POST_MATRIC",
        "scholarshipName": "Post-Matric Scholarship for ST Students",
        "eligible": true,
        "reasons": ["ST community criteria satisfied", "Income within statutory limit of ₹2,50,000"],
        "missing_requirements": [],
        "required_documents": ["ST Caste Certificate", "Income Certificate", "Marksheet"],
        "officialSourceUrl": "https://dbttribal.gov.in"
      }
    ]
  }
  ```

---

## 3. Applications Management (`/api/applications`)

### 3.1 List Student Applications
- **Method**: `GET`
- **Path**: `/api/applications`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: List of student applications with embedded scholarship, documents, status history, and payments.

### 3.2 Create New Application
- **Method**: `POST`
- **Path**: `/api/applications`
- **Request Body**:
  ```json
  {
    "scholarshipCode": "POST_MATRIC",
    "academicYear": "2026-2027",
    "documentIds": ["cm0doc1...", "cm0doc2..."]
  }
  ```
- **Response** `(201 Created)`:
  ```json
  {
    "success": true,
    "message": "Application submitted successfully with tracking ID MOTA-2026-881920",
    "application": {
      "id": "cm0app...",
      "applicationId": "MOTA-2026-881920",
      "status": "INSTITUTE_VERIFICATION"
    }
  }
  ```

### 3.3 Resubmit Deficient Application
- **Method**: `PUT`
- **Path**: `/api/applications/:id/resubmit`
- **Request Body**:
  ```json
  {
    "newDocumentId": "cm0doc99...",
    "remarks": "Uploaded updated digitized income certificate from Tehsildar"
  }
  ```

---

## 4. Digital Document Wallet & Verification (`/api/documents`)

### 4.1 Upload Document to Wallet
- **Method**: `POST`
- **Path**: `/api/documents/upload`
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `documentType`, `file`, `applicationId` (optional)

### 4.2 Prototype Verify Document
Simulates institutional verification against DigiLocker, e-District, or AISHE.
- **Method**: `POST`
- **Path**: `/api/documents/:id/verify`
- **Response**:
  ```json
  {
    "success": true,
    "status": "VERIFIED",
    "adapter": "DIGILOCKER",
    "certificateReference": "DL-JH-ST-2026-99120"
  }
  ```

---

## 5. Direct Benefit Transfer Tracking (`/api/payments`)

### 5.1 Get Payment Passbook
- **Method**: `GET`
- **Path**: `/api/payments`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: All PFMS/DBT credits, stage statuses, transaction references, and disbursement dates.

---

## 6. JAGO Conversational AI Assistant (`/api/chat`)

### 6.1 Send Message to JAGO
Context-aware chatbot connecting to live student application state.
- **Method**: `POST`
- **Path**: `/api/chat/message`
- **Request Body**:
  ```json
  {
    "message": "What is the status of my Post-Matric scholarship?",
    "history": []
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "reply": "Namaste Rahul! Your Post-Matric Application (MOTA-2026-784920) is currently at State Verification...",
    "suggestedActions": ["View Application Details", "Check DBT Passbook", "Download Sanction Slip"]
  }
  ```

---

## 7. Administrative & Verification Desk (`/api/admin`)

Requires `ADMIN` or `VERIFICATION_OFFICER` authorization.

### 7.1 Dashboard Metrics
- **Method**: `GET`
- **Path**: `/api/admin/dashboard`
- **Returns**: Total students, applications per status, state-wise distribution, total DBT disbursed, pending manual review count.

### 7.2 Manual Review Queue
- **Method**: `GET`
- **Path**: `/api/admin/manual-reviews`
- **Returns**: Applications flagged with `MANUAL_REVIEW` status and discrepancy details.

### 7.3 Adjudicate Manual Review Decision
- **Method**: `POST`
- **Path**: `/api/admin/manual-reviews/:id/decision`
- **Request Body**:
  ```json
  {
    "decision": "APPROVE",
    "remarks": "Income certificate verified against physical sub-divisional magistrate stamp.",
    "sanctionAmount": 36500
  }
  ```
  *(Supported decisions: `APPROVE`, `REQUEST_CORRECTION`, `REJECT`)*

### 7.4 Demographic Outreach Candidates & Scan
- **Method**: `GET` `/api/admin/outreach`
- **Method**: `POST` `/api/admin/outreach/:id/status` (body: `{ "status": "OUTREACH_PLANNED" }`)
- **Method**: `POST` `/api/admin/outreach/scan` (Triggers AI cross-matching against UDISE+ and APAAR registries)

### 7.5 Immutable Audit Logs
- **Method**: `GET` `/api/admin/audit-logs`
