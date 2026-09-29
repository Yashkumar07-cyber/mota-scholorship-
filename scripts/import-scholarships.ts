// Official Data Ingestion Architecture
// Imports verified, official MoTA scholarship schemes directly into database

import { prisma } from '../backend/src/utils/prisma';
import { officialScholarshipData } from '../backend/src/services/scholarship/scholarshipData';

export async function importScholarships() {
  console.log('--- Starting Official MoTA Scholarship Ingestion ---');
  for (const item of officialScholarshipData) {
    const record = await prisma.scholarship.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        schemeType: item.schemeType,
        shortDescription: item.shortDescription,
        detailedDescription: item.detailedDescription,
        eligibility: item.eligibility,
        benefits: item.benefits,
        applicationProcess: item.applicationProcess,
        requiredDocuments: item.requiredDocuments,
        importantDates: item.importantDates,
        sourceUrl: item.sourceUrl,
        lastVerifiedAt: item.lastVerifiedAt,
        active: item.active,
      },
      create: item,
    });
    console.log(`[Ingested] ${record.code} -> ${record.name} (${record.sourceUrl})`);
  }
  console.log('--- Official Data Ingestion Completed Successfully ---');
}

if (require.main === module) {
  importScholarships()
    .catch((err) => {
      console.error('Ingestion failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
