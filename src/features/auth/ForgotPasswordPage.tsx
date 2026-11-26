import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/core/Logo';
import './auth.scss';
import { authService, getAuthErrorMessage } from '@/api/services/auth.service';
import { ROUTES } from '@/constants/constants';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_EMAIL = 'support@techspear.in';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      setDoneMessage(await authService.forgotPassword(email.trim()));
    } catch (err: any) {
      setError(getAuthErrorMessage(err, `Something went wrong. Please try again, or contact ${SUPPORT_EMAIL}.`));
      setIsSubmitting(false);
    }
  };

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
                <h1 className="auth-title">Check your email</h1>
                <p className="auth-subtitle">{doneMessage}</p>
              </div>
              <p className="auth-hint" style={{ textAlign: 'center', marginBottom: 16 }}>
                Nothing arrived after a few minutes? Check your spam folder, or contact{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
              <Link to={ROUTES.LOGIN} className="auth-submit-btn auth-submit-link">
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <div className="auth-title-block">
                <h1 className="auth-title">Forgot password</h1>
                <p className="auth-subtitle">Enter your email and we will send you a link to set a new password.</p>
              </div>

              <form className="auth-form auth-form-spaced" onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="fp-email">Email</label>
                  <input id="fp-email" className="auth-input" type="email" autoComplete="email"
                    placeholder="you@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="auth-form-error" role="alert" aria-live="polite">
                  {error}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? <div className="auth-ms-btn-spinner" /> : 'Send reset link'}
                </button>
              </form>

              <p className="auth-switch">
                Remembered it? <Link to={ROUTES.LOGIN}>Sign in</Link>
              </p>
              <p className="auth-hint" style={{ textAlign: 'center', marginTop: 8 }}>
                Signed in with Microsoft? Reset your password through Microsoft instead.
              </p>
            </>
          )}
        </div>

        <p className="auth-footer">Techspear © 2026 · All Rights Reserved</p>
      </div>
    </div>
  );
}
