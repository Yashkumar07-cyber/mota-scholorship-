import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  CreditCard,
  PlusCircle,
  GraduationCap,
  Award,
  Building,
  Sparkles,
  Globe2,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Application } from '../../types';
import { ListSkeleton } from '../../components/SkeletonLoader';

export const ApplicationListPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/applications');
        if (res.data?.success) {
          setApplications(res.data.applications || []);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getSchemeIcon = (code: string) => {
    switch (code) {
      case 'PRE_MATRIC':
        return { icon: Building, color: 'bg-emerald-100 text-emerald-700' };
      case 'POST_MATRIC':
        return { icon: GraduationCap, color: 'bg-blue-100 text-blue-700' };
      case 'TOP_CLASS':
        return { icon: Award, color: 'bg-amber-100 text-amber-700' };
      case 'NFST':
        return { icon: Sparkles, color: 'bg-purple-100 text-purple-700' };
      case 'NOS':
        return { icon: Globe2, color: 'bg-rose-100 text-rose-700' };
      default:
        return { icon: FileText, color: 'bg-slate-100 text-slate-700' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SANCTIONED':
      case 'DISBURSED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Approved
          </span>
        );
      case 'MANUAL_REVIEW':
      case 'INSTITUTE_VERIFICATION':
      case 'STATE_VERIFICATION':
      case 'MINISTRY_VERIFICATION':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Under Review
          </span>
        );
      case 'SUBMITTED':
      case 'DRAFT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Compute Counts
  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'SUBMITTED' || a.status === 'DRAFT').length,
    underReview: applications.filter(a => ['MANUAL_REVIEW', 'INSTITUTE_VERIFICATION', 'STATE_VERIFICATION', 'MINISTRY_VERIFICATION'].includes(a.status)).length,
    approved: applications.filter(a => a.status === 'SANCTIONED' || a.status === 'DISBURSED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  const filtered = applications.filter((app) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'PENDING') return app.status === 'SUBMITTED' || app.status === 'DRAFT';
    if (filterTab === 'UNDER_REVIEW') return ['MANUAL_REVIEW', 'INSTITUTE_VERIFICATION', 'STATE_VERIFICATION', 'MINISTRY_VERIFICATION'].includes(app.status);
    if (filterTab === 'APPROVED') return app.status === 'SANCTIONED' || app.status === 'DISBURSED';
    if (filterTab === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('myApplications')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('trackStatusSub')}
          </p>
        </div>

        <Link
          to="/apply"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0c5c3a] hover:bg-[#073e27] text-white text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply for New Scheme</span>
        </Link>
      </div>

      {/* Filter Tabs matching Screen 4: All (3), Pending (0), Under Review (1), Approved (2), Rejected (0) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
            filterTab === 'ALL'
              ? 'bg-[#0c5c3a] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('allFilter')} ({counts.all})
        </button>

        <button
          onClick={() => setFilterTab('PENDING')}
          className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
            filterTab === 'PENDING'
              ? 'bg-[#0c5c3a] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('pendingFilter')} ({counts.pending})
        </button>

        <button
          onClick={() => setFilterTab('UNDER_REVIEW')}
          className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
            filterTab === 'UNDER_REVIEW'
              ? 'bg-[#0c5c3a] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('underReviewFilter')} ({counts.underReview})
        </button>

        <button
          onClick={() => setFilterTab('APPROVED')}
          className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
            filterTab === 'APPROVED'
              ? 'bg-[#0c5c3a] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('approvedFilter')} ({counts.approved})
        </button>

        <button
          onClick={() => setFilterTab('REJECTED')}
          className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
            filterTab === 'REJECTED'
              ? 'bg-[#0c5c3a] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('rejectedFilter')} ({counts.rejected})
        </button>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <ListSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center text-slate-500 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-800 text-sm">No applications found in this category</p>
          <p className="text-xs text-slate-400">Applications submitted for MoTA schemes will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const meta = getSchemeIcon(app.scholarship?.code || 'POST_MATRIC');
            const Icon = meta.icon;
            const subDate = app.submissionDate || app.createdAt;
            const formattedDate = new Date(subDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  {/* Scheme Icon */}
                  <div className={`w-12 h-12 rounded-full ${meta.color} flex items-center justify-center shrink-0 shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0c5c3a] transition-colors">
                      {app.scholarship?.name || 'Scholarship Application'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono text-slate-700 font-semibold">{app.applicationId}</span>
                      <span>•</span>
                      <span>Submitted on: {formattedDate}</span>
                      {app.student?.institution && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600">{app.student.institution}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Status Pill & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  {getStatusBadge(app.status)}
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0c5c3a] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions Grid matching Screen 4 bottom */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          {t('quickActions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/apply"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0c5c3a] shadow-sm flex flex-col items-center text-center gap-2 group transition"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#0c5c3a]">Apply New</span>
          </Link>

          <Link
            to="/applications"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0c5c3a] shadow-sm flex flex-col items-center text-center gap-2 group transition"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#0c5c3a]">{t('trackStatus')}</span>
          </Link>

          <Link
            to="/documents"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0c5c3a] shadow-sm flex flex-col items-center text-center gap-2 group transition"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#0c5c3a]">{t('uploadDocuments')}</span>
          </Link>

          <Link
            to="/payments"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0c5c3a] shadow-sm flex flex-col items-center text-center gap-2 group transition"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#0c5c3a]">{t('viewPayments')}</span>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ApplicationListPage;
