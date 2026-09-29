// Verification Service Abstraction with Mock Adapters for Government Repositories
// Clearly marked as PROTOTYPE VERIFICATION

export type VerificationResultStatus = 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE' | 'MANUAL_REVIEW';

export interface VerificationResult {
  status: VerificationResultStatus;
  source: string;
  reference: string;
  isPrototype: true;
  verifiedAt: string;
  discrepancyReason?: string;
  details?: Record<string, any>;
}

export interface IVerificationAdapter {
  name: string;
  code: string;
  verify(payload: any): Promise<VerificationResult>;
}

// 1. DigiLocker Adapter (Aadhaar, Marksheets)
export class DigiLockerAdapter implements IVerificationAdapter {
  name = 'DigiLocker National Depository';
  code = 'DIGILOCKER';

  async verify(payload: { documentType: string; studentName: string; identifier?: string }): Promise<VerificationResult> {
    const ref = `DL-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      status: 'VERIFIED',
      source: 'DigiLocker (National Academic Depository)',
      reference: ref,
      isPrototype: true,
      verifiedAt: new Date().toISOString(),
      details: {
        documentType: payload.documentType,
        issuer: 'Ministry of Electronics and IT / CBSE',
        holderNameMatch: payload.studentName,
        signatureValidated: true,
      },
    };
  }
}

// 2. State e-District Adapter (ST Caste Certificates & Income Certificates)
export class EDistrictAdapter implements IVerificationAdapter {
  name = 'State e-District Caste & Revenue Services';
  code = 'EDISTRICT';

  async verify(payload: { documentType: string; studentName: string; declaredIncome?: number; simulateMismatch?: boolean }): Promise<VerificationResult> {
    const ref = `EDIST-ST-${Math.floor(100000 + Math.random() * 900000)}`;

    // ST Certificate is verified smoothly
    if (payload.documentType === 'ST_CERTIFICATE') {
      return {
        status: 'VERIFIED',
        source: 'State e-District Portal',
        reference: ref,
        isPrototype: true,
        verifiedAt: new Date().toISOString(),
        details: {
          subDivision: 'Ranchi Sadar / District Collectorate',
          tribeRegistered: 'Scheduled Tribe (Official Gazette)',
          certificateStatus: 'AUTHENTIC_ACTIVE',
        },
      };
    }

    // Income Certificate: if simulateMismatch is true (or during the initial demo flow),
    // trigger a MANUAL_REVIEW for the problem statement test scenario!
    if (payload.documentType === 'INCOME_CERTIFICATE') {
      if (payload.simulateMismatch) {
        return {
          status: 'MANUAL_REVIEW',
          source: 'State Revenue & e-District Service',
          reference: ref,
          isPrototype: true,
          verifiedAt: new Date().toISOString(),
          discrepancyReason: 'Minor variation detected: Father initial sequence on revenue ledger differs from profile spelling. Requires officer verification.',
          details: {
            declaredIncome: payload.declaredIncome,
            ledgerIncomeRecorded: payload.declaredIncome,
            nameInLedger: `${payload.studentName} Kumar`,
            actionSuggested: 'Manual verification of Tehsildar seal or request applicant clarification',
          },
        };
      }

      return {
        status: 'VERIFIED',
        source: 'State Revenue & e-District Service',
        reference: ref,
        isPrototype: true,
        verifiedAt: new Date().toISOString(),
        details: {
          annualIncomeVerified: payload.declaredIncome,
          validityYear: '2025-2026',
          issuerTehsildar: 'Authorized Revenue Officer',
        },
      };
    }

    return {
      status: 'VERIFIED',
      source: 'State e-District Portal',
      reference: ref,
      isPrototype: true,
      verifiedAt: new Date().toISOString(),
    };
  }
}

// 3. AISHE Adapter (Higher Education Institution Verification)
export class AISHEAdapter implements IVerificationAdapter {
  name = 'All India Survey on Higher Education (AISHE)';
  code = 'AISHE';

  async verify(payload: { institutionName: string; aisheCode?: string }): Promise<VerificationResult> {
    return {
      status: 'VERIFIED',
      source: 'AISHE Ministry of Education Portal',
      reference: `AISHE-VAL-${Math.floor(100000 + Math.random() * 900000)}`,
      isPrototype: true,
      verifiedAt: new Date().toISOString(),
      details: {
        institutionRecognized: true,
        aisheCode: payload.aisheCode || 'C-18294',
        affiliationStatus: 'Active & Approved for Centrally Sponsored Schemes',
      },
    };
  }
}

// 4. APAAR Adapter (Automated Permanent Academic Account Registry)
export class APAARAdapter implements IVerificationAdapter {
  name = 'APAAR (One Nation One Student ID)';
  code = 'APAAR';

  async verify(payload: { studentName: string; apaarId?: string }): Promise<VerificationResult> {
    return {
      status: 'VERIFIED',
      source: 'APAAR / Academic Bank of Credits',
      reference: `APAAR-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      isPrototype: true,
      verifiedAt: new Date().toISOString(),
      details: {
        abcAccountLinked: true,
        enrolledProgrammeMatch: true,
      },
    };
  }
}

