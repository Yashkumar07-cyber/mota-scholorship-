// Frontend TypeScript Data Types matching MoTA Backend

export type UserRole = 'STUDENT' | 'ADMIN' | 'VERIFICATION_OFFICER';

export interface User {
  id: string;
  email?: string | null;
  mobile: string;
  role: UserRole;
  student?: StudentProfile;
  admin?: AdminUser;
}

export interface AdminUser {
  id: string;
  department: string;
  designation: string;
  employeeId: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  mobile: string;
  email: string;
  state: string;
  district: string;
  tribeCategory: string;
  tribeName?: string | null;
  pvtgStatus: boolean;
  otrId: string;
  institution: string;
  institutionId?: string | null;
  course: string;
  academicYear: string;
  familyIncome: number;
  bankStatus: string;
  bankName?: string | null;
  accountNumberMasked?: string | null;
  ifscCode?: string | null;
  dbtStatus: string;
  profileCompletionPct: number;
  familyMembers?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  studentId: string;
  name: string;
  relation: string;
  age: number;
  educationLevel: string;
  currentScholarship?: string | null;
  scholarshipStatus?: string | null;
}

export interface Scholarship {
  id: string;
  name: string;
  code: 'PRE_MATRIC' | 'POST_MATRIC' | 'TOP_CLASS' | 'NFST' | 'NOS' | string;
  schemeType: 'CENTRALLY_SPONSORED' | 'CENTRAL_SECTOR';
  shortDescription: string;
  detailedDescription: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  requiredDocuments: Array<{ name: string; description: string }>;
  importantDates: Record<string, string>;
  sourceUrl: string;
  lastVerifiedAt: string;
  active: boolean;
  sourceAttribution?: {
    sourceName: string;
    portalUrl: string;
    lastVerifiedAt: string;
  };
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'INSTITUTE_VERIFICATION'
  | 'STATE_VERIFICATION'
  | 'MINISTRY_VERIFICATION'
  | 'MANUAL_REVIEW'
  | 'SANCTIONED'
  | 'DBT_PROCESSING'
  | 'DISBURSED'
  | 'DEFICIENCY'
  | 'REJECTED';

export interface Application {
  id: string;
  applicationId: string;
  studentId: string;
  scholarshipId: string;
  academicYear: string;
  status: ApplicationStatus;
  currentStage: string;
  submissionDate?: string | null;
  sanctionDate?: string | null;
  remarks?: string | null;
  scholarship: Scholarship;
  student?: StudentProfile;
  statusHistory?: ApplicationStatusHistory[];
  documents?: Document[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  fromStatus: string;
  toStatus: string;
  remarks?: string | null;
  changedBy: string;
  changedAt: string;
}

export interface Document {
  id: string;
  studentId: string;
  applicationId?: string | null;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE' | 'MANUAL_REVIEW';
  verificationSource?: string | null;
  mismatchReason?: string | null;
  verifications?: Array<{
    id: string;
    verificationAdapter: string;
    externalReference: string;
    status: string;
    details?: string;
    verifiedAt: string;
  }>;
  application?: {
    applicationId: string;
    status: string;
  };
}

export interface Payment {
  id: string;
  applicationId: string;
  studentId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'CREDITED' | 'FAILED';
  transactionId?: string | null;
  paymentDate?: string | null;
  dbtStatus: string;
  createdAt: string;
  application?: {
    scholarship: { name: string; code: string };
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION_REQUIRED';
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export interface OutreachCandidate {
  id: string;
  studentName: string;
  studentReference: string;
  state: string;
  district: string;
  educationLevel: string;
  tribeName: string;
  potentialScheme: string;
  matchedDataset: string;
  outreachStatus: 'UNTOUCHED' | 'OUTREACH_PLANNED' | 'CONTACTED' | 'ENROLLED' | 'DISMISSED';
  notes?: string | null;
  createdAt: string;
}

export interface EligibilityEvaluation {
  eligible: boolean;
  scholarshipCode: string;
  scholarshipName: string;
  reasons: string[];
  missing_requirements: string[];
  required_documents: string[];
  officialSourceUrl: string;
  benefitsSummary: string;
}
