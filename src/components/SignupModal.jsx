import React, { useState } from 'react';
import { MailCheck, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/avatars';

export const SignupModal = () => {
  const { sendLoginCode, verifyLoginCode, signInWithPassword, signUpWithPassword, showToast } = useApp();
  const [createAccount, setCreateAccount] = useState(true);
  const [step, setStep] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('builder');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    if (createAccount) await signUpWithPassword({ name, email, password, role });
    else await signInWithPassword({ email, password });
    setIsSubmitting(false);
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      showToast('Email required', 'Enter your email first, then request a code.', 'warning');
      return;
    }
    setIsSubmitting(true);
    const sent = await sendLoginCode({ name, email, role, createAccount: false });
    setIsSubmitting(false);
    if (sent) setStep('verification');
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      showToast('Invalid code', 'Enter the six-digit verification code from your email.', 'warning');
      return;
    }
    setIsSubmitting(true);
    await verifyLoginCode(email, code);
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-title">
      <div className="modal-sheet" style={{ maxHeight: '90vh', background: '#090D0B' }}>
        <div className="modal-header">
          <div className="modal-title-box">
            {step === 'verification'
              ? <MailCheck size={20} color="var(--green-primary)" />
              : <UserPlus size={20} color="var(--green-primary)" />}
            <h3 className="modal-title" id="signup-title">
              {step === 'verification' ? 'Verify your email' : createAccount ? 'Create your account' : 'Sign in'}
            </h3>
          </div>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSubmit} className="modal-body" style={{ gap: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Create an account with your email and a password, or sign in. Scores and event activity are stored on the event server.
            </p>
            {createAccount && (
              <>
                <label style={labelStyle}>
                  Your name
                  <input autoComplete="name" required maxLength={60} value={name}
                    onChange={event => setName(event.target.value)} placeholder="Your full name" style={inputStyle} />
                </label>
                <label style={labelStyle}>
                  Your role
                  <select value={role} onChange={event => setRole(event.target.value)} style={inputStyle}>
                    {ROLES.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                </label>
              </>
            )}
            <label style={labelStyle}>
              Email
              <input type="email" autoComplete="email" required maxLength={120} value={email}
                onChange={event => setEmail(event.target.value)} placeholder="you@example.com" style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Password
              <input type="password" required minLength={8} maxLength={128} value={password}
                autoComplete={createAccount ? 'new-password' : 'current-password'}
                onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" style={inputStyle} />
            </label>
            <button type="submit" className="pill-btn-action pill-btn-primary" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Please wait…' : createAccount ? 'Create account' : 'Sign in'}</span>
            </button>
            <button type="button" className="pill-btn-action pill-btn-secondary"
              onClick={() => setCreateAccount(value => !value)}>
              {createAccount ? 'Already registered? Sign in' : 'New attendee? Create an account'}
            </button>
            {!createAccount && (
              <button type="button" className="pill-btn-action pill-btn-secondary" disabled={isSubmitting}
                onClick={handleSendCode}>
                <MailCheck size={16} />
                <span>Email me a sign-in code instead</span>
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="modal-body" style={{ gap: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Enter the six-digit code sent to <strong>{email}</strong>.
            </p>
            <label style={labelStyle}>
              Verification code
              <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required
                maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))}
                placeholder="000000" style={inputStyle} />
            </label>
            <button type="submit" className="pill-btn-action pill-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying…' : 'Verify and continue'}
            </button>
            <button type="button" className="pill-btn-action pill-btn-secondary" onClick={() => setStep('email')}>
              Change email or resend code
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--text-light)'
};

const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: '6px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '10px',
  padding: '10px 12px',
  color: '#FFF',
  fontSize: '14px'
};