// 5. UIDAI Adapter (Aadhaar & DBT Seeding Status)
export class UIDAIAdapter implements IVerificationAdapter {
  name = 'UIDAI Aadhaar & NPCI DBT Mapper';
  code = 'UIDAI';

  async verify(payload: { aadhaarMasked?: string; studentName: string }): Promise<VerificationResult> {
    return {
      status: 'VERIFIED',
      source: 'NPCI / UIDAI Aadhaar Payment Bridge',
      reference: `NPCI-MAP-${Math.floor(100000 + Math.random() * 900000)}`,
      isPrototype: true,
      verifiedAt: new Date().toISOString(),
      details: {
        aadhaarActive: true,
        npciDbtEnabled: true,
        bankAccountSeeded: 'State Bank of India (XXXX-XXXX-4589)',
      },
    };
  }
}

// Central Verification Service
export class VerificationService {
  private digiLocker = new DigiLockerAdapter();
  private eDistrict = new EDistrictAdapter();
  private aishe = new AISHEAdapter();
  private apaar = new APAARAdapter();
  private uidai = new UIDAIAdapter();

  async verifyDocument(params: {
    documentType: string;
    studentName: string;
    declaredIncome?: number;
    forceManualReview?: boolean;
    fileName?: string;
  }): Promise<VerificationResult> {
    // If it's an Income Certificate and forceManualReview is set or default demo condition
    if (params.documentType === 'INCOME_CERTIFICATE') {
      const simulate = params.forceManualReview !== undefined ? params.forceManualReview : false;
      return this.eDistrict.verify({
        documentType: 'INCOME_CERTIFICATE',
        studentName: params.studentName,
        declaredIncome: params.declaredIncome,
        simulateMismatch: simulate,
      });
    }

    if (params.documentType === 'ST_CERTIFICATE') {
      return this.eDistrict.verify({
        documentType: 'ST_CERTIFICATE',
        studentName: params.studentName,
      });
    }

    if (params.documentType === 'IDENTITY_AADHAAR' || params.documentType === 'BANK_PASSBOOK') {
      return this.uidai.verify({
        studentName: params.studentName,
      });
    }

    if (params.documentType === 'ACADEMIC_MARKSHEET') {
      return this.digiLocker.verify({
        documentType: params.documentType,
        studentName: params.studentName,
      });
    }

    // Default prototype verification
    return {
      status: 'VERIFIED',
      source: 'National Government Services Repository',
      reference: `DEMO-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      isPrototype: true,
      verifiedAt: new Date().toISOString(),
    };
  }

  async verifyInstitution(institutionName: string, aisheCode?: string): Promise<VerificationResult> {
    return this.aishe.verify({ institutionName, aisheCode });
  }

  async verifyStudentDBT(studentName: string): Promise<VerificationResult> {
    return this.uidai.verify({ studentName });
  }
}

export const verificationService = new VerificationService();
export default verificationService;
