import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Building,
  Award,
  Sparkles,
  Globe2,
  ArrowRight,
  CheckCircle,
  FileText,
  Calendar,
  HelpCircle,
  ShieldCheck,
  Users,
  Bot
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Scholarship, EligibilityEvaluation } from '../../types';
import { ListSkeleton } from '../../components/SkeletonLoader';

export const ScholarshipListPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q')?.toLowerCase() || '';

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [evaluations, setEvaluations] = useState<Record<string, EligibilityEvaluation>>({});
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [filterCode, setFilterCode] = useState<string>('ALL');

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/scholarships');
        if (res.data?.success) {
          setScholarships(res.data.scholarships || []);
        }
      } catch (err) {
        console.error('Failed to load scholarships:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  const runEligibilityCheck = async () => {
    try {
      setEvaluating(true);
      const res = await api.post('/scholarships/eligibility/check', {});
      if (res.data?.success && res.data.evaluations) {
        const evalMap: Record<string, EligibilityEvaluation> = {};
        for (const ev of res.data.evaluations) {
          evalMap[ev.scholarshipCode] = ev;
        }
        setEvaluations(evalMap);
        setHasEvaluated(true);
      }
    } catch (e) {
      console.error('Eligibility check error:', e);
    } finally {
      setEvaluating(false);
    }
  };

  const getSchemeDetails = (code: string) => {
    switch (code) {
      case 'PRE_MATRIC':
        return {
          icon: Building,
          bgColor: 'bg-emerald-100 text-emerald-700',
          classTag: 'Class 9 - 10',
          incomeTag: 'Family income ≤ ₹2.50L',
          amountTag: 'Up to ₹10,000/year',
        };
      case 'POST_MATRIC':
        return {
          icon: GraduationCap,
          bgColor: 'bg-blue-100 text-blue-700',
          classTag: 'Class 11+ onwards',
          incomeTag: 'Family income ≤ ₹2.50L',
          amountTag: 'Up to ₹35,000/year',
        };
      case 'TOP_CLASS':
        return {
          icon: Award,
          bgColor: 'bg-amber-100 text-amber-700',
          classTag: 'Premier 265 Institutes',
          incomeTag: 'Family income ≤ ₹6.00L',
          amountTag: 'Up to ₹1,25,000/year',
        };
      case 'NFST':
        return {
          icon: Sparkles,
          bgColor: 'bg-purple-100 text-purple-700',
          classTag: 'M.Phil / Ph.D.',
          incomeTag: 'UGC Fellowship Norms',
          amountTag: 'Up to ₹38,000/month',
        };
      case 'NOS':
        return {
          icon: Globe2,
          bgColor: 'bg-rose-100 text-rose-700',
          classTag: 'Higher studies (abroad)',
          incomeTag: 'Family income ≤ ₹6.00L',
          amountTag: 'Up to ₹28,00,000',
        };
      default:
        return {
          icon: GraduationCap,
          bgColor: 'bg-emerald-100 text-emerald-700',
          classTag: 'ST Students',
          incomeTag: 'As per scheme',
          amountTag: 'Variable grant',
        };
    }
  };

  const filterTabs = [
    { label: t('allSchemesFilter'), code: 'ALL' },
    { label: 'Pre-Matric', code: 'PRE_MATRIC' },
    { label: 'Post-Matric', code: 'POST_MATRIC' },
    { label: 'Top Class', code: 'TOP_CLASS' },
    { label: 'NFST', code: 'NFST' },
    { label: 'NOS', code: 'NOS' },
  ];

  const filtered = scholarships.filter((s) => {
    const matchesFilter = filterCode === 'ALL' || s.code === filterCode;
    const matchesQuery =
      !queryParam ||
      s.name.toLowerCase().includes(queryParam) ||
      s.shortDescription.toLowerCase().includes(queryParam);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('scholarships')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore all 5 scholarship schemes and find the right one for you.
        </p>
      </div>

      {/* Evaluation notification banner */}
      {hasEvaluated && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start justify-between gap-3 text-emerald-950 text-xs shadow-sm">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-900">
                Statutory Eligibility Evaluation Complete!
              </h4>
              <p className="text-emerald-800 mt-0.5">
                Evaluated against official MoTA statutory guidelines. Qualified schemes are highlighted below with green badges.
              </p>
            </div>
          </div>
          <button
            onClick={() => setHasEvaluated(false)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Schemes List + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {filterTabs.map((tab) => (
              <button
                key={tab.code}
                onClick={() => setFilterCode(tab.code)}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                  filterCode === tab.code
                    ? 'bg-[#0c5c3a] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={runEligibilityCheck}
              disabled={evaluating}
              className="ml-auto px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0c5c3a] border border-emerald-300 rounded-full font-bold whitespace-nowrap transition-colors text-xs flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{evaluating ? 'Checking...' : 'Check Eligibility'}</span>
            </button>
          </div>

          {/* Scheme Cards */}
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              No scholarships found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3.5">
              {filtered.map((scheme) => {
                const meta = getSchemeDetails(scheme.code);
                const Icon = meta.icon;
                const evaluation = evaluations[scheme.code];

                return (
                  <div
                    key={scheme.id}
                    className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Circular Colored Icon */}
                      <div className={`w-12 h-12 rounded-full ${meta.bgColor} flex items-center justify-center shrink-0 shadow-inner`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {scheme.name}
                          </h3>
                          {evaluation && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                evaluation.eligible
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {evaluation.eligible ? '✓ You Are Eligible' : 'Ineligible'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {scheme.shortDescription}
                        </p>

                        {/* Metadata Tags Row */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {meta.classTag}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            {meta.incomeTag}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-900">
                            {meta.amountTag}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="shrink-0 sm:self-center text-right">
                      <Link
                        to={`/scholarships/${scheme.code}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0c5c3a] hover:bg-[#073e27] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                      >
                        <span>{t('viewDetails')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column Sidebar (4 cols matching Screen 2) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Quick Links */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2 hover:text-[#0c5c3a] transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{t('eligibilityCriteria')}</span>
              </li>
              <li className="flex items-center gap-2 hover:text-[#0c5c3a] transition-colors cursor-pointer">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>{t('requiredDocuments')}</span>
              </li>
              <li className="flex items-center gap-2 hover:text-[#0c5c3a] transition-colors cursor-pointer">
                <ArrowRight className="w-4 h-4 text-emerald-700" />
                <span>{t('applicationProcess')}</span>
              </li>
              <li className="flex items-center gap-2 hover:text-[#0c5c3a] transition-colors cursor-pointer">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>{t('importantDates')}</span>
              </li>
              <li className="flex items-center gap-2 hover:text-[#0c5c3a] transition-colors cursor-pointer">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>{t('faqs')}</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Have doubts? Chat with JAGO */}
          <div className="bg-[#083523] text-white rounded-xl p-5 border border-[#0f4b33] shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0f4b33] text-emerald-300 flex items-center justify-center text-xl shrink-0">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{t('haveDoubts')}</h4>
                <p className="text-[11px] text-emerald-200/70">Chat with JAGO Assistant</p>
              </div>
            </div>
            <Link
              to="/chatbot"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#062e1e] font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <span>Start Chat →</span>
            </Link>
          </div>

          {/* Card 3: Inspirational Quote Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-200/60 shadow-sm space-y-2 relative overflow-hidden">
            <div className="text-2xl text-emerald-800 font-serif">“</div>
            <p className="text-xs font-semibold text-emerald-950 italic leading-relaxed">
              {t('quoteText')}
            </p>
            <div className="text-[10px] text-emerald-800/80 font-medium pt-1">
              — Ministry of Tribal Affairs
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ScholarshipListPage;
