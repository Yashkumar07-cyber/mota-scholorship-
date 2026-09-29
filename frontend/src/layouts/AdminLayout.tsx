import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  AlertCircle,
  Users2,
  FileText,
  LogOut,
  Search,
  Globe,
  Bell,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 'notif-admin-1',
      title: 'Manual Review Required',
      message: 'Application MOTA-2025-000017 has an income discrepancy flagged by State e-District portal.',
      type: 'WARNING',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-admin-2',
      title: 'DBT Batch Scheduled',
      message: 'Batch DBT-2026-JH-01 with 12 sanctioned beneficiaries scheduled for PFMS transmission.',
      type: 'INFO',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-admin-3',
      title: 'PVTG Outreach Alert',
      message: '42 Birhor and Asur candidates in Gumla identified without Aadhaar bank seeding.',
      type: 'ACTION_REQUIRED',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'notif-admin-4',
      title: 'DigiLocker API Connected',
      message: 'Live verification gateway active. 142 ST certificates verified today.',
      type: 'SUCCESS',
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success && res.data.notifications?.length > 0) {
          setNotifications(res.data.notifications);
        }
      } catch {
        // Retain initial admin operational alerts
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: t('adminDashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manual Review Desk', path: '/admin/manual-reviews', icon: AlertCircle, badge: 'Live' },
    { label: 'Unreached Beneficiaries', path: '/admin/outreach', icon: Users2, badge: 'AI Match' },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex antialiased font-sans text-slate-800">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* LEFT SIDEBAR (Dark Forest Green matching Screen 5) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#062e1e] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#0f442d] flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0e4f34] flex items-center justify-center text-xl shadow-inner border border-[#176a47]">
                🏛️
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-semibold text-emerald-300/80 tracking-wider block">
                  {t('minOfTribalAffairs')}
                </span>
                <span className="text-xs text-slate-300 block">{t('govOfIndia')}</span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">{t('portalTitle')}</h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/60 leading-snug mt-0.5">
              Empowering Tribal Students Through Education
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#0e5c3c] text-white shadow-sm font-semibold'
                      : 'text-emerald-100/70 hover:bg-[#0a402a] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-emerald-400/80'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-700/60 text-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-[#0f442d] mt-4 px-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-xs font-semibold text-emerald-300/80 hover:text-white transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Switch to Student View</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#0f442d] bg-[#052619]/60">
          <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400/30">
            <svg className="w-full h-8" viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M10 20 L25 5 L40 20 L55 5 L70 20 L85 5 L100 20 L115 5 L130 20 L145 5 L160 20 L175 5 L190 20" />
              <circle cx="25" cy="25" r="2" fill="currentColor" />
              <circle cx="55" cy="25" r="2" fill="currentColor" />
              <circle cx="85" cy="25" r="2" fill="currentColor" />
              <circle cx="115" cy="25" r="2" fill="currentColor" />
              <circle cx="145" cy="25" r="2" fill="currentColor" />
              <circle cx="175" cy="25" r="2" fill="currentColor" />
            </svg>
          </div>
          <p className="text-[10px] text-center text-emerald-200/50 uppercase tracking-widest font-medium">
            {t('educationEmpowermentProgress')}
          </p>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input Bar */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications, candidates, or schemes..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c5c3a] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Date filter pill */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
              📅 2025-2026 Cycle
            </span>

            {/* Hindi / English Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#0c5c3a] text-xs font-semibold transition"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifDrawer(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition relative"
              title={t('notifications')}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Admin Avatar & Details */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#062e1e] text-emerald-300 flex items-center justify-center text-xs font-bold shadow-sm border border-emerald-800">
                AD
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <span className="text-xs font-bold text-slate-900 block">
                  Admin Officer
                </span>
                <span className="text-[10px] text-slate-500 block">
                  MoTA Desk
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 transition rounded ml-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT ROUTER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ADMIN NOTIFICATIONS DRAWER */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setShowNotifDrawer(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#062e1e]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {t('notifications')}
                  <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                    ADMIN
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-emerald-700 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active administrative alerts.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition ${
                      n.type === 'SUCCESS'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : n.type === 'WARNING' || n.type === 'ACTION_REQUIRED'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        {n.type === 'WARNING' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        ) : n.type === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>{n.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <Link
                to="/admin/manual-reviews"
                onClick={() => setShowNotifDrawer(false)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Go to Manual Review Desk &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;
