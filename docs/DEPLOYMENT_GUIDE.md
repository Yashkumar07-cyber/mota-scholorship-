# 🚀 MoTA Unified Scholarship Platform - Complete Vercel & Supabase Deployment Guide

> **Official Reference Source**: Ministry of Tribal Affairs (MoTA)  
> **Architecture**: All-In-One Full-Stack Monorepo on **Vercel** (Frontend SPA + Serverless Express Backend) connected to **Supabase** (Free Managed PostgreSQL).

---

## 🌟 Why Deploy Everything on Vercel?
- ✅ **Single URL**: Both frontend (`/`) and backend (`/api/...`) live on the same domain (e.g. `https://your-mota-platform.vercel.app`).
- ✅ **No CORS Issues**: Browser makes same-origin requests to `/api`.
- ✅ **Zero Cost**: Both Vercel and Supabase provide permanent free tiers.
- ✅ **Instant SSL**: HTTPS is configured automatically.
- ✅ **Global CDN**: Fast delivery across India and worldwide.

---

## 📋 Step-by-Step Deployment Instructions

### STEP 1: Create Free PostgreSQL Database on Supabase

1. Go to [supabase.com](https://supabase.com) and click **Sign Up** (or Sign In with GitHub).
2. Click **New Project**:
   - **Project Name**: `mota-scholarship-db`
   - **Database Password**: Choose a strong password (save it safely).
   - **Region**: Choose **South Asia (Mumbai)** for lowest latency in India.
3. Once the database is ready (takes ~1 minute), navigate to:
   - **Project Settings** (gear icon at bottom-left) $\rightarrow$ **Database** $\rightarrow$ scroll to **Connection String**.
4. Select the **URI** tab and choose **Transaction Pooler** (recommended for serverless) or **Direct**:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

### STEP 2: Switch Database Mode to PostgreSQL & Push Schema

In your project root directory on your local computer, run:

```bash
# 1. Switch Prisma schema to PostgreSQL
npm run use:supabase

# 2. Push the schema directly to your new Supabase database
# On Windows PowerShell:
$env:DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
npm run db:migrate

# 3. Seed official Ministry of Tribal Affairs scholarship schemes
npm run db:seed
```

All 5 official MoTA scholarship schemes (Pre-Matric, Post-Matric, Top Class, NFST, NOS) and seed student records are now permanently saved in your Supabase database!

---

### STEP 3: Push Code to GitHub

```bash
git init
git add .
git commit -m "feat: complete mota platform with dark green theme, vercel fullstack, and supabase"
git branch -M main
git remote add origin https://github.com/your-username/mota-scholarship-platform.git
git push -u origin main
```

---

### STEP 4: Deploy All-in-One to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your `mota-scholarship-platform` repository.
4. **Project Settings**:
   - **Framework Preset**: Other (or Vite)
   - **Root Directory**: `./` (Leave as root!)
   - **Build Command**: `npm run vercel-build` (Pre-configured in `vercel.json`)
   - **Output Directory**: `frontend/dist`
5. **Environment Variables**:
   Click **Environment Variables** and add the following keys:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase PostgreSQL URI |
| `JWT_SECRET` | `mota_secure_jwt_token_key_2026_tribal_affairs` | Secret key for authentication tokens |
| `ADMIN_SECRET_KEY` | `MOTA-OFFICER-2026` | Special authorization clearance key for officers |
| `FAST2SMS_API_KEY` | `your_fast2sms_api_key_here` *(Optional)* | For real SMS to mobile phones (Free at fast2sms.com) |
| `VERIFICATION_MODE` | `MOCK` | Simulates DigiLocker and e-District verification |
| `NODE_ENV` | `production` | Production environment flag |

6. Click **Deploy**!
   Vercel will compile the frontend Vite assets and deploy the Express API as a serverless backend function.

---

## 📱 How Real SMS & Fallback Works

The platform includes a real SMS engine configured in `backend/src/services/sms/smsService.ts`:

1. **Option A: Fast2SMS (Free & Instant for India)**:
   - Create a free account at [fast2sms.com](https://fast2sms.com).
   - Copy your API key from Dev API tab.
   - Add `FAST2SMS_API_KEY=your_key` to `.env` or Vercel Environment Variables.
   - Real 6-digit OTP SMS is delivered to any Indian mobile number within 3 seconds!

2. **Option B: Twilio (International)**:
   - Provide `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.

3. **Fallback Simulation**:
   - If no API key is provided, the platform automatically enters development simulation mode. The generated OTP is logged securely and returned in the developer response for testing.
   - Demo number `9999999999` with OTP `123456` always works for instant review.

---

## 🔒 Security & Officer Clearance

- **Zero Credentials on Screen**: No passwords or OTP codes are displayed anywhere in the UI.
- **Student OTP Login**: Requires entering a real mobile number, receiving an OTP, and verifying.
- **Student Registration (OTR)**: Automatically generates unique `OTR-ST-2026-XXXXX` and saves the profile to Supabase.
- **Admin Clearance**: Admin portal is strictly locked. An officer must provide:
  1. Officer Email (`admin@mota.gov.in`)
  2. Officer Password (`Admin@123`)
  3. **Special Authorization Passcode**: `MOTA-OFFICER-2026`
  Access is rejected if the clearance passcode does not match.

---

## 🧪 Post-Deployment Verification Checklist

1. **Health Check**: Open `https://your-mota-platform.vercel.app/api/health` - should return `status: HEALTHY`.
2. **Student Dashboard**: Open `/dashboard` - dark green sidebar `#062e1e`, greeting banner, 4 KPI cards, 5 schemes.
3. **Hindi Converter**: Tap the **हिंदी / English** button in the top bar - language flips instantly.
4. **Chatbot Personalization**: Open JAGO chatbot - greets the logged-in student by name and provides live status.
5. **Admin Operations**: Open `/login`, switch to Authorized Officer tab, log in with `MOTA-OFFICER-2026` - review cases, check live notifications drawer, and adjudicate pending files.
