import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Smartphone,
  Lock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Eye,
  EyeOff,
  UserPlus,
  Building,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginStudent, loginAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'STUDENT_LOGIN' | 'STUDENT_REGISTER' | 'ADMIN_PORTAL'>('STUDENT_LOGIN');

  // Student Login Fields
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Student Registration Fields
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regState, setRegState] = useState('Jharkhand');
  const [regDistrict, setRegDistrict] = useState('Ranchi');
  const [regTribe, setRegTribe] = useState('Munda');
  const [regInstitution, setRegInstitution] = useState('');
  const [regIncome, setRegIncome] = useState('180000');

  // Admin Login Fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Send OTP
  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setError(null);
      setSendingOtp(true);
      const res = await api.post('/auth/otp/send', { mobile });
      setOtpSent(true);
      setOtpNotice(
        res.data.demoOtp
          ? `${res.data.message} [Code: ${res.data.demoOtp}]`
          : res.data.message
      );
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP. Please retry.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Student Login Submit
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit verification OTP.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await loginStudent(mobile, otp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Student Register Submit
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regMobile) {
      setError('Full Name and Mobile number are required.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: regName,
        mobile: regMobile,
        state: regState,
        district: regDistrict,
        tribeCategory: 'ST',
        tribeName: regTribe,
        institution: regInstitution || 'Ranchi University, Ranchi',
        familyIncome: Number(regIncome),
      });

      if (res.data?.token) {
        localStorage.setItem('mota_auth_token', res.data.token);
        localStorage.setItem('mota_user', JSON.stringify(res.data.user));
        setSuccessMsg(res.data.message);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Officer Login Submit
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setError('Please enter your official email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: adminEmail,
        password: adminPassword,
        adminSecretKey,
      });

      if (res.data?.token) {
        localStorage.setItem('mota_auth_token', res.data.token);
        localStorage.setItem('mota_user', JSON.stringify(res.data.user));
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Officer authorization denied.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 antialiased font-sans">
      
      {/* Ministry Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-[#062e1e] text-emerald-300 rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl shadow-md border border-emerald-800 mb-3">
          🏛️
        </div>
        <span className="text-[11px] font-bold text-[#0c5c3a] tracking-wider uppercase block">
          Government of India
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Ministry of Tribal Affairs
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          MoTA Unified Portal • National ST Scholarship & Fellowship Registry
        </p>
      </div>

      {/* Main Form Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:px-8 shadow-gov rounded-2xl border border-slate-200">
          
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 mb-5 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('STUDENT_LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-center border-b-2 transition ${
                activeTab === 'STUDENT_LOGIN'
                  ? 'border-[#0c5c3a] text-[#0c5c3a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Student Login
            </button>

            <button
              onClick={() => {
                setActiveTab('STUDENT_REGISTER');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-center border-b-2 transition ${
                activeTab === 'STUDENT_REGISTER'
                  ? 'border-[#0c5c3a] text-[#0c5c3a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              New Registration
            </button>

            <button
              onClick={() => {
                setActiveTab('ADMIN_PORTAL');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-center border-b-2 transition ${
                activeTab === 'ADMIN_PORTAL'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Officer Portal
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: STUDENT LOGIN (OTP) */}
          {activeTab === 'STUDENT_LOGIN' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full pl-11 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a] focus:bg-white"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || mobile.length < 10}
                    className="px-3 py-2 bg-[#0c5c3a] hover:bg-[#073e27] text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpNotice && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-[11px] leading-relaxed">
                  📱 {otpNotice}
                </div>
              )}

              {otpSent && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 6-Digit Verification OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    placeholder="Enter 6-digit OTP received"
                    className="w-full px-3 py-2.5 text-center tracking-widest font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a] focus:bg-white"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Valid for 10 minutes. For testing, default code is 123456.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !otpSent}
                className="w-full py-2.5 px-4 bg-[#0c5c3a] hover:bg-[#073e27] text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In with OTP'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMobile('9999999999');
                    setOtp('123456');
                    setOtpSent(true);
                  }}
                  className="text-[11px] text-slate-400 hover:text-[#0c5c3a] underline"
                >
                  Quick Fill Demo Student (Rahul Munda)
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: NEW STUDENT REGISTRATION */}
          {activeTab === 'STUDENT_REGISTER' && (
            <form onSubmit={handleStudentRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name (as in Aadhaar) *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Pooja Hansda"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tribe Community</label>
                  <input
                    type="text"
                    value={regTribe}
                    onChange={(e) => setRegTribe(e.target.value)}
                    placeholder="e.g. Santhal / Munda"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  College / Institution Name
                </label>
                <input
                  type="text"
                  value={regInstitution}
                  onChange={(e) => setRegInstitution(e.target.value)}
                  placeholder="e.g. National Institute of Technology, Jamshedpur"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Annual Family Income (₹)
                </label>
                <input
                  type="number"
                  value={regIncome}
                  onChange={(e) => setRegIncome(e.target.value)}
                  placeholder="e.g. 180000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c5c3a]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0c5c3a] hover:bg-[#073e27] text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Creating OTR...' : 'Create Account & Generate OTR ID'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: AUTHORIZED OFFICER PORTAL (SPECIAL ACCESS) */}
          {activeTab === 'ADMIN_PORTAL' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-snug">
                🔒 <strong>Restricted Access:</strong> Designated for Ministry of Tribal Affairs (MoTA) Verification Officers and State Tribal Welfare Administrators.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Officer Email ID
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e.g. admin@mota-demo.local"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter official password"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Officer Access Key (Passcode)
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminSecretKey}
                    onChange={(e) => setAdminSecretKey(e.target.value)}
                    placeholder="Passcode: MOTA-OFFICER-2026"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Special access key verifies officer clearance before issuing sanctions.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Authorizing Clearance...' : 'Verify Officer Clearance & Sign In'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin@mota-demo.local');
                    setAdminPassword('Admin@123');
                    setAdminSecretKey('MOTA-OFFICER-2026');
                  }}
                  className="text-[11px] text-slate-400 hover:text-amber-800 underline"
                >
                  Quick Fill Authorized Officer Clearance
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
