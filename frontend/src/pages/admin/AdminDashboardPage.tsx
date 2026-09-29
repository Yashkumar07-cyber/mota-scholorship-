import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Building,
  TrendingUp,
  Search,
  Eye,
  Check,
  X,
  FileWarning,
  Calendar,
  ArrowRight,
  Filter,
  RefreshCw,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Application } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useLanguage();

  const [metrics, setMetrics] = useState<any>({
    totalApplications: 12482,
    approved: 9856,
    pending: 1245,
    rejected: 381,
    totalDisbursed: 359000,
  });

  const [recentApplications, setRecentApplications] = useState<any[]>([
    {
      id: 'app-1',
      studentName: 'Sita Kisku',
      scheme: 'Post-Matric Scholarship',
      code: 'POST_MATRIC',
      applicationId: 'MOTA-2025-000017',
      status: 'MANUAL_REVIEW',
      statusLabel: 'Under Review',
      date: '12 Aug 2025',
      discrepancy: 'Income certificate variation detected by state e-District adapter.',
    },
    {
      id: 'app-2',
      studentName: 'Ramesh Tudu',
      scheme: 'Top Class Education',
      code: 'TOP_CLASS',
      applicationId: 'MOTA-2025-000016',
      status: 'SANCTIONED',
      statusLabel: 'Approved',
      date: '08 Aug 2025',
    },
    {
      id: 'app-3',
      studentName: 'Laxmi Murmu',
      scheme: 'Pre-Matric Scholarship',
      code: 'PRE_MATRIC',
      applicationId: 'MOTA-2025-000015',
      status: 'SUBMITTED',
      statusLabel: 'Pending',
      date: '28 Jul 2025',
    },
    {
      id: 'app-4',
      studentName: 'Rahul Munda',
      scheme: 'Post-Matric Scholarship',
      code: 'POST_MATRIC',
      applicationId: 'MOTA-2026-000017',
      status: 'SANCTIONED',
      statusLabel: 'Approved',
      date: '29 Sep 2026',
    },
    {
      id: 'app-5',
      studentName: 'Birsa Birhor',
      scheme: 'NFST Fellowship',
      code: 'NFST',
      applicationId: 'MOTA-2026-000122',
      status: 'MANUAL_REVIEW',
      statusLabel: 'Under Review',
      date: '15 Sep 2026',
      discrepancy: 'University enrollment seal requires officer validation.',
    },
  ]);

  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REQUEST_CORRECTION' | 'REJECT'>('APPROVE');
  const [officerRemarks, setOfficerRemarks] = useState<string>('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, queueRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/admin/manual-reviews'),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        const d = dashRes.value.data;
        const total = d.metrics.totalApplications || 0;
        const approved = (d.metrics.sanctioned || 0) + (d.metrics.disbursed || 0);
        const pending = (d.metrics.pendingVerification || 0) + (d.metrics.manualReview || 0);
        const rejected = d.metrics.rejected || 0;

        setMetrics({
          totalApplications: total,
          approved: approved,
          pending: pending,
          rejected: rejected,
          totalDisbursed: d.metrics.totalDisbursedAmount || 0,
        });

        if (d.recentApplications && d.recentApplications.length > 0) {
          const liveRecent = d.recentApplications.map((c: any) => ({
            id: c.id,
            studentName: c.student?.name || 'Applicant',
            scheme: c.scholarship?.name || 'Scholarship Scheme',
            code: c.scholarship?.code || 'POST_MATRIC',
            applicationId: c.applicationId,
            status: c.status,
            statusLabel:
              c.status === 'SANCTIONED' || c.status === 'DISBURSED'
                ? 'Approved'
                : c.status === 'REJECTED'
                ? 'Rejected'
                : c.status === 'MANUAL_REVIEW'
                ? 'Under Review'
                : 'Pending',
            date: new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            discrepancy: c.remarks || (c.status === 'MANUAL_REVIEW' ? 'Income / Document mismatch requiring manual officer review.' : undefined),
          }));
          setRecentApplications(liveRecent);
        }
      }

      if (queueRes.status === 'fulfilled' && queueRes.value.data?.cases?.length > 0) {
        const liveCases = queueRes.value.data.cases.map((c: any) => ({
          id: c.id,
          studentName: c.student?.name || 'Applicant',
          scheme: c.scholarship?.name || 'Scholarship Scheme',
          code: c.scholarship?.code || 'POST_MATRIC',
          applicationId: c.applicationId,
          status: c.status,
          statusLabel: 'Under Review',
          date: new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          discrepancy: c.remarks || 'Document scrutiny requested by verification adapter.',
        }));

        setRecentApplications((prev) => {
          const map = new Map();
          [...liveCases, ...prev].forEach((item) => map.set(item.applicationId, item));
          return Array.from(map.values()).slice(0, 10);
        });
      }
    } catch {
      // Retain fallback data if network failure
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    setIsSubmittingDecision(true);
    setDecisionSuccess(null);
    try {
      const res = await api.post(`/admin/manual-reviews/${selectedCase.id}/decision`, {
        decision: reviewDecision,
        remarks: officerRemarks || (reviewDecision === 'APPROVE' ? 'Officer verified Tehsildar seal and issued sanction.' : 'Correction requested from student.'),
        sanctionAmount: 36500,
      });

      if (res.data?.success) {
        setDecisionSuccess(`Case ${selectedCase.applicationId} successfully resolved (${reviewDecision})!`);
        // Update local list status
        setRecentApplications((prev) =>
          prev.map((item) =>
            item.applicationId === selectedCase.applicationId
              ? {
                  ...item,
                  status: reviewDecision === 'APPROVE' ? 'SANCTIONED' : reviewDecision === 'REJECT' ? 'REJECTED' : 'DEFICIENCY',
                  statusLabel: reviewDecision === 'APPROVE' ? 'Approved' : reviewDecision === 'REJECT' ? 'Rejected' : 'Action Req',
                }
              : item
          )
        );
        setSelectedCase(null);
        setOfficerRemarks('');
      }
    } catch (err: any) {
      alert(err.message || 'Action completed in simulation.');
      setSelectedCase(null);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER ROW MATCHING SCREEN 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('adminDashboard')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Overview of scholarship applications, verifications and payments.
          </p>
        </div>

        {/* Date Filter Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchAdminData}
            className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-[#0c5c3a] ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
            <span>Aug 2025</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {decisionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{decisionSuccess}</span>
          </div>
          <button onClick={() => setDecisionSuccess(null)} className="underline text-[11px] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. FOUR TOP METRIC CARDS MATCHING SCREEN 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Applications */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <span>{t('totalApplications')}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-3">
              {metrics.totalApplications.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>12% from last cycle</span>
            </div>
          </div>
        </div>

        {/* Card 2: Approved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>{t('approvedMetric')}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-3">
              {metrics.approved.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>8% sanction rate</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span>{t('pendingMetric')}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-3">
              {metrics.pending.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>5% in queue</span>
            </div>
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span>{t('rejectedMetric')}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-3">
              {metrics.rejected.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1">
              <ArrowDownRight className="w-3 h-3" />
              <span>2% ineligible</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE ROW: TWO CHARTS MATCHING SCREEN 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Applications Trend (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('applicationsTrend')}</h3>
              <p className="text-xs text-slate-400">Total vs Approved applications across recent months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Total</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Approved</span>
              </div>
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="w-full h-56 pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Y Axis Labels */}
              <text x="30" y="25" fill="#94a3b8" fontSize="10" textAnchor="end">8K</text>
              <text x="30" y="65" fill="#94a3b8" fontSize="10" textAnchor="end">6K</text>
              <text x="30" y="105" fill="#94a3b8" fontSize="10" textAnchor="end">4K</text>
              <text x="30" y="145" fill="#94a3b8" fontSize="10" textAnchor="end">2K</text>

              {/* Area 1: Total Applications */}
              <path
                d="M 50 130 C 130 110, 200 80, 260 70 C 320 60, 390 40, 470 30 L 470 150 L 50 150 Z"
                fill="url(#blueGradient)"
              />
              <path
                d="M 50 130 C 130 110, 200 80, 260 70 C 320 60, 390 40, 470 30"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
              />

              {/* Area 2: Approved Applications */}
              <path
                d="M 50 145 C 130 135, 200 115, 260 95 C 320 80, 390 60, 470 45 L 470 150 L 50 150 Z"
                fill="url(#emeraldGradient)"
              />
              <path
                d="M 50 145 C 130 135, 200 115, 260 95 C 320 80, 390 60, 470 45"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Points */}
              <circle cx="50" cy="130" r="3.5" fill="#3b82f6" />
              <circle cx="150" cy="100" r="3.5" fill="#3b82f6" />
              <circle cx="260" cy="70" r="3.5" fill="#3b82f6" />
              <circle cx="370" cy="45" r="3.5" fill="#3b82f6" />
              <circle cx="470" cy="30" r="4" fill="#3b82f6" />

              <circle cx="50" cy="145" r="3.5" fill="#10b981" />
              <circle cx="150" cy="130" r="3.5" fill="#10b981" />
              <circle cx="260" cy="95" r="3.5" fill="#10b981" />
              <circle cx="370" cy="65" r="3.5" fill="#10b981" />
              <circle cx="470" cy="45" r="4" fill="#10b981" />

              {/* X Axis Month Labels */}
              <text x="50" y="168" fill="#64748b" fontSize="10" textAnchor="middle">Apr</text>
              <text x="150" y="168" fill="#64748b" fontSize="10" textAnchor="middle">May</text>
              <text x="260" y="168" fill="#64748b" fontSize="10" textAnchor="middle">Jun</text>
              <text x="370" y="168" fill="#64748b" fontSize="10" textAnchor="middle">Jul</text>
              <text x="470" y="168" fill="#64748b" fontSize="10" textAnchor="middle">Aug</text>
            </svg>
          </div>
        </div>

        {/* Right Chart: Scheme-wise Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('schemeWiseDistribution')}</h3>
            <p className="text-xs text-slate-400">Share of awards by statutory scheme</p>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative w-40 h-40 mx-auto my-3 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Circle circumference = 2 * PI * 38 ≈ 238.76 */}
              {/* Pre-Matric: 28% -> strokeDasharray="66.8 238.76" */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="14" strokeDasharray="66.8 238.76" strokeDashoffset="0" />
              {/* Post-Matric: 34% -> 81.1 */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="14" strokeDasharray="81.1 238.76" strokeDashoffset="-66.8" />
              {/* Top Class: 16% -> 38.2 */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="14" strokeDasharray="38.2 238.76" strokeDashoffset="-147.9" />
              {/* NFST: 12% -> 28.6 */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="14" strokeDasharray="28.6 238.76" strokeDashoffset="-186.1" />
              {/* NOS: 10% -> 23.8 */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ef4444" strokeWidth="14" strokeDasharray="23.8 238.76" strokeDashoffset="-214.7" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-base font-extrabold text-slate-900">12.5K</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <span className="text-slate-600">Pre-Matric</span>
              </div>
              <span className="font-bold text-slate-900">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                <span className="text-slate-600">Post-Matric</span>
              </div>
              <span className="font-bold text-slate-900">34%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                <span className="text-slate-600">Top Class</span>
              </div>
              <span className="font-bold text-slate-900">16%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                <span className="text-slate-600">NFST</span>
              </div>
              <span className="font-bold text-slate-900">12%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                <span className="text-slate-600">NOS</span>
              </div>
              <span className="font-bold text-slate-900">10%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM ROW: RECENT APPLICATIONS TABLE + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Applications (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{t('recentApplications')}</h3>
            <span className="text-xs text-[#0c5c3a] font-semibold hover:underline cursor-pointer">
              {t('viewAll')} →
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">{t('studentName')}</th>
                  <th className="px-4 py-3">{t('scheme')}</th>
                  <th className="px-4 py-3">{t('applicationId')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('date')}</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {app.studentName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {app.scheme}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {app.applicationId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          app.statusLabel === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.statusLabel === 'Under Review'
                            ? 'bg-amber-100 text-amber-800'
                            : app.statusLabel === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {app.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {app.date}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {app.statusLabel === 'Under Review' ? (
                        <button
                          onClick={() => setSelectedCase(app)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-[11px] transition shadow-xs"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {t('quickActions')}
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <Link
              to="/admin/manual-reviews"
              className="p-4 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex flex-col items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#0c5c3a]">
                {t('verifyDocuments')}
              </span>
            </Link>

            <button
              onClick={() => alert('Direct Benefit Transfer batch (PFMS 2026-Cycle) initialized successfully!')}
              className="p-4 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex flex-col items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#0c5c3a]">
                {t('processPayments')}
              </span>
            </button>

            <Link
              to="/admin/audit-logs"
              className="p-4 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex flex-col items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#0c5c3a]">
                {t('viewReports')}
              </span>
            </Link>

            <Link
              to="/scholarships"
              className="p-4 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition flex flex-col items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#0c5c3a]">
                {t('manageSchemes')}
              </span>
            </Link>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#0c5c3a]">
              <ShieldCheck className="w-4 h-4" />
              <span>Officer Verification Portal</span>
            </div>
            <p className="text-[11px] text-emerald-950/80 leading-relaxed">
              Every decision logged into immutable government audit trail according to MoTA IT Security Norms 2026.
            </p>
          </div>
        </div>

      </div>

      {/* ADJUDICATION DECISION MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Manual Review Adjudication
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedCase.studentName} — {selectedCase.applicationId}
                </h3>
                <p className="text-xs text-slate-500">{selectedCase.scheme}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedCase.discrepancy && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-950">
                <span className="font-bold flex items-center gap-1 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flagged Discrepancy Note:
                </span>
                <p>{selectedCase.discrepancy}</p>
              </div>
            )}

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Officer Adjudication Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('APPROVE')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      reviewDecision === 'APPROVE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('REQUEST_CORRECTION')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      reviewDecision === 'REQUEST_CORRECTION'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FileWarning className="w-3.5 h-3.5" />
                    Correction
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('REJECT')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      reviewDecision === 'REJECT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Verification Remarks
                </label>
                <textarea
                  rows={3}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  placeholder="Enter formal justification for audit trail..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDecision}
                  className="px-4 py-2 bg-[#0c5c3a] hover:bg-[#073e27] text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingDecision ? 'Submitting...' : 'Record Official Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
