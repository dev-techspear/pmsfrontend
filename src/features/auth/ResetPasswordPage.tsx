import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Logo } from '@/components/core/Logo';
import './auth.scss';
import { authService, getAuthErrorMessage } from '@/api/services/auth.service';
import { PASSWORD_POLICY, ROUTES } from '@/constants/constants';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  // Keep the token in memory only: take it from the address once, then remove it from the URL
  // so it does not linger in history, screenshots or a shared screen.
  const [token] = useState(() => searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [linkProblem, setLinkProblem] = useState(false);

  useEffect(() => {
    if (token) window.history.replaceState(null, '', window.location.pathname);
  }, [token]);

  const validate = (): string | null => {
    if (password.length < PASSWORD_POLICY.MIN_LENGTH)
      return `Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters.`;
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      return 'Password must contain at least one letter and one number.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      setDoneMessage(await authService.resetPassword(token, password));
    } catch (err: any) {
      const message = getAuthErrorMessage(err, 'Could not reset your password. Please try again.');
      // A bad link cannot be fixed on this page: send them to request a new one.
      if (/invalid or has expired/i.test(message)) setLinkProblem(true);
      setError(message);
      setIsSubmitting(false);
    }
  };

  const noToken = !token;

  return (
    <div className="auth-wrapper">
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />
      <div className="auth-orb-3" />
      <div className="auth-grid" />

      <div className="auth-card-container">
        <div className="auth-card">
          <div className="auth-glow-line" />

          <div className="auth-logo-section">
            <div className="auth-logo-icon-box">
              <Logo className="h-[38px] text-white" showText={true} />
            </div>
          </div>

          {doneMessage ? (
            <>
              <div className="auth-title-block">
                <h1 className="auth-title">Password changed</h1>
                <p className="auth-subtitle">{doneMessage}</p>
              </div>
              <Link to={ROUTES.LOGIN} className="auth-submit-btn auth-submit-link">
                Sign in
              </Link>
            </>
          ) : noToken || linkProblem ? (
            <>
              <div className="auth-title-block">
                <h1 className="auth-title">Link not valid</h1>
                <p className="auth-subtitle">
                  This password reset link is invalid or has expired. Links work once and last 60 minutes.
                </p>
              </div>
              <Link to={ROUTES.FORGOT_PASSWORD} className="auth-submit-btn auth-submit-link">
                Request a new link
              </Link>
            </>
          ) : (
            <>
              <div className="auth-title-block">
                <h1 className="auth-title">Set a new password</h1>
              </div>

              <form className="auth-form auth-form-spaced" onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="rp-password">New password</label>
                  <div className="auth-input-wrap">
                    <input id="rp-password" className="auth-input"
                      type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                      maxLength={PASSWORD_POLICY.MAX_LENGTH}
                      value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" className="auth-input-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <span className="auth-hint">
                    At least {PASSWORD_POLICY.MIN_LENGTH} characters, with a letter and a number.
                  </span>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="rp-confirm">Confirm new password</label>
                  <input id="rp-confirm" className="auth-input"
                    type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>

                <div className="auth-form-error" role="alert" aria-live="polite">
                  {error}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? <div className="auth-ms-btn-spinner" /> : 'Change password'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="auth-footer">Techspear © 2026 · All Rights Reserved</p>
      </div>
    </div>
  );
}
