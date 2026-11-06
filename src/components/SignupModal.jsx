import React, { useState } from 'react';
import { MailCheck, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/avatars';

export const SignupModal = () => {
  const { sendLoginCode, verifyLoginCode, signInWithPassword, signUpWithPassword, showToast } = useApp();
  const [createAccount, setCreateAccount] = useState(true);
  const [step, setStep] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
                <div style={labelStyle}>
                  I am aâ€¦
                  <div role="radiogroup" aria-label="Your role" className="role-picker">
                    {ROLES.map(option => {
                      const selected = role === option.id;
                      return (
                        <button key={option.id} type="button" role="radio" aria-checked={selected}
                          onClick={() => setRole(option.id)} className="role-option"
                          style={{
                            '--role-color': option.color,
                            borderColor: selected ? option.color : 'var(--border-subtle)',
                            background: selected ? `${option.color}24` : 'rgba(255,255,255,0.04)',
                            color: selected ? option.color : '#E6EDE9'
                          }}>
                          <span className="role-option-name">{option.name}</span>
                          <span className="role-option-tag">{option.badge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            <label style={labelStyle}>
              Email
              <input type="email" autoComplete="email" required maxLength={120} value={email}
                onChange={event => setEmail(event.target.value)} placeholder="you@example.com" style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Password
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={128} value={password}
                  autoComplete={createAccount ? 'new-password' : 'current-password'}
                  onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters"
                  style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPassword(value => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
                  className="password-toggle">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <button type="submit" className="pill-btn-action pill-btn-primary" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Please waitâ€¦' : createAccount ? 'Create account' : 'Sign in'}</span>
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
              {isSubmitting ? 'Verifyingâ€¦' : 'Verify and continue'}
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
