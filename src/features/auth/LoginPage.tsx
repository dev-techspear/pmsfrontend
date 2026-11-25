import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Layers,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { authService, getAuthErrorMessage } from '@/api/services/auth.service';
import { ROUTES } from '@/constants/constants';
import { TechspearLoader } from '@/components/feedback/TechspearLoader';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isClicked, setIsClicked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMSLogin = () => {
    setIsClicked(true);
    const tenant = import.meta.env.VITE_AZURE_TENANT_ID || 'db500ec9-5b8f-464c-ba7a-a39285f09fee';
    const client = import.meta.env.VITE_AZURE_CLIENT_ID || 'b3dde9b8-1fb8-4ea0-9281-d38b1dc246bf';
    const redirect = import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}/redirect`;

    const scope = 'openid profile email User.Read';
    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${client}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&response_mode=query&scope=${encodeURIComponent(scope)}`;

    setTimeout(() => {
      window.location.href = authUrl;
    }, 300);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authService.login({ email: email.trim(), password });
      if (!result?.access_token) throw new Error('Invalid token response: access_token missing.');
      await Promise.all([
        login(result.access_token, result.refresh_token, result),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      setError(getAuthErrorMessage(err, 'Sign in failed. Please check your credentials.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#06111f] text-slate-100 selection:bg-[#84B424] selection:text-[#0B1F33] font-sans">
      <AnimatePresence>
        {isSubmitting && <TechspearLoader key="signin-loader" label="Signing in" />}
      </AnimatePresence>

      {/* ================= LEFT BRAND & HERO COLUMN (Brand Guidelines Aligned) ================= */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#04436E] via-[#032D5E] to-[#0A6A74] p-12 lg:p-14 text-white relative overflow-hidden border-r border-slate-800/60">
        {/* Glow blur orbs: Brand Lime & Brand Teal */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#84B424]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-0 h-80 w-80 rounded-full bg-[#068799]/20 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo-mark.png" alt="Techspear" className="h-11 w-11 object-contain" />
          <span className="text-lg font-bold tracking-widest">TECHSPEAR</span>
        </div>

        {/* Center: Brand Typography & Value Props */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#84B424] text-xs font-semibold uppercase tracking-wider border border-white/10 backdrop-blur-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>Project Management System</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-tight">
              One workspace for every project, milestone, and delivery.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Full lifecycle project orchestration, sprint milestones, resource allocation, automated timesheets, and role-based workspace governance.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="pt-2 space-y-3 border-t border-white/10 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#84B424] shrink-0" />
              <span>Microsoft Entra ID Corporate SSO & Spear ID</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#84B424] shrink-0" />
              <span>Interactive Sprint Kanban, Gantt & Milestone Tracking</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#84B424] shrink-0" />
              <span>Role-Gated Financial Governance & Timesheets</span>
            </div>
          </div>

          <p className="pt-2 text-xs uppercase tracking-[0.25em] text-[#84B424] font-bold">
            Innovate • Inspire • Impact
          </p>
        </div>

        {/* Bottom Footer Notice */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Techspear Software Solutions</span>
          </span>
          <span className="font-mono text-slate-300">Techspear PMS v2.0</span>
        </div>
      </div>

      {/* ================= RIGHT SIGN-IN FORM COLUMN ================= */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto bg-[#071322]">
        {/* Top support link */}
        <div className="hidden lg:flex items-center justify-end text-xs text-slate-400 max-w-md mx-auto w-full mb-4">
          <div>
            <span>IT Helpdesk: </span>
            <a href="mailto:support@techspear.in" className="text-[#84B424] hover:underline font-medium">
              support@techspear.in
            </a>
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="bg-[#0f2138] rounded-3xl p-6 sm:p-9 shadow-2xl border border-slate-700/60">
            {/* Header */}
            <div className="text-center mb-6">
              <img
                src="/logo-mark.png"
                alt="Techspear"
                className="mx-auto h-12 w-12 object-contain mb-3"
              />
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Sign in to Techspear PMS
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Use your Techspear corporate Microsoft 365 account or authorized credentials.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 animate-in fade-in"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed flex-1">{error}</p>
                </div>
              </div>
            )}

            {/* Primary Action: Microsoft 365 SSO Button (Matching Leads & SIMS) */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={isClicked || isSubmitting}
                onClick={handleMSLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#142d48] hover:bg-[#1a3a5c] text-white font-medium text-xs sm:text-sm border border-slate-600/80 transition-all duration-150 shadow-md group disabled:opacity-50 cursor-pointer"
              >
                {isClicked ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true" className="shrink-0">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                )}
                <span>
                  {isClicked ? 'Redirecting to Microsoft…' : 'Sign in with Microsoft 365'}
                </span>
              </button>

              <p className="text-[11px] text-slate-400 text-center pt-0.5">
                For Techspear staff, project managers, and internal employees.
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/60" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-[#0f2138] px-3 text-slate-400 font-medium">
                  Or continue with password
                </span>
              </div>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-4" noValidate>
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#071322] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#04436E] focus:ring-1 focus:ring-[#04436E] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <a
                    href="mailto:support@techspear.in?subject=Password%20Reset%20Request%20-%20PMS"
                    className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#071322] border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-[#04436E] focus:ring-1 focus:ring-[#04436E] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isClicked || !email.trim() || !password}
                className="w-full h-11 rounded-[6px] bg-[#04436E] hover:bg-[#032D5E] text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 mt-2 transition-all duration-150 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign in with Password'
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-700/60 pt-4 text-center text-xs text-slate-400">
              <span>New commercial partner or freelancer? </span>
              <Link to={ROUTES.REGISTER} className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 py-3">
          Techspear © 2026 · All Rights Reserved
        </div>
      </div>
    </div>
  );
}
