import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Building,
  CreditCard,
  FileCheck,
  HelpCircle,
  Clock,
  Sparkles,
  Upload,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Scholarship, Document } from '../../types';

export const NewApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = useParams<{ code?: string }>();
  const { user } = useAuth();
  const student = user?.student;

  const [step, setStep] = useState<number>(1);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string>(
    code || location.state?.selectedSchemeCode || 'POST_MATRIC'
  );

  // Form Fields (Pre-populated from Profile)
  const [academicYear, setAcademicYear] = useState<string>('2025-2026');
  const [institutionName, setInstitutionName] = useState<string>(
    student?.institution || 'National Institute of Technology, Jamshedpur'
  );
  const [courseName, setCourseName] = useState<string>(
    student?.course || 'B.Tech in Computer Science and Engineering'
  );
  const [rollNumber, setRollNumber] = useState<string>('NITJ-2024-CSE-042');
  const [admissionYear, setAdmissionYear] = useState<string>('2024');

  // Documents and Verification States
  const [simulateIncomeMismatch, setSimulateIncomeMismatch] = useState<boolean>(true);
  const [verificationRan, setVerificationRan] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdApplication, setCreatedApplication] = useState<any>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await api.get('/scholarships');
        if (res.data?.success) {
          setScholarships(res.data.scholarships || []);
        }
      } catch (err) {}
    };
    fetchSchemes();
  }, []);

  const runMockVerification = async () => {
    setIsVerifying(true);
    try {
      // Simulate real-time API call to verification adapters
      await new Promise((r) => setTimeout(r, 900));

      const results: Record<string, any> = {
        stCert: {
          status: 'VERIFIED',
          source: 'State e-District (Jharkhand)',
          reference: `EDIST-ST-${Math.floor(100000 + Math.random() * 900000)}`,
          message: 'Tribal Gazette verification authenticated.',
        },
        marksheet: {
          status: 'VERIFIED',
          source: 'DigiLocker / CBSE National Depository',
          reference: `DL-MOCK-${Math.floor(100000 + Math.random() * 900000)}`,
          message: 'Class XII cryptographic marksheet validated.',
        },
        institution: {
          status: 'VERIFIED',
          source: 'AISHE (Ministry of Education)',
          reference: 'AISHE-VAL-90214',
          message: 'National Institute of Technology, Jamshedpur bonafide verified.',
        },
        incomeCert: simulateIncomeMismatch
          ? {
              status: 'MANUAL_REVIEW',
              source: 'State Revenue & e-District Service',
              reference: `EDIST-INC-REV-${Math.floor(100000 + Math.random() * 900000)}`,
              message:
                'Revenue cross-check flag: Minor variation detected in father initial sequence on revenue ledger. Routed for manual verification.',
            }
          : {
              status: 'VERIFIED',
              source: 'State Revenue & e-District Service',
              reference: `EDIST-INC-${Math.floor(100000 + Math.random() * 900000)}`,
              message: 'Income within Rs 2.50 Lakh limit confirmed.',
            },
      };

      setVerificationResults(results);
      setVerificationRan(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      // Determine application status: if income is in manual review, application status is MANUAL_REVIEW!
      const isManual = verificationResults.incomeCert?.status === 'MANUAL_REVIEW';
      const initialStatus = isManual ? 'MANUAL_REVIEW' : 'SUBMITTED';

      const res = await api.post('/applications', {
        scholarshipCode: selectedScheme,
        academicYear,
        status: initialStatus,
        remarks: isManual
          ? 'Automated revenue cross-check noticed minor spelling variance. Routed to Manual Review desk.'
          : 'Application submitted with all automated verification clearances.',
      });

      if (res.data?.success) {
        setCreatedApplication(res.data.application);
        setStep(5); // Success step
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSchemeData = scholarships.find((s) => s.code === selectedScheme);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Step Header */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
            Step {step} of 4 — MoTA Application Engine
          </span>
          <span className="text-xs text-slate-400 font-medium">Session OTR: {student?.otrId || 'OTR-ST-2026-90412'}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          {step === 1 && 'Select Scholarship Scheme'}
          {step === 2 && 'Student Profile & Academic Details'}
          {step === 3 && 'Document Verification & Prototype Adapters'}
          {step === 4 && 'Bank / DBT Verification & Final Review'}
          {step === 5 && 'Application Submitted Successfully!'}
        </h1>
      </div>

      {/* STEP 1: SCHEME SELECTION */}
      {step === 1 && (
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-4">
          <p className="text-xs text-slate-500">
            Please choose the scholarship scheme you wish to apply for. Your profile credentials will be verified against the official criteria.
          </p>

          <div className="space-y-3">
            {scholarships.map((sch) => (
              <label
                key={sch.code}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  selectedScheme === sch.code
                    ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-700/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scheme"
                  value={sch.code}
                  checked={selectedScheme === sch.code}
                  onChange={() => setSelectedScheme(sch.code)}
                  className="mt-1 text-emerald-800 focus:ring-emerald-800"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{sch.name}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      {sch.schemeType === 'CENTRALLY_SPONSORED' ? '75:25 Shared' : '100% Central Sector'}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">{sch.shortDescription}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <span>Continue to Profile Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PROFILE & ACADEMIC DETAILS */}
      {step === 2 && (
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Profile automatically pre-populated from your One-Time Registration (OTR) record.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Student Name</label>
              <input
                disabled
                value={student?.name || 'Rahul Munda'}
                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Community Category</label>
              <input
                disabled
                value="Scheduled Tribe (ST) - Munda"
                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Annual Family Income</label>
              <input
                disabled
                value={`₹${(student?.familyIncome || 180000).toLocaleString('en-IN')}`}
                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Domicile State & District</label>
              <input
                disabled
                value={`${student?.district || 'Ranchi'}, ${student?.state || 'Jharkhand'}`}
                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Academic Enrollment Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700">Institution / College Name</label>
                <input
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700">Course of Study</label>
                <input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700">Roll / Enrollment Number</label>
                <input
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <span>Proceed to Document Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DOCUMENT REUSE & PROTOTYPE VERIFICATION (Requirement 14 & 38) */}
      {step === 3 && (
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-5">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
              Prototype Verification Layer (DigiLocker / e-District / AISHE)
            </span>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Verify your documents against mock government repositories. Click below to execute the verification pipeline.
            </p>
          </div>

          {/* Interactive Simulation Switch for SIH Demo Flow (Requirement 38) */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Demo Flow Scenario (Requirement 38):
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateIncomeMismatch}
                  onChange={(e) => setSimulateIncomeMismatch(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              {simulateIncomeMismatch
                ? 'Active: Simulates a minor spelling mismatch on the Income Certificate. This routes the application into "MANUAL_REVIEW", enabling the Admin Review & Correction request demo flow!'
                : 'Inactive: Clean pass mode. All documents will be verified automatically.'}
            </p>
          </div>

          {/* Run Verification Button */}
          <div className="text-center py-2">
            <button
              onClick={runMockVerification}
              disabled={isVerifying}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-sm inline-flex items-center gap-2 transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>{isVerifying ? 'Running Cross-Repository Scrutiny...' : 'Execute Prototype Verification Engine'}</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-1">Clearly marked as "Prototype Verification" mock adapters</p>
          </div>

          {/* Verification Results Display */}
          {verificationRan && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Verification Engine Outcomes</h4>

              {/* 1. ST Certificate */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">ST Certificate: VERIFIED ✓</span>
                    <p className="text-[11px] text-emerald-800">Source: State e-District Portal (Jharkhand)</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: {verificationResults.stCert?.reference}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">AUTHENTIC</span>
              </div>

              {/* 2. Academic Marksheet */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Class XII Marksheet: VERIFIED ✓</span>
                    <p className="text-[11px] text-emerald-800">Source: DigiLocker / CBSE Academic Depository</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: {verificationResults.marksheet?.reference}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">VERIFIED</span>
              </div>

              {/* 3. Institution Bonafide */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Institution Bonafide: VERIFIED ✓</span>
                    <p className="text-[11px] text-emerald-800">Source: All India Survey on Higher Education (AISHE)</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: {verificationResults.institution?.reference}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">ACCREDITED</span>
              </div>

              {/* 4. Income Certificate (Notice or Pass) */}
              {verificationResults.incomeCert?.status === 'MANUAL_REVIEW' ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950">Income Certificate: ⚠ MANUAL REVIEW</span>
                      <p className="text-[11px] text-amber-800">Source: State Revenue Dept / e-District</p>
                      <p className="text-[11px] text-amber-900 mt-1 leading-relaxed bg-amber-100/60 p-1.5 rounded">
                        {verificationResults.incomeCert?.message}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded shrink-0">
                    MANUAL REVIEW
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-950">Income Certificate: VERIFIED ✓</span>
                      <p className="text-[11px] text-emerald-800">Source: State Revenue Dept / e-District</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">VERIFIED</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!verificationRan}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition disabled:opacity-40"
            >
              <span>Continue to Bank & DBT Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: BANK/DBT & FINAL REVIEW */}
      {step === 4 && (
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-gov space-y-4">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Aadhaar Payment Bridge (APB) / DBT Seeding Confirmed</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Your State Bank of India account (ending in <strong>4589</strong>) is active on the National Payments Corporation of India (NPCI) mapper. Direct benefit transfers will be processed automatically upon sanction.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wide">Final Application Summary</h4>
            <div className="divide-y divide-slate-200 text-slate-600">
              <div className="py-1.5 flex justify-between">
                <span>Selected Scheme:</span>
                <span className="font-semibold text-slate-900">{currentSchemeData?.name || selectedScheme}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span>Beneficiary Student:</span>
                <span className="font-semibold text-slate-900">{student?.name} (OTR: {student?.otrId})</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span>Enrolled Institution:</span>
                <span className="font-semibold text-slate-900">{institutionName}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span>Course & Academic Year:</span>
                <span className="font-semibold text-slate-900">{courseName} ({academicYear})</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span>Verification Stage:</span>
                <span className={`font-bold ${
                  verificationResults.incomeCert?.status === 'MANUAL_REVIEW' ? 'text-amber-700' : 'text-emerald-800'
                }`}>
                  {verificationResults.incomeCert?.status === 'MANUAL_REVIEW'
                    ? 'Flagged for Officer Manual Review'
                    : 'All Automated Checks Passed'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2"
            >
              Back
            </button>
            <button
              onClick={handleSubmitApplication}
              disabled={isSubmitting}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering with Ministry...' : 'Submit Application to MoTA'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS CONFIRMATION & APPLICATION ID */}
      {step === 5 && createdApplication && (
        <div className="bg-white rounded-card p-6 sm:p-8 border border-emerald-200 shadow-gov-md text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full mx-auto flex items-center justify-center border-2 border-emerald-300">
            <CheckCircle2 className="w-8 h-8 text-emerald-700" />
          </div>

          <div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded uppercase">
              Permanent Application Created
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Application ID: {createdApplication.applicationId}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your application for <strong>{createdApplication.scholarship?.name || 'Post-Matric Scholarship'}</strong> has been safely recorded in the Ministry of Tribal Affairs relational database.
            </p>
          </div>

          {createdApplication.status === 'MANUAL_REVIEW' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 max-w-md mx-auto text-left">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Current Status: MANUAL_REVIEW
              </p>
              <p className="mt-1 text-slate-600">
                The application has been sent to the verification queue. The officer can approve or request correction. You will receive real-time notifications on any updates!
              </p>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/applications/${createdApplication.id}`}
              className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition"
            >
              Open Application Tracker
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewApplicationPage;
