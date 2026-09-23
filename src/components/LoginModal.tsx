import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { UserAccount } from '../types';
import { api } from '../utils/api';
import {
  Lock,
  User,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  Loader2,
  KeyRound,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: UserAccount, isAdminPanelDirect?: boolean) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

type AdminFlowStep = 'closed' | 'code' | 'login';

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
  theme,
  onToggleTheme
}) => {
  // Navigation between Student Login and Hidden Admin Flow
  const [adminFlow, setAdminFlow] = useState<AdminFlowStep>('closed');

  // Student Login state
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Hidden Admin Step 1: Access Code state
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  // Hidden Admin Step 2: Admin Credentials state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Shared state
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Normal Student Login
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await api.loginStudent(studentUsername.trim(), studentPassword);
      setIsLoading(false);

      if (!res.success || !res.user) {
        setErrorMessage(
          res.error || 'Invalid credentials. Please verify your username and password.'
        );
        return;
      }

      onLoginSuccess(res.user, false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Login connection failed. Please try again.');
    }
  };

  // 2. Hidden Admin Step 1: Verify Access Code 123
  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccessCodeError('');

    if (accessCode.trim() === '123') {
      setAccessCodeError('');
      setAdminFlow('login');
      setAdminUsername('ADMIN');
      setAdminPassword('');
    } else {
      setAccessCodeError('Incorrect access code. Access restricted to authorized personnel.');
    }
  };

  // 3. Hidden Admin Step 2: Admin Login with Username & Password
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await api.loginAdmin(adminUsername.trim(), adminPassword);
      setIsLoading(false);

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Invalid Administrator credentials.');
        return;
      }

      onLoginSuccess(res.user, true);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Administrator authentication failed.');
    }
  };

  const handleResetToStudentLogin = () => {
    setAdminFlow('closed');
    setAccessCode('');
    setAccessCodeError('');
    setErrorMessage('');
    setAdminPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors relative">
      {/* Floating Theme Toggle */}
      <div className="fixed top-4 right-4 z-30">
        <button
          type="button"
          onClick={onToggleTheme}
          id="login-theme-toggle"
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-md flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all active:scale-95"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-zinc-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Ambient background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-25">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Authentication Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <BrandLogo size="lg" className="mb-4" />

            {adminFlow === 'closed' && (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs">
                  Sign in with your student credentials assigned by your Administrator
                </p>
              </>
            )}

            {adminFlow === 'code' && (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Security Access
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  Enter the access code to unlock the Administrator Portal
                </p>
              </>
            )}

            {adminFlow === 'login' && (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Admin Login
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  Enter administrator credentials to open the Admin Panel
                </p>
              </>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* FLOW 1: NORMAL STUDENT LOGIN                             */}
          {/* ======================================================== */}
          {adminFlow === 'closed' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your student username"
                    value={studentUsername}
                    onChange={e => setStudentUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={studentPassword}
                    onChange={e => setStudentPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showStudentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Learning Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Discreet Bottom Bar with small Admin Button */}
              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  ILMHUB Central Cloud
                </span>

                {/* Small Admin Button */}
                <button
                  type="button"
                  id="admin-access-btn"
                  onClick={() => {
                    setAdminFlow('code');
                    setAccessCode('');
                    setAccessCodeError('');
                    setErrorMessage('');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Administrator Access"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* FLOW 2: HIDDEN ADMIN STEP 1 - ACCESS CODE (123)          */}
          {/* ======================================================== */}
          {adminFlow === 'code' && (
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4 animate-in fade-in duration-200">
              {accessCodeError && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{accessCodeError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Access Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    autoFocus
                    required
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:tracking-normal placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToStudentLogin}
                  className="flex-1 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span>Verify Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* FLOW 3: HIDDEN ADMIN STEP 2 - ADMIN USERNAME & PASSWORD  */}
          {/* ======================================================== */}
          {adminFlow === 'login' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Code 123 verified! Enter Administrator credentials.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter admin username (ADMIN)"
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToStudentLogin}
                  className="flex-1 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Student Login</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5" />
                      <span>Open Admin Panel</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Central Cloud Sync • Multi-Device Cross-Platform Access</span>
        </div>
      </div>
    </div>
  );
};
