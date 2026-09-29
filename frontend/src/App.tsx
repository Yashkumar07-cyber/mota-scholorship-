import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { ScholarshipListPage } from './pages/scholarships/ScholarshipListPage';
import { ScholarshipDetailPage } from './pages/scholarships/ScholarshipDetailPage';
import { NewApplicationPage } from './pages/applications/NewApplicationPage';
import { ApplicationListPage } from './pages/applications/ApplicationListPage';
import { ApplicationTrackerPage } from './pages/applications/ApplicationTrackerPage';
import { DocumentWalletPage } from './pages/documents/DocumentWalletPage';
import { PaymentTrackerPage } from './pages/payments/PaymentTrackerPage';
import { JagoChatbotPage } from './pages/chatbot/JagoChatbotPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOutreachPage } from './pages/admin/AdminOutreachPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';

// Protection Wrapper for Authenticated Users
const RequireAuth: React.FC<{ children: JSX.Element; allowedRole?: 'STUDENT' | 'ADMIN' }> = ({
  children,
  allowedRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf6]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-mota-forest border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-mota-muted">Connecting to MoTA Secure Gateway...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole === 'ADMIN' && user.role !== 'ADMIN' && user.role !== 'VERIFICATION_OFFICER') {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRole === 'STUDENT' && (user.role === 'ADMIN' || user.role === 'VERIFICATION_OFFICER')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// Route Redirector based on user role
const RootRedirector: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN' || user.role === 'VERIFICATION_OFFICER') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirector />} />

          {/* Student Portal (Mobile-First) */}
          <Route
            element={
              <RequireAuth allowedRole="STUDENT">
                <StudentLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/scholarships" element={<ScholarshipListPage />} />
            <Route path="/scholarships/all" element={<Navigate to="/scholarships" replace />} />
            <Route path="/scholarships/:code" element={<ScholarshipDetailPage />} />
            <Route path="/apply" element={<NewApplicationPage />} />
            <Route path="/apply/:code" element={<NewApplicationPage />} />
            <Route path="/applications" element={<ApplicationListPage />} />
            <Route path="/applications/new" element={<NewApplicationPage />} />
            <Route path="/applications/:id" element={<ApplicationTrackerPage />} />
            <Route path="/documents" element={<DocumentWalletPage />} />
            <Route path="/payments" element={<PaymentTrackerPage />} />
            <Route path="/chatbot" element={<JagoChatbotPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Portal (Desktop-First) */}
          <Route
            path="/admin"
            element={
              <RequireAuth allowedRole="ADMIN">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="manual-reviews" element={<AdminDashboardPage />} />
            <Route path="applications" element={<AdminDashboardPage />} />
            <Route path="outreach" element={<AdminOutreachPage />} />
            <Route path="audit-logs" element={<AdminAuditLogPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<RootRedirector />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
