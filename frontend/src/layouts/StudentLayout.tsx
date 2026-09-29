import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  FolderOpen,
  CreditCard,
  Bell,
  MessageSquare,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { Notification } from '../types';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const student = user?.student;

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount ?? res.data.notifications?.filter((n: any) => !n.read).length ?? 3);
      }
    } catch {
      // Keep seeded count
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const navItems = [
    { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('scholarships'), path: '/scholarships', icon: GraduationCap },
    { label: t('applications'), path: '/applications', icon: FileText },
    { label: t('documents'), path: '/documents', icon: FolderOpen },
    { label: t('payments'), path: '/payments', icon: CreditCard },
    { label: t('notifications'), path: '#notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { label: t('chatWithJago'), path: '/chatbot', icon: MessageSquare },
    { label: t('profile'), path: '/profile', icon: User },
  ];

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    if (path === '#notifications') {
      e.preventDefault();
      setShowNotifDrawer(true);
      setSidebarOpen(false);
      return;
    }
    setSidebarOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/scholarships?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
    } catch {}
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex antialiased font-sans text-slate-800">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* LEFT SIDEBAR (Dark Forest Green matching uploaded design) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#062e1e] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#0f442d] flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
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
            <h1 className="text-sm font-bold text-white tracking-tight">{t('portalTitle')}</h1>
            <p className="text-[10px] text-emerald-200/60 leading-snug mt-0.5">
              {t('portalSubtitle')}
            </p>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path !== '#notifications' &&
                (location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path)));

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={(e) => handleNavClick(item.path, e)}
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
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Subtle Tribal Pattern */}
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
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c5c3a] focus:bg-white transition"
              />
            </form>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
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
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              title={t('notifications')}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* User Avatar & Name */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0c5c3a] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                RM
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <span className="text-xs font-bold text-slate-900 block">
                  {student?.name || 'Rahul Munda'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {t('profile')} • ST
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 transition rounded ml-1"
                title={t('logout')}
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

      {/* NOTIFICATIONS DRAWER */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setShowNotifDrawer(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0c5c3a]" />
                <h3 className="font-bold text-slate-900 text-sm">{t('notifications')}</h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#0c5c3a] hover:underline font-semibold"
                  >
                    Mark read
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
                  No notifications at this time.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border text-xs space-y-1 ${
                      n.type === 'SUCCESS'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : n.type === 'WARNING' || n.type === 'ACTION_REQUIRED'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentLayout;
