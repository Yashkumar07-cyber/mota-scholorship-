import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import { Scholarship, EligibilityEvaluation } from '../../types';
import { CardSkeleton } from '../../components/SkeletonLoader';

export const ScholarshipDetailPage: React.FC = () => {
  const { code, id } = useParams<{ code?: string; id?: string }>();
  const schemeIdentifier = code || id;
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [evaluation, setEvaluation] = useState<EligibilityEvaluation | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ELIGIBILITY' | 'BENEFITS' | 'DOCUMENTS' | 'PROCESS'>('OVERVIEW');

  // If user navigated to /scholarships/all, redirect to /scholarships list
  if (schemeIdentifier && schemeIdentifier.toLowerCase() === 'all') {
    return <Navigate to="/scholarships" replace />;
  }

  useEffect(() => {
    const fetchScholarship = async () => {
      if (!schemeIdentifier) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await api.get(`/scholarships/${schemeIdentifier}`);
        if (res.data?.success) {
          setScholarship(res.data.scholarship);
        }
      } catch (err) {
        console.error('Failed to load scheme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarship();
  }, [schemeIdentifier]);

  const handleCheckEligibility = async () => {
    if (!scholarship) return;
    try {
      setEvaluating(true);
      const res = await api.post('/scholarships/eligibility/check', {
        scholarshipCode: scholarship.code,
      });
      if (res.data?.success) {
        setEvaluation(res.data.evaluation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CardSkeleton />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <p className="font-bold text-slate-800">Scholarship scheme not found.</p>
        <Link to="/scholarships" className="text-emerald-700 underline text-xs mt-2 block">
          Return to All Schemes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back Button */}
      <Link
        to="/scholarships"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All MoTA Schemes</span>
      </Link>

      {/* Scheme Header Card */}
      <div className="bg-white rounded-card p-6 border border-slate-200 shadow-gov space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
            {scholarship.schemeType === 'CENTRALLY_SPONSORED' ? 'Centrally Sponsored Scheme' : 'Central Sector Scheme'}
          </span>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
            Code: {scholarship.code}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {scholarship.name}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {scholarship.shortDescription}
        </p>

        {/* Action Buttons: Check Eligibility & Start Application */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCheckEligibility}
            disabled={evaluating}
            className="flex-1 bg-white border border-emerald-700 hover:bg-emerald-50 text-emerald-800 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{evaluating ? 'Evaluating My Criteria...' : 'Check My Eligibility'}</span>
          </button>

          <button
            onClick={() => navigate('/applications/new', { state: { selectedSchemeCode: scholarship.code } })}
            className="flex-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Start Online Application</span>
          </button>
        </div>

        {/* Live Eligibility Evaluation Result Box if clicked */}
        {evaluation && (
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
              evaluation.eligible
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2">
              {evaluation.eligible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <h4 className="font-bold text-sm">
                {evaluation.eligible
                  ? 'Eligible! You satisfy all schematic norms for this scheme.'
                  : 'Notice on Schematic Requirements:'}
              </h4>
            </div>

            {evaluation.reasons?.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                {evaluation.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}

            {evaluation.missing_requirements?.length > 0 && (
              <div className="text-amber-800 space-y-1">
                <p className="font-semibold">Unfulfilled Requirements:</p>
                <ul className="list-disc list-inside pl-1">
                  {evaluation.missing_requirements.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-bold text-slate-500">
        {[
          { key: 'OVERVIEW', label: 'Scheme Overview' },
          { key: 'ELIGIBILITY', label: 'Eligibility Criteria' },
          { key: 'BENEFITS', label: 'Financial Benefits' },
          { key: 'DOCUMENTS', label: 'Required Documents' },
          { key: 'PROCESS', label: 'Application Steps' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 px-4 shrink-0 border-b-2 transition ${
              activeTab === tab.key
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-card p-6 border border-slate-200 shadow-gov text-xs leading-relaxed space-y-4">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-3 text-slate-700">
            <h3 className="text-sm font-bold text-slate-900">Detailed Description & Schematic Background</h3>
            <p className="whitespace-pre-line leading-relaxed">{scholarship.detailedDescription}</p>
          </div>
        )}

        {activeTab === 'ELIGIBILITY' && (
          <div className="space-y-3 text-slate-700">
            <h3 className="text-sm font-bold text-slate-900">Statutory Eligibility Guidelines</h3>
            <p className="whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px]">
              {scholarship.eligibility}
            </p>
          </div>
        )}

        {activeTab === 'BENEFITS' && (
          <div className="space-y-3 text-slate-700">
            <h3 className="text-sm font-bold text-slate-900">Financial Assistance & Schematic Norms</h3>
            <p className="whitespace-pre-line leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              {scholarship.benefits}
            </p>
          </div>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-3 text-slate-700">
            <h3 className="text-sm font-bold text-slate-900">Mandatory Documents to be Uploaded</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {scholarship.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">{doc.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'PROCESS' && (
          <div className="space-y-3 text-slate-700">
            <h3 className="text-sm font-bold text-slate-900">Workflow & Verification Stages</h3>
            <p className="whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {scholarship.applicationProcess}
            </p>
          </div>
        )}
      </div>

      {/* Mandatory Official Source Transparency Card (Requirement 29) */}
      <div className="bg-slate-50 border border-slate-200 rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <p className="font-bold text-slate-900">
              Information Source: Ministry of Tribal Affairs (MoTA)
            </p>
            <p className="text-[11px] text-slate-500">
              Official Portal:{' '}
              <a
                href={scholarship.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>{scholarship.sourceUrl}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </div>

        <div className="text-[11px] sm:text-right shrink-0">
          <span className="font-semibold text-slate-700">Last Verified Date: </span>
          <span className="text-slate-500">{new Date(scholarship.lastVerifiedAt).toLocaleDateString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailPage;
