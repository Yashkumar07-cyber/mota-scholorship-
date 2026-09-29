// MoTA Eligibility Evaluation Engine
// Evaluates student profile against official MoTA scheme rules

export interface StudentEligibilityInput {
  name?: string;
  tribeCategory: string; // Must be ST
  pvtgStatus?: boolean;
  familyIncome: number;
  course: string;
  academicYear?: string;
  institution?: string;
  isPremierInstitute?: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  scholarshipId: string;
  scholarshipCode: string;
  scholarshipName: string;
  reasons: string[];
  missing_requirements: string[];
  required_documents: string[];
  officialSourceUrl: string;
  benefitsSummary: string;
}

export class EligibilityEngine {
  evaluate(scholarshipCode: string, student: StudentEligibilityInput): EligibilityResult {
    const reasons: string[] = [];
    const missing: string[] = [];
    let requiredDocs: string[] = [];
    let benefitsSummary = '';
    let officialUrl = 'https://tribal.nic.in/ScholarshiP.aspx';
    let name = '';

    // 1. Mandatory tribal status check for all MoTA schemes
    const isST = student.tribeCategory?.toUpperCase() === 'ST';
    if (!isST) {
      missing.push('Candidate must belong to a notified Scheduled Tribe (ST) community.');
    } else {
      reasons.push('Verified Scheduled Tribe (ST) category eligibility.');
    }

    const income = Number(student.familyIncome);
    const courseLower = (student.course || '').toLowerCase();

    switch (scholarshipCode.toUpperCase()) {
      case 'PRE_MATRIC': {
        name = 'Pre-Matric Scholarship Scheme for ST Students';
        officialUrl = 'https://dbttribal.gov.in/';
        benefitsSummary = 'Day scholars: ₹225/mo, Hostellers: ₹525/mo for 10 months + book grant.';
        requiredDocs = [
          'ST Certificate (issued by competent revenue authority)',
          'Income Certificate (annual parental income <= ₹2.50 Lakh)',
          'Previous Class Marksheet',
          'School Bonafide / Enrollment Verification',
          'Aadhaar / Bank Account Seeded with NPCI',
        ];

        // Income condition
        if (income > 250000) {
          missing.push(`Family income (₹${income.toLocaleString('en-IN')}) exceeds the ₹2.50 Lakh/year ceiling.`);
        } else {
          reasons.push(`Annual family income (₹${income.toLocaleString('en-IN')}) is within the ₹2.50 Lakh limit.`);
        }

        // Academic level condition (Class IX or X)
        const isPreMatricClass =
          courseLower.includes('9') ||
          courseLower.includes('10') ||
          courseLower.includes('ix') ||
          courseLower.includes('x') ||
          courseLower.includes('secondary');

        if (!isPreMatricClass) {
          missing.push('Scheme strictly applies to students studying in Class IX or Class X.');
        } else {
          reasons.push(`Enrolled in eligible secondary education level (${student.course}).`);
        }
        break;
      }

      case 'POST_MATRIC': {
        name = 'Post-Matric Scholarship Scheme for ST Students';
        officialUrl = 'https://dbttribal.gov.in/';
        benefitsSummary = 'Compulsory institutional non-refundable fees + Monthly maintenance allowance (₹230 to ₹1,200).';
        requiredDocs = [
          'ST Certificate (e-District validated)',
          'Income Certificate (<= ₹2.50 Lakh/year)',
          'Class X / Previous Qualifying Exam Marksheet',
          'Current College/University Fee Receipt & Bonafide Certificate',
          'Aadhaar-seeded Bank Passbook',
        ];

        // Income condition
        if (income > 250000) {
          missing.push(`Family income (₹${income.toLocaleString('en-IN')}) exceeds the ₹2.50 Lakh/year ceiling.`);
        } else {
          reasons.push(`Annual family income (₹${income.toLocaleString('en-IN')}) is within the ₹2.50 Lakh limit.`);
        }

        // Course check (must be post-matriculation: Class 11+, Diploma, Degree, PG, Professional)
        const isPreMatricOnly =
          courseLower.trim() === 'class 9' ||
          courseLower.trim() === 'class ix' ||
          courseLower.trim() === 'class 8';

        if (isPreMatricOnly) {
          missing.push('Applicant is currently enrolled in Pre-Matric level. Minimum qualification is Class X.');
        } else {
          reasons.push(`Pursuing eligible recognized post-matriculation course (${student.course || 'Degree/Diploma'}).`);
        }
        break;
      }

      case 'TOP_CLASS': {
        name = 'National Scholarship Scheme (Top Class Education) For Higher Education of ST Students';
        officialUrl = 'https://scholarships.gov.in';
        benefitsSummary = 'Full tuition & non-refundable fees, living allowance ₹3,000/mo, books ₹5,000/yr, one-time computer grant ₹45,000.';
        requiredDocs = [
          'ST Certificate',
          'Income Certificate (<= ₹6.00 Lakh/year)',
          'Admission Offer / Bonafide from 265 Identified Premier Institutes (IIT, IIM, AIIMS, NIT, NLU)',
          'Class XII / Entrance Scorecard (JEE, NEET, CAT, CLAT)',
          'Fee Demand Letter of Premier Institute',
          'Aadhaar Card',
        ];

        if (income > 600000) {
          missing.push(`Family income (₹${income.toLocaleString('en-IN')}) exceeds the Top Class limit of ₹6.00 Lakh/year.`);
        } else {
          reasons.push(`Annual family income (₹${income.toLocaleString('en-IN')}) is within the ₹6.00 Lakh limit.`);
        }

        // Must be in premier institute
        const isPremier =
          student.isPremierInstitute ||
          courseLower.includes('b.tech') ||
          courseLower.includes('mbbs') ||
          courseLower.includes('iit') ||
          courseLower.includes('nit') ||
          courseLower.includes('aiims') ||
          courseLower.includes('iim') ||
          courseLower.includes('mba') ||
          (student.institution && student.institution.toLowerCase().includes('institute of technology'));

        if (!isPremier && !student.isPremierInstitute) {
          missing.push('Scheme requires admission into one of the 265 Premier Institutes notified by MoTA.');
        } else {
          reasons.push('Enrolled in approved premier institution for higher professional education.');
        }
        break;
      }

      case 'NFST': {
        name = 'National Fellowship Scheme for Higher Education of ST Students (NFST)';
        officialUrl = 'https://fellowship.tribal.gov.in/';
        benefitsSummary = 'Fellowship ₹25,000 to ₹35,000/mo + Contingency (₹10,000 - ₹25,000/yr) + HRA & Divyangjan Reader Allowance.';
        requiredDocs = [
          'ST Certificate',
          'Post-Graduate / Master’s Degree Marksheet (Min 55% marks)',
          'M.Phil / Ph.D Registration / Admission Letter from UGC Recognized University',
          'UGC-NET / CSIR-NET / JRF Scorecard or Merit Qualification',
          'Research Synopsis & Research Supervisor Certificate',
          student.pvtgStatus ? 'PVTG Validation Certificate (Priority Consideration)' : 'Identity Proof',
        ];

        const isResearch =
          courseLower.includes('phd') ||
          courseLower.includes('ph.d') ||
          courseLower.includes('mphil') ||
          courseLower.includes('m.phil') ||
          courseLower.includes('doctorate') ||
          courseLower.includes('research');

        if (!isResearch) {
          missing.push('NFST is strictly restricted to ST scholars enrolled in regular M.Phil or Ph.D programs.');
        } else {
          reasons.push('Candidate satisfies academic criteria for advanced research (M.Phil / Ph.D).');
        }

        if (student.pvtgStatus) {
          reasons.push('Special statutory preference allocated under Particularly Vulnerable Tribal Group (PVTG) quota.');
        }
        break;
      }

      case 'NOS': {
        name = 'National Overseas Scholarship (NOS) Scheme for ST Students';
        officialUrl = 'https://overseas.tribal.gov.in/';
        benefitsSummary = 'Complete tuition fee + USD 15,400 (or GBP 9,900) annual maintenance allowance + economy airfare + visa + medical insurance.';
        requiredDocs = [
          'ST Certificate / PVTG Certificate',
          'Income Certificate (<= ₹6.00 Lakh/year)',
          'Unconditional Offer Letter from Accredited Top International University',
          'Passport Copy',
          'GRE / GMAT / IELTS / TOEFL Scorecard',
          'Master’s or Bachelor’s Transcripts (Minimum 55% aggregate)',
        ];

        if (income > 600000) {
          missing.push(`Family income (₹${income.toLocaleString('en-IN')}) exceeds the ₹6.00 Lakh/year ceiling.`);
        } else {
          reasons.push(`Annual family income (₹${income.toLocaleString('en-IN')}) is within the ₹6.00 Lakh limit.`);
        }

        const isOverseasApplicable =
          courseLower.includes('abroad') ||
          courseLower.includes('master') ||
          courseLower.includes('phd') ||
          courseLower.includes('post-doctoral') ||
          courseLower.includes('postgraduate');

        if (!isOverseasApplicable) {
          missing.push('NOS requires enrollment or unconditional admission offer in Master’s or Ph.D abroad.');
        } else {
          reasons.push('Academic level satisfies overseas higher education requisites.');
        }

        if (student.pvtgStatus) {
          reasons.push('Reserved consideration under the 3 dedicated PVTG annual awards.');
        }
        break;
      }

      default:
        missing.push('Unknown or unspecified scholarship scheme code.');
    }

    const eligible = isST && missing.length === 0;

    return {
      eligible,
      scholarshipId: scholarshipCode,
      scholarshipCode,
      scholarshipName: name,
      reasons,
      missing_requirements: missing,
      required_documents: requiredDocs,
      officialSourceUrl: officialUrl,
      benefitsSummary,
    };
  }

  evaluateAll(student: StudentEligibilityInput): EligibilityResult[] {
    const codes = ['PRE_MATRIC', 'POST_MATRIC', 'TOP_CLASS', 'NFST', 'NOS'];
    return codes.map((code) => this.evaluate(code, student));
  }
}

export const eligibilityEngine = new EligibilityEngine();
export default eligibilityEngine;
