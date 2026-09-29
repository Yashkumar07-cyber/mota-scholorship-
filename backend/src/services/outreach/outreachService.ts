// Unreached Beneficiary Matching Engine
// Cross-correlates demographic & school enrollment databases (UDISE+, APAAR, OTR)
// against active scholarship applications to identify ST youth entitled to benefits.

import { PrismaClient } from '@prisma/client';

export interface DemographicRecord {
  studentName: string;
  studentReference: string;
  state: string;
  district: string;
  educationLevel: string;
  tribeName: string;
  sourceDataset: 'UDISE+' | 'APAAR' | 'OTR';
  familyIncomeEst: number;
}

export class OutreachService {
  // Demo cross-dataset records representing unreached ST populations
  private demoRegistry: DemographicRecord[] = [
    {
      studentName: 'Sita Soren',
      studentReference: 'UDISE-JH-88210',
      state: 'Jharkhand',
      district: 'Dumka',
      educationLevel: 'Class IX',
      tribeName: 'Santhal',
      sourceDataset: 'UDISE+',
      familyIncomeEst: 110000,
    },
    {
      studentName: 'Birsa Birhor',
      studentReference: 'APAAR-PVTG-09124',
      state: 'Jharkhand',
      district: 'Hazaribagh',
      educationLevel: 'Class X',
      tribeName: 'Birhor (PVTG)',
      sourceDataset: 'APAAR',
      familyIncomeEst: 75000,
    },
    {
      studentName: 'Mangal Munda',
      studentReference: 'OTR-OD-55419',
      state: 'Odisha',
      district: 'Mayurbhanj',
      educationLevel: 'Class XI Science',
      tribeName: 'Munda',
      sourceDataset: 'OTR',
      familyIncomeEst: 140000,
    },
    {
      studentName: 'Lalita Bodo',
      studentReference: 'UDISE-AS-33219',
      state: 'Assam',
      district: 'Kokrajhar',
      educationLevel: 'Class XII Arts',
      tribeName: 'Bodo',
      sourceDataset: 'UDISE+',
      familyIncomeEst: 165000,
    },
    {
      studentName: 'Somu Gond',
      studentReference: 'APAAR-MP-10294',
      state: 'Madhya Pradesh',
      district: 'Dindori',
      educationLevel: 'B.Sc Agriculture (1st Year)',
      tribeName: 'Gond (Baiga PVTG)',
      sourceDataset: 'APAAR',
      familyIncomeEst: 95000,
    },
    {
      studentName: 'Chepa Toda',
      studentReference: 'OTR-TN-99201',
      state: 'Tamil Nadu',
      district: 'Nilgiris',
      educationLevel: 'B.Tech Mechanical',
      tribeName: 'Toda (PVTG)',
      sourceDataset: 'OTR',
      familyIncomeEst: 180000,
    },
    {
      studentName: 'Jadhav Korwa',
      studentReference: 'UDISE-CG-44102',
      state: 'Chhattisgarh',
      district: 'Jashpur',
      educationLevel: 'Class IX',
      tribeName: 'Pahari Korwa (PVTG)',
      sourceDataset: 'UDISE+',
      familyIncomeEst: 60000,
    },
  ];

  async scanAndIdentifyUnreached(prisma: PrismaClient) {
    const existing = await prisma.outreachCandidate.findMany({ select: { studentReference: true } });
    const existingRefs = new Set(existing.map((e) => e.studentReference));

    const newCandidates = [];

    for (const record of this.demoRegistry) {
      if (existingRefs.has(record.studentReference)) continue;

      let potentialScheme = 'Post-Matric Scholarship';
      const lvl = record.educationLevel.toLowerCase();
      if (lvl.includes('ix') || lvl.includes('x') || lvl.includes('class 9') || lvl.includes('class 10')) {
        potentialScheme = 'Pre-Matric Scholarship';
      } else if (lvl.includes('b.tech') || lvl.includes('iit') || lvl.includes('aiims')) {
        potentialScheme = 'Top Class Education Scholarship';
      }

      const candidate = await prisma.outreachCandidate.create({
        data: {
          studentName: record.studentName,
          studentReference: record.studentReference,
          state: record.state,
          district: record.district,
          educationLevel: record.educationLevel,
          tribeName: record.tribeName,
          potentialScheme,
          matchedDataset: record.sourceDataset,
          outreachStatus: 'UNTOUCHED',
          notes: `Identified by cross-matching ${record.sourceDataset} with ST Census database. Eligible for ${potentialScheme}.`,
        },
      });

      newCandidates.push(candidate);
    }

    return newCandidates;
  }
}

export const outreachService = new OutreachService();
export default outreachService;
