import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { officialScholarshipData } from '../scripts/import-scholarships';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Commencing MoTA Database Seeding with Verified & Demo Data ---');

  // Clear existing demo tables in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.outreachCandidate.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.documentVerification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.scholarshipEligibilityRule.deleteMany();
  await prisma.scholarship.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.verificationSource.deleteMany();

  // 1. Seed Verification Sources
  const sources = [
    { code: 'DIGILOCKER', name: 'DigiLocker (National Academic Depository)', isMock: true, description: 'Academic Marksheets and Identity Records' },
    { code: 'EDISTRICT', name: 'State e-District Portal', isMock: true, description: 'Caste & Income Revenue Certificates' },
    { code: 'AISHE', name: 'All India Survey on Higher Education', isMock: true, description: 'Higher Educational Institution Accreditation' },
    { code: 'APAAR', name: 'APAAR (One Nation One Student ID)', isMock: true, description: 'Academic Bank of Credits and Student Registry' },
    { code: 'UIDAI', name: 'UIDAI / NPCI Aadhaar DBT Mapper', isMock: true, description: 'Aadhaar Authentication and DBT Seeding Status' },
    { code: 'UGC_NTA', name: 'National Testing Agency / UGC', isMock: true, description: 'UGC NET/JRF Eligibility Scorecard Verification' },
  ];
  for (const src of sources) {
    await prisma.verificationSource.create({ data: src });
  }

  // 2. Seed Institutions
  const institutions = [
    { code: 'NIT_JSR', name: 'National Institute of Technology, Jamshedpur', aisheCode: 'C-42512', state: 'Jharkhand', district: 'East Singhbhum', type: 'PREMIER_INSTITUTE', isTopClass: true },
    { code: 'IIT_DHN', name: 'Indian Institute of Technology (ISM), Dhanbad', aisheCode: 'U-0205', state: 'Jharkhand', district: 'Dhanbad', type: 'PREMIER_INSTITUTE', isTopClass: true },
    { code: 'RANCHI_UNIV', name: 'Ranchi University, Ranchi', aisheCode: 'U-0207', state: 'Jharkhand', district: 'Ranchi', type: 'UNIVERSITY', isTopClass: false },
    { code: 'AIIMS_RPR', name: 'All India Institute of Medical Sciences, Raipur', aisheCode: 'U-0683', state: 'Chhattisgarh', district: 'Raipur', type: 'PREMIER_INSTITUTE', isTopClass: true },
    { code: 'GU_ASM', name: 'Gauhati University, Guwahati', aisheCode: 'U-0050', state: 'Assam', district: 'Kamrup', type: 'UNIVERSITY', isTopClass: false },
    { code: 'IIT_BOM', name: 'Indian Institute of Technology Bombay', aisheCode: 'U-0306', state: 'Maharashtra', district: 'Mumbai', type: 'PREMIER_INSTITUTE', isTopClass: true },
    { code: 'NEHU_SHL', name: 'North-Eastern Hill University, Shillong', aisheCode: 'U-0334', state: 'Meghalaya', district: 'East Khasi Hills', type: 'UNIVERSITY', isTopClass: false },
    { code: 'DAV_PUBLIC', name: 'DAV Public School, Hehal, Ranchi', udiseCode: '20200109201', state: 'Jharkhand', district: 'Ranchi', type: 'HIGHER_SECONDARY', isTopClass: false },
  ];
  for (const inst of institutions) {
    await prisma.institution.create({ data: inst });
  }

  // 3. Seed Scholarships (Official MoTA Data)
  const createdScholarships: Record<string, string> = {};
  for (const s of officialScholarshipData) {
    const sc = await prisma.scholarship.create({ data: s });
    createdScholarships[s.code] = sc.id;
  }

  // 4. Seed Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mota-demo.local',
      mobile: '9876543210',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      admin: {
        create: {
          department: 'Scholarship Division, Ministry of Tribal Affairs',
          designation: 'Senior Verification Officer',
          employeeId: 'MOTA-OFFICER-042',
        },
      },
    },
  });

  // 5. Seed Primary Demo Student (Rahul Munda - mobile: 9999999999, OTP: 123456)
  const studentPasswordHash = await bcrypt.hash('123456', 10);
  const primaryStudentUser = await prisma.user.create({
    data: {
      email: 'rahul.munda@demo.local',
      mobile: '9999999999',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      student: {
        create: {
          name: 'Rahul Munda',
          dateOfBirth: '2004-05-14',
          gender: 'MALE',
          mobile: '9999999999',
          email: 'rahul.munda@demo.local',
          state: 'Jharkhand',
          district: 'Ranchi',
          tribeCategory: 'ST',
          tribeName: 'Munda',
          pvtgStatus: false,
          otrId: 'OTR-ST-2026-90412',
          institution: 'National Institute of Technology, Jamshedpur',
          institutionId: 'NIT_JSR',
          course: 'B.Tech in Computer Science and Engineering',
          academicYear: '2025-2026',
          familyIncome: 180000,
          bankStatus: 'ACTIVE',
          bankName: 'State Bank of India',
          accountNumberMasked: 'XXXX-XXXX-4589',
          ifscCode: 'SBIN0001882',
          dbtStatus: 'AADHAAR_SEEDED',
          profileCompletionPct: 90,
          familyMembers: {
            create: [
              {
                name: 'Priya Munda',
                relation: 'SISTER',
                age: 15,
                educationLevel: 'Class X (DAV Public School)',
                currentScholarship: 'Pre-Matric Scholarship',
                scholarshipStatus: 'Verification',
              },
              {
                name: 'Aman Munda',
                relation: 'BROTHER',
                age: 19,
                educationLevel: 'B.Tech 1st Year (IIT ISM Dhanbad)',
                currentScholarship: 'Top Class Education',
                scholarshipStatus: 'Sanctioned',
              },
              {
                name: 'Sombari Munda',
                relation: 'MOTHER',
                age: 46,
                educationLevel: 'Secondary Education',
                currentScholarship: 'None',
                scholarshipStatus: 'None',
              },
            ],
          },
        },
      },
    },
    include: { student: true },
  });

  const rahul = primaryStudentUser.student!;

  // 6. Seed Additional 9 Demo Students
  const otherStudentsData = [
    { name: 'Ananya Santhal', mobile: '9888800001', email: 'ananya.santhal@demo.local', state: 'Jharkhand', district: 'Dumka', tribe: 'Santhal', course: 'B.Sc Nursing', inst: 'Ranchi University, Ranchi', income: 120000, pvtg: false, otr: 'OTR-ST-2026-10001' },
    { name: 'Birsa Birhor', mobile: '9888800002', email: 'birsa.birhor@demo.local', state: 'Jharkhand', district: 'Hazaribagh', tribe: 'Birhor', course: 'Class X', inst: 'DAV Public School, Hehal, Ranchi', income: 70000, pvtg: true, otr: 'OTR-ST-2026-10002' },
    { name: 'Devika Gond', mobile: '9888800003', email: 'devika.gond@demo.local', state: 'Madhya Pradesh', district: 'Dindori', tribe: 'Gond', course: 'Ph.D in Environmental Science', inst: 'Ranchi University, Ranchi', income: 150000, pvtg: false, otr: 'OTR-ST-2026-10003' },
    { name: 'Kalyan Bodo', mobile: '9888800004', email: 'kalyan.bodo@demo.local', state: 'Assam', district: 'Kokrajhar', tribe: 'Bodo', course: 'B.Tech Mechanical', inst: 'Gauhati University, Guwahati', income: 210000, pvtg: false, otr: 'OTR-ST-2026-10004' },
    { name: 'Sunita Oraon', mobile: '9888800005', email: 'sunita.oraon@demo.local', state: 'Odisha', district: 'Sundargarh', tribe: 'Oraon', course: 'MBBS (2nd Year)', inst: 'All India Institute of Medical Sciences, Raipur', income: 190000, pvtg: false, otr: 'OTR-ST-2026-10005' },
    { name: 'Manoj Bhil', mobile: '9888800006', email: 'manoj.bhil@demo.local', state: 'Rajasthan', district: 'Banswara', tribe: 'Bhil', course: 'M.Sc Physics', inst: 'IIT Bombay', income: 160000, pvtg: false, otr: 'OTR-ST-2026-10006' },
    { name: 'Rupali Khasi', mobile: '9888800007', email: 'rupali.khasi@demo.local', state: 'Meghalaya', district: 'East Khasi Hills', tribe: 'Khasi', course: 'M.Phil English Literature', inst: 'North-Eastern Hill University, Shillong', income: 220000, pvtg: false, otr: 'OTR-ST-2026-10007' },
    { name: 'Kiran Toda', mobile: '9888800008', email: 'kiran.toda@demo.local', state: 'Tamil Nadu', district: 'Nilgiris', tribe: 'Toda', course: 'M.S. in Sustainable Energy (Oxford Univ - Overseas)', inst: 'University of Oxford', income: 240000, pvtg: true, otr: 'OTR-ST-2026-10008' },
    { name: 'Rakesh Baiga', mobile: '9888800009', email: 'rakesh.baiga@demo.local', state: 'Chhattisgarh', district: 'Bilaspur', tribe: 'Baiga', course: 'Class IX', inst: 'Govt Higher Secondary School, Bilaspur', income: 65000, pvtg: true, otr: 'OTR-ST-2026-10009' },
  ];

  const studentProfiles = [rahul];

  for (const st of otherStudentsData) {
    const u = await prisma.user.create({
      data: {
        email: st.email,
        mobile: st.mobile,
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        student: {
          create: {
            name: st.name,
            dateOfBirth: '2004-08-20',
            gender: 'FEMALE',
            mobile: st.mobile,
            email: st.email,
            state: st.state,
            district: st.district,
            tribeCategory: 'ST',
            tribeName: st.tribe,
            pvtgStatus: st.pvtg,
            otrId: st.otr,
            institution: st.inst,
            course: st.course,
            academicYear: '2025-2026',
            familyIncome: st.income,
            bankStatus: 'ACTIVE',
            accountNumberMasked: 'XXXX-XXXX-9912',
            dbtStatus: 'AADHAAR_SEEDED',
            profileCompletionPct: 88,
          },
        },
      },
      include: { student: true },
    });
    studentProfiles.push(u.student!);
  }

  // 7. Seed Rahul's initial pre-existing application
  // An active application in STATE_VERIFICATION to populate his home dashboard
  const rahulExistingApp = await prisma.application.create({
    data: {
      applicationId: 'MOTA-2025-000412',
      studentId: rahul.id,
      scholarshipId: createdScholarships['POST_MATRIC'],
      academicYear: '2024-2025',
      status: 'DISBURSED',
      currentStage: 'Disbursement Completed',
      submissionDate: new Date('2024-09-10'),
      sanctionDate: new Date('2024-11-20'),
      remarks: 'Sanction Order MOTA/SCH/2024/771 issued. DBT transferred.',
      statusHistory: {
        create: [
          { fromStatus: 'DRAFT', toStatus: 'SUBMITTED', remarks: 'Submitted by applicant', changedBy: 'Rahul Munda', changedAt: new Date('2024-09-10') },
          { fromStatus: 'SUBMITTED', toStatus: 'INSTITUTE_VERIFICATION', remarks: 'Nodal officer approved admission bonafide', changedBy: 'NIT Jamshedpur Verification Officer', changedAt: new Date('2024-09-18') },
          { fromStatus: 'INSTITUTE_VERIFICATION', toStatus: 'STATE_VERIFICATION', remarks: 'State Welfare Dept validated ST quota', changedBy: 'Jharkhand Welfare Officer', changedAt: new Date('2024-10-05') },
          { fromStatus: 'STATE_VERIFICATION', toStatus: 'SANCTIONED', remarks: 'Central sanction order issued', changedBy: 'MoTA Central Desk', changedAt: new Date('2024-11-20') },
          { fromStatus: 'SANCTIONED', toStatus: 'DISBURSED', remarks: 'PFMS credit processed', changedBy: 'System / PFMS', changedAt: new Date('2024-11-28') },
        ],
      },
      payments: {
        create: {
          studentId: rahul.id,
          amount: 42000,
          status: 'CREDITED',
          transactionId: 'PFMS-2024-ST-991204',
          paymentDate: new Date('2024-11-28'),
          dbtStatus: 'CREDITED',
        },
      },
    },
  });

  // Seed Rahul's initial documents in Document Wallet
  const doc1 = await prisma.document.create({
    data: {
      studentId: rahul.id,
      applicationId: rahulExistingApp.id,
      documentType: 'ST_CERTIFICATE',
      fileName: 'Munda_ST_Certificate_Ranchi.pdf',
      fileUrl: '/uploads/demo-st-cert.pdf',
      fileSize: 204800,
      verificationStatus: 'VERIFIED',
      verificationSource: 'State e-District (Jharkhand)',
      verifications: {
        create: {
          verificationAdapter: 'EDistrictAdapter',
          externalReference: 'EDIST-JH-2024-ST-4412',
          status: 'VERIFIED',
          details: 'Official Gazette Munda Tribe validation confirmed.',
        },
      },
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      studentId: rahul.id,
      applicationId: rahulExistingApp.id,
      documentType: 'ACADEMIC_MARKSHEET',
      fileName: 'Class_XII_CBSE_Marksheet.pdf',
      fileUrl: '/uploads/demo-marksheet.pdf',
      fileSize: 184000,
      verificationStatus: 'VERIFIED',
      verificationSource: 'DigiLocker / CBSE',
      verifications: {
        create: {
          verificationAdapter: 'DigiLockerAdapter',
          externalReference: 'DL-CBSE-2023-99182',
          status: 'VERIFIED',
          details: 'Marksheet cryptographic signature verified.',
        },
      },
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      studentId: rahul.id,
      applicationId: rahulExistingApp.id,
      documentType: 'IDENTITY_AADHAAR',
      fileName: 'Aadhaar_Masked_Copy.pdf',
      fileUrl: '/uploads/demo-aadhaar.pdf',
      fileSize: 112000,
      verificationStatus: 'VERIFIED',
      verificationSource: 'UIDAI / NPCI',
      verifications: {
        create: {
          verificationAdapter: 'UIDAIAdapter',
          externalReference: 'NPCI-DBT-2024-8841',
          status: 'VERIFIED',
          details: 'Aadhaar linked to SBI Account ending in 4589.',
        },
      },
    },
  });

  // 8. Seed 14 Additional Applications for other students across different statuses
  // including Manual Review, Institute Verification, Sanctioned, etc.
  const appConfigurations = [
    { studentIdx: 1, scheme: 'PRE_MATRIC', status: 'INSTITUTE_VERIFICATION', stage: 'Institute Scrutiny', amount: 5250 },
    { studentIdx: 2, scheme: 'NFST', status: 'MANUAL_REVIEW', stage: 'Manual Document Scrutiny', amount: 336000, remarks: 'Supervisor endorsement seal signature requires verification.' },
    { studentIdx: 3, scheme: 'POST_MATRIC', status: 'STATE_VERIFICATION', stage: 'State Nodal Officer Review', amount: 38000 },
    { studentIdx: 4, scheme: 'TOP_CLASS', status: 'SANCTIONED', stage: 'Sanction Order Issued', amount: 185000 },
    { studentIdx: 5, scheme: 'TOP_CLASS', status: 'DISBURSED', stage: 'Payment Credited', amount: 210000, tx: 'PFMS-2026-ST-100293' },
    { studentIdx: 6, scheme: 'NFST', status: 'MINISTRY_VERIFICATION', stage: 'MoTA Central Directorate Review', amount: 336000 },
    { studentIdx: 7, scheme: 'NOS', status: 'MANUAL_REVIEW', stage: 'Overseas Expert Committee Interview', amount: 1540000, remarks: 'Foreign university fee currency conversion validation needed.' },
    { studentIdx: 8, scheme: 'PRE_MATRIC', status: 'DEFICIENCY', stage: 'Deficiency Correction Pending', amount: 5250, remarks: 'Please upload income certificate for current financial year 2025-26.' },
    { studentIdx: 1, scheme: 'POST_MATRIC', status: 'SUBMITTED', stage: 'Application Submitted', amount: 28000 },
    { studentIdx: 3, scheme: 'TOP_CLASS', status: 'DBT_PROCESSING', stage: 'PFMS Batch Processing', amount: 190000 },
    { studentIdx: 4, scheme: 'POST_MATRIC', status: 'INSTITUTE_VERIFICATION', stage: 'College Bonafide Review', amount: 32000 },
    { studentIdx: 5, scheme: 'POST_MATRIC', status: 'DISBURSED', stage: 'Disbursed', amount: 34000, tx: 'PFMS-2025-ST-882194' },
    { studentIdx: 6, scheme: 'POST_MATRIC', status: 'SANCTIONED', stage: 'Sanctioned', amount: 26000 },
    { studentIdx: 7, scheme: 'NOS', status: 'SUBMITTED', stage: 'Submitted', amount: 1540000 },
  ];

  let appCounter = 120;
  for (const cfg of appConfigurations) {
    appCounter++;
    const st = studentProfiles[cfg.studentIdx];
    const appId = `MOTA-2026-000${appCounter}`;
    const schId = createdScholarships[cfg.scheme];

    const app = await prisma.application.create({
      data: {
        applicationId: appId,
        studentId: st.id,
        scholarshipId: schId,
        academicYear: '2025-2026',
        status: cfg.status,
        currentStage: cfg.stage,
        submissionDate: new Date('2025-08-15'),
        sanctionDate: cfg.status === 'SANCTIONED' || cfg.status === 'DISBURSED' ? new Date('2025-10-10') : null,
        remarks: cfg.remarks || 'Standard application processing workflow.',
        statusHistory: {
          create: [
            { fromStatus: 'DRAFT', toStatus: 'SUBMITTED', remarks: 'Submitted by student', changedBy: st.name, changedAt: new Date('2025-08-15') },
            { fromStatus: 'SUBMITTED', toStatus: cfg.status, remarks: cfg.remarks || 'Advanced to stage', changedBy: 'Verification System', changedAt: new Date('2025-08-20') },
          ],
        },
      },
    });

    // Create supporting documents for each application
    await prisma.document.create({
      data: {
        studentId: st.id,
        applicationId: app.id,
        documentType: 'ST_CERTIFICATE',
        fileName: `${st.name.replace(/\s+/g, '_')}_ST_Cert.pdf`,
        fileUrl: '/uploads/demo-st-cert.pdf',
        fileSize: 198000,
        verificationStatus: 'VERIFIED',
        verificationSource: 'State e-District',
      },
    });

    await prisma.document.create({
      data: {
        studentId: st.id,
        applicationId: app.id,
        documentType: 'INCOME_CERTIFICATE',
        fileName: `${st.name.replace(/\s+/g, '_')}_Income_Cert.pdf`,
        fileUrl: '/uploads/demo-income-cert.pdf',
        fileSize: 156000,
        verificationStatus: cfg.status === 'MANUAL_REVIEW' ? 'MANUAL_REVIEW' : 'VERIFIED',
        verificationSource: 'State Revenue Dept',
        mismatchReason: cfg.status === 'MANUAL_REVIEW' ? cfg.remarks : null,
      },
    });

    // Payments if applicable
    if (cfg.status === 'DISBURSED' || cfg.status === 'SANCTIONED') {
      await prisma.payment.create({
        data: {
          applicationId: app.id,
          studentId: st.id,
          amount: cfg.amount,
          status: cfg.status === 'DISBURSED' ? 'CREDITED' : 'PENDING',
          transactionId: cfg.tx || `PFMS-2026-ST-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentDate: cfg.status === 'DISBURSED' ? new Date('2025-10-15') : null,
          dbtStatus: cfg.status === 'DISBURSED' ? 'CREDITED' : 'QUEUED',
        },
      });
    }
  }

  // 9. Seed 12+ Notifications for Students & Admin
  const notifications = [
    { userId: primaryStudentUser.id, title: 'Previous Scholarship Disbursed', message: '₹42,000 has been credited to your SBI account via DBT for the 2024-25 cycle.', type: 'SUCCESS', link: '/payments' },
    { userId: primaryStudentUser.id, title: 'Academic Year 2025-26 Applications Open', message: 'You are eligible to apply for Post-Matric and Top Class Scholarship schemes.', type: 'INFO', link: '/scholarships' },
    { userId: primaryStudentUser.id, title: 'Aadhaar Seeded Status Verified', message: 'Your bank account is successfully linked with NPCI mapper for instant DBT credit.', type: 'INFO', link: '/profile' },
    { userId: adminUser.id, title: 'New Applications Awaiting Manual Review', message: '2 applications have been flagged for manual income and university verification.', type: 'ACTION_REQUIRED', link: '/admin' },
    { userId: adminUser.id, title: 'Unreached Beneficiary Scan Complete', message: 'Matching engine detected 7 unreached ST candidates from UDISE+ and APAAR registries.', type: 'INFO', link: '/admin/outreach' },
  ];
  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  // 10. Seed Unreached ST Beneficiary Candidates
  const outreachCandidates = [
    { studentName: 'Sita Soren', studentReference: 'UDISE-JH-88210', state: 'Jharkhand', district: 'Dumka', educationLevel: 'Class IX', tribeName: 'Santhal', potentialScheme: 'Pre-Matric Scholarship', matchedDataset: 'UDISE+', outreachStatus: 'UNTOUCHED', notes: 'Enrolled in rural government school. Verified ST household with no scholarship records.' },
    { studentName: 'Birsa Birhor', studentReference: 'APAAR-PVTG-09124', state: 'Jharkhand', district: 'Hazaribagh', educationLevel: 'Class X', tribeName: 'Birhor (PVTG)', potentialScheme: 'Pre-Matric Scholarship', matchedDataset: 'APAAR', outreachStatus: 'OUTREACH_PLANNED', notes: 'Belongs to Particularly Vulnerable Tribal Group (PVTG). Direct district counselor assigned.' },
    { studentName: 'Mangal Munda', studentReference: 'OTR-OD-55419', state: 'Odisha', district: 'Mayurbhanj', educationLevel: 'Class XI Science', tribeName: 'Munda', potentialScheme: 'Post-Matric Scholarship', matchedDataset: 'OTR', outreachStatus: 'UNTOUCHED', notes: 'Completed Class X with 78% marks. Eligible for higher secondary grant.' },
    { studentName: 'Lalita Bodo', studentReference: 'UDISE-AS-33219', state: 'Assam', district: 'Kokrajhar', educationLevel: 'Class XII Arts', tribeName: 'Bodo', potentialScheme: 'Post-Matric Scholarship', matchedDataset: 'UDISE+', outreachStatus: 'CONTACTED', notes: 'District welfare officer initiated contact via village sarpanch.' },
    { studentName: 'Somu Gond', studentReference: 'APAAR-MP-10294', state: 'Madhya Pradesh', district: 'Dindori', educationLevel: 'B.Sc Agriculture (1st Year)', tribeName: 'Gond (Baiga PVTG)', potentialScheme: 'Post-Matric Scholarship', matchedDataset: 'APAAR', outreachStatus: 'UNTOUCHED', notes: 'Enrolled in regional government college. High potential beneficiary.' },
    { studentName: 'Chepa Toda', studentReference: 'OTR-TN-99201', state: 'Tamil Nadu', district: 'Nilgiris', educationLevel: 'B.Tech Mechanical', tribeName: 'Toda (PVTG)', potentialScheme: 'Top Class Scholarship', matchedDataset: 'OTR', outreachStatus: 'ENROLLED', notes: 'Assisted by district outreach cell to apply for Top Class scheme.' },
    { studentName: 'Jadhav Korwa', studentReference: 'UDISE-CG-44102', state: 'Chhattisgarh', district: 'Jashpur', educationLevel: 'Class IX', tribeName: 'Pahari Korwa (PVTG)', potentialScheme: 'Pre-Matric Scholarship', matchedDataset: 'UDISE+', outreachStatus: 'UNTOUCHED', notes: 'Remote hamlet resident. Mobile network limited.' },
  ];
  for (const c of outreachCandidates) {
    await prisma.outreachCandidate.create({ data: c });
  }

  // 11. Initial Audit Log Entry
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userRole: 'ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      entity: 'Platform',
      entityId: 'ROOT',
      newValue: JSON.stringify({ version: '1.0.0', initializedAt: new Date().toISOString() }),
    },
  });

  console.log('\n======================================================');
  console.log('✅ MoTA UNIFIED SCHOLARSHIP PLATFORM SEEDED SUCCESSFULLY');
  console.log('------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('• Student: mobile 9999999999, OTP: 123456');
  console.log('• Admin:   admin@mota-demo.local, password: Admin@123');
  console.log('Official Schemes Loaded: 5 (Pre-Matric, Post-Matric, Top Class, NFST, NOS)');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
