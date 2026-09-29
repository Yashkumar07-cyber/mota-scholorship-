import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Bot,
  Bell,
  GraduationCap,
  Building,
  Award,
  Globe2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Application } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const [totalReceived, setTotalReceived] = useState<number>(115000);
  const [activeAppsCount, setActiveAppsCount] = useState<number>(1);
  const [pendingActionsCount, setPendingActionsCount] = useState<number>(0);
  const [docCount, setDocCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const student = user?.student;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [appsRes, payRes, docRes] = await Promise.allSettled([
          api.get('/applications'),
          api.get('/payments'),
          api.get('/documents'),
        ]);

        if (appsRes.status === 'fulfilled' && appsRes.value.data?.applications) {
          const apps: Application[] = appsRes.value.data.applications;
          if (apps.length > 0) {
            setActiveApplication(apps[0]);
            setActiveAppsCount(apps.filter(a => a.status !== 'REJECTED' && a.status !== 'DISBURSED').length || 1);
            const pending = apps.filter(a => a.status === 'DEFICIENCY' || a.status === 'MANUAL_REVIEW').length;
            setPendingActionsCount(pending);
          }
        }

        if (payRes.status === 'fulfilled' && payRes.value.data?.summary?.totalReceived) {
          setTotalReceived(payRes.value.data.summary.totalReceived);
        }

        if (docRes.status === 'fulfilled' && docRes.value.data?.documents) {
          setDocCount(docRes.value.data.documents.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const featuredSchemes = [
    {
      code: 'PRE_MATRIC',
      name: 'Pre-Matric Scholarship',
      level: 'Class 9 - 10',
      icon: Building,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      code: 'POST_MATRIC',
      name: 'Post-Matric Scholarship',
      level: 'Class 11 onwards',
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      code: 'TOP_CLASS',
      name: 'Top Class Scholarship',
      level: 'For meritorious ST students',
      icon: Award,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      code: 'NFST',
      name: 'NFST',
      level: 'Higher education & research',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      code: 'NOS',
      name: 'National Overseas Scholarship',
      level: 'For higher studies abroad',
      icon: Globe2,
      color: 'bg-cyan-50 text-cyan-700',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. HERO GREETING BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#062e1e] via-[#093d28] to-[#0c5c3a] text-white p-6 sm:p-8 shadow-md">
        {/* Subtle background art overlay */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <svg width="400" height="200" viewBox="0 0 200 100" fill="none" stroke="currentColor">
            <path d="M0 50 Q50 0 100 50 T200 50" strokeWidth="2" />
            <circle cx="50" cy="50" r="30" strokeWidth="2" />
            <circle cx="150" cy="50" r="30" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              {t('welcomeGreeting')}, {student?.name || 'Rahul Munda'} 👋
            </h1>
            <p className="text-sm font-semibold text-emerald-200 mt-1">
              {t('welcomeBannerTitle')}
            </p>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 leading-relaxed">
              {t('welcomeBannerSub')}
            </p>
          </div>

          {/* Profile Completion Card on the Right */}
          <div className="bg-black/20 backdrop-blur-md border border-white/15 rounded-xl p-4 sm:p-5 shrink-0 flex flex-col justify-between min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-emerald-200 mb-2">
              <span className="font-medium">{t('profileCompletion')}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-white">80%</span>
              <span className="text-[11px] text-emerald-300">OTR Verified</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-3">
              <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: '80%' }} />
            </div>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-[#062e1e] hover:bg-emerald-50 text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <span>{t('completeProfile')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. FOUR TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Amount Received */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              ₹{totalReceived.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{t('amountReceived')}</div>
            <div className="text-[11px] text-slate-400 mt-1">{t('dbtLabel')}</div>
          </div>
        </div>

        {/* Card 2: Applications Active */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{activeAppsCount}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{t('applicationsActive')}</div>
            <div className="text-[11px] text-slate-400 mt-1">{t('currentCycle')}</div>
          </div>
        </div>

        {/* Card 3: Action Required */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{pendingActionsCount}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{t('actionRequired')}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {pendingActionsCount === 0 ? t('allReqSatisfied') : 'Deficiency re-upload required'}
            </div>
          </div>
        </div>

        {/* Card 4: Documents Uploaded */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{docCount}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{t('documentsUploaded')}</div>
            <div className="text-[11px] text-slate-400 mt-1">{t('digilockerVerified')}</div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED SCHOLARSHIP SCHEMES (Horizontal 5 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('featuredSchemes')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('exploreAllSchemes')}</p>
          </div>
          <Link
            to="/scholarships"
            className="text-xs font-semibold text-[#0c5c3a] hover:underline flex items-center gap-1"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {featuredSchemes.map((scheme) => {
            const Icon = scheme.icon;
            return (
              <div
                key={scheme.code}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className={`w-9 h-9 rounded-lg ${scheme.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#0c5c3a] transition-colors line-clamp-1">
                    {scheme.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {scheme.level}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    to={`/apply/${scheme.code}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0c5c3a] group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{t('applyNow')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM SECTION: JAGO PROMPT & LATEST UPDATES TICKER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Chat with JAGO Card */}
        <div className="bg-[#083523] text-white p-5 rounded-xl border border-[#0f4b33] flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0f4b33] text-emerald-300 flex items-center justify-center text-2xl shrink-0">
              🤖
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                {t('needHelp')}
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {t('chatWithJagoSub')}
              </h3>
            </div>
          </div>
          <Link
            to="/chatbot"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#062e1e] font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            {t('chatNow')} →
          </Link>
        </div>

        {/* Right: Latest Updates Ticker */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{t('latestUpdates')}</div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {t('updatesText')}
              </p>
            </div>
          </div>
          <Link
            to="/scholarships"
            className="text-xs font-bold text-[#0c5c3a] hover:underline whitespace-nowrap"
          >
            {t('viewAll')} →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
