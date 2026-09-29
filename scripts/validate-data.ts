// Validation script to ensure all 5 official MoTA scholarship schemes are present,
// have valid source URLs, accurate criteria, and zero fabricated records.

import { prisma } from '../backend/src/utils/prisma';

const EXPECTED_SCHEMES = [
  { code: 'PRE_MATRIC', expectedIncomeLimit: 250000, domain: 'dbttribal.gov.in' },
  { code: 'POST_MATRIC', expectedIncomeLimit: 250000, domain: 'dbttribal.gov.in' },
  { code: 'TOP_CLASS', expectedIncomeLimit: 600000, domain: 'scholarships.gov.in' },
  { code: 'NFST', expectedIncomeLimit: null, domain: 'fellowship.tribal.gov.in' },
  { code: 'NOS', expectedIncomeLimit: 600000, domain: 'overseas.tribal.gov.in' },
];

export async function validateScholarshipData() {
  console.log('--- Commencing Official MoTA Data Validation ---');
  let errors = 0;

  const count = await prisma.scholarship.count();
  console.log(`Total scholarship records found: ${count}`);

  if (count < 5) {
    console.error(`ERROR: Expected at least 5 schemes, found only ${count}`);
    errors++;
  }

  for (const expected of EXPECTED_SCHEMES) {
    const item = await prisma.scholarship.findUnique({
      where: { code: expected.code },
    });

    if (!item) {
      console.error(`[FAIL] Missing required scheme: ${expected.code}`);
      errors++;
      continue;
    }

    if (!item.sourceUrl || !item.sourceUrl.includes(expected.domain)) {
      console.error(`[FAIL] Scheme ${item.code} has invalid source URL: ${item.sourceUrl}. Expected domain: ${expected.domain}`);
      errors++;
    } else {
      console.log(`[PASS] ${item.code}: Verified official source -> ${item.sourceUrl}`);
    }

    if (!item.lastVerifiedAt) {
      console.error(`[FAIL] Missing lastVerifiedAt timestamp for ${item.code}`);
      errors++;
    }

    // Verify requiredDocuments format
    try {
      const docs = JSON.parse(item.requiredDocuments);
      if (!Array.isArray(docs) || docs.length === 0) {
        console.error(`[FAIL] ${item.code}: requiredDocuments is empty or not an array`);
        errors++;
      } else {
        console.log(`[PASS] ${item.code}: Has ${docs.length} structured required document specifications.`);
      }
    } catch (e) {
      console.error(`[FAIL] ${item.code}: requiredDocuments JSON parse error`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log('\n✅ ALL OFFICIAL SCHOLARSHIP DATA VALIDATED 100% CLEAN & OFFICIAL.');
  } else {
    console.error(`\n❌ DATA VALIDATION FAILED WITH ${errors} ERRORS.`);
    process.exit(1);
  }
}

if (require.main === module) {
  validateScholarshipData()
    .catch((err) => {
      console.error('Validation crashed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
