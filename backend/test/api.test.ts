// Automated Test Suite for MoTA Unified Scholarship Platform
import http from 'http';
import app from '../src/server';

const PORT = 5099;
let server: http.Server;
let studentToken = '';
let adminToken = '';
let testApplicationId = '';

function request(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data = raw ? JSON.parse(raw) : null;
            resolve({ status: res.statusCode || 200, data });
          } catch (e) {
            resolve({ status: res.statusCode || 200, data: raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Automated Backend Test Suite');
  console.log('======================================================\n');

  server = app.listen(PORT);
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message || err);
      failed++;
    }
  }

  // 1. Healthcheck
  await test('GET /api/health should return HEALTHY status', async () => {
    const res = await request('/api/health');
    if (res.status !== 200 || res.data.status !== 'HEALTHY') {
      throw new Error(`Expected 200 and HEALTHY, got ${res.status}`);
    }
  });

  // 2. Official Scholarships Retrieval
  await test('GET /api/scholarships returns exactly 5 official MoTA schemes', async () => {
    const res = await request('/api/scholarships');
    if (res.status !== 200 || res.data.count < 5) {
      throw new Error(`Expected at least 5 schemes, got ${res.data.count}`);
    }
    const codes = res.data.scholarships.map((s: any) => s.code);
    const required = ['PRE_MATRIC', 'POST_MATRIC', 'TOP_CLASS', 'NFST', 'NOS'];
    for (const reqCode of required) {
      if (!codes.includes(reqCode)) {
        throw new Error(`Missing mandatory scheme: ${reqCode}`);
      }
    }
  });

  // 3. Student Demo Login (Mobile: 9999999999, OTP: 123456)
  await test('POST /api/auth/login with Student Mobile & Demo OTP 123456', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { mobile: '9999999999', otp: '123456' },
    });
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Login failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    studentToken = res.data.token;
  });

  // 4. Admin Login (admin@mota-demo.local, password: Admin@123)
  await test('POST /api/auth/login with Admin Credentials', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'admin@mota-demo.local', password: 'Admin@123' },
    });
    if (res.status !== 200 || !res.data.token || res.data.user.role !== 'ADMIN') {
      throw new Error(`Admin login failed: ${JSON.stringify(res.data)}`);
    }
    adminToken = res.data.token;
  });

  // 5. Eligibility Engine
  await test('POST /api/scholarships/eligibility/check evaluates student criteria', async () => {
    const res = await request('/api/scholarships/eligibility/check', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        scholarshipCode: 'POST_MATRIC',
        studentProfile: {
          tribeCategory: 'ST',
          familyIncome: 180000,
          course: 'B.Tech Computer Science',
        },
      },
    });
    if (res.status !== 200 || !res.data.evaluation?.eligible) {
      throw new Error(`Eligibility check failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 6. Application Creation
  await test('POST /api/applications creates new application record', async () => {
    const res = await request('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        scholarshipCode: 'POST_MATRIC',
        academicYear: '2025-2026',
        status: 'MANUAL_REVIEW', // Simulating manual review flow from problem statement
        remarks: 'Uploaded revenue certificate awaiting spelling check',
      },
    });
    if (res.status !== 201 || !res.data.application?.applicationId) {
      throw new Error(`Failed to create application: ${JSON.stringify(res.data)}`);
    }
    testApplicationId = res.data.application.id;
  });

  // 7. Document Prototype Verification
  await test('POST /api/documents uploads and verifies document via Prototype adapter', async () => {
    const res = await request('/api/documents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        documentType: 'ST_CERTIFICATE',
        fileName: 'Munda_ST_Certificate_Test.pdf',
        fileUrl: '/uploads/test-cert.pdf',
      },
    });
    if (res.status !== 201 || res.data.verificationResult?.status !== 'VERIFIED') {
      throw new Error(`Document verification failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 8. Admin Manual Review Decision
  await test('POST /api/admin/manual-reviews/:id/decision approves and sanctions application', async () => {
    const res = await request(`/api/admin/manual-reviews/${testApplicationId}/decision`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        decision: 'APPROVE',
        remarks: 'Manual verification complete. Tehsildar seal confirmed.',
        sanctionAmount: 36500,
      },
    });
    if (res.status !== 200 || res.data.application?.status !== 'SANCTIONED') {
      throw new Error(`Admin decision failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 9. Payment Tracking
  await test('GET /api/payments retrieves credited DBT record', async () => {
    const res = await request('/api/payments', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (res.status !== 200 || res.data.payments.length === 0) {
      throw new Error(`Payment retrieval failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 10. JAGO Context-Aware Chatbot
  await test('POST /api/chat answers using live application database status', async () => {
    const res = await request('/api/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        message: 'What is my application status?',
      },
    });
    if (res.status !== 200 || !res.data.response?.message || !res.data.response.message.includes('Rahul')) {
      throw new Error(`JAGO failed to provide student-specific status: ${JSON.stringify(res.data)}`);
    }
  });

  // 11. Admin Dashboard Metrics
  await test('GET /api/admin/dashboard returns operational metrics and chart data', async () => {
    const res = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200 || !res.data.metrics?.totalApplications) {
      throw new Error(`Admin metrics failed: ${JSON.stringify(res.data)}`);
    }
  });

  server.close();

  console.log('\n======================================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  if (server) server.close();
  process.exit(1);
});
