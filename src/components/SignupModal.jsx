import React, { useState } from 'react';
import { MailCheck, UserPlus, Eye, EyeOff, Search, CheckCircle2, UserCheck, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES, AVATARS } from '../data/avatars';

export const SignupModal = () => {
  const {
    sendLoginCode, verifyLoginCode, signInWithPassword, signUpWithPassword,
    lookupRegistration, showToast
  } = useApp();

  // Steps: 'lookup' → 'found' → password creation | 'signin' | 'verification'
  const [step, setStep] = useState('lookup');
  const [identifier, setIdentifier] = useState('');
  const [registrationData, setRegistrationData] = useState(null);

  // Profile setup fields (editable by user after lookup)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('builder');
  const [avatarId, setAvatarId] = useState('av-1');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map attendee_type to a default role
  const mapAttendeeTypeToRole = (attendeeType) => {
    if (!attendeeType) return 'builder';
    const lower = attendeeType.toLowerCase();
    if (lower.includes('developer') || lower.includes('engineer')) return 'builder';
    if (lower.includes('founder') || lower.includes('business')) return 'founder';
    if (lower.includes('designer') || lower.includes('product')) return 'designer';
    if (lower.includes('student')) return 'student';
    return 'builder';
  };

  // Step 1: Look up the user in Techfest registrations
  const handleLookup = async (event) => {
    event.preventDefault();
    const query = identifier.trim();
    if (!query) {
      showToast('Enter your details', 'Type your name or email used during Techfest registration.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await lookupRegistration(query);
      if (result?.found) {
        setRegistrationData(result);
        setName(result.full_name || query);
        setEmail(result.email || '');
        setRole(mapAttendeeTypeToRole(result.attendee_type));
        setStep('found');
      } else {
        showToast(
          'Not found',
          'No Techfest registration matches that name or email. Please register at the Techfest site first, or sign in if you already have a quest account.',
          'warning'
        );
      }
    } catch (error) {
      showToast('Lookup failed', error?.message || 'Could not search registrations. Please try again.', 'error');
    }
    setIsSubmitting(false);
  };

  // Step 2: Create account with pre-filled data
  const handleCreateAccount = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      showToast('Email required', 'Enter your email address to create your account.', 'warning');
      return;
    }
    setIsSubmitting(true);
    await signUpWithPassword({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      registrationEmail: registrationData?.email || email.trim(),
      attendeeType: registrationData?.attendee_type,
      organization: registrationData?.organization
    });
    setIsSubmitting(false);
  };

  // Sign in flow
  const handleSignIn = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    await signInWithPassword({ email, password });
    setIsSubmitting(false);
  };

  // OTP flow
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

  // ── Step: Lookup ──────────────────────────────────────────────
  if (step === 'lookup') {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-title">
        <div className="modal-sheet" style={{ maxHeight: '90vh', background: '#090D0B' }}>
          <div className="modal-header">
            <div className="modal-title-box">
              <Search size={20} color="var(--green-primary)" />
              <h3 className="modal-title" id="signup-title">Join TechFest Quest</h3>
            </div>
          </div>
          <form onSubmit={handleLookup} className="modal-body" style={{ gap: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              Enter the <strong>name</strong> or <strong>email</strong> you used to register for TechFest.
              We'll find your registration and set up your quest account automatically.
            </p>
            <label style={labelStyle}>
              Your name or email
              <input
                autoComplete="email" required maxLength={120} value={identifier}
                onChange={event => setIdentifier(event.target.value)}
                placeholder="e.g. john@example.com or John Doe"
                style={inputStyle}
                autoFocus
              />
            </label>
            <button type="submit" className="pill-btn-action pill-btn-primary" disabled={isSubmitting}>
              <Search size={16} />
              <span>{isSubmitting ? 'Searching…' : 'Find my registration'}</span>
            </button>

            <div style={dividerStyle}>
              <span style={dividerTextStyle}>Already have a quest account?</span>
            </div>

            <button type="button" className="pill-btn-action pill-btn-secondary"
              onClick={() => setStep('signin')}>
              <UserCheck size={16} />
              <span>Sign in to existing account</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Step: Found — Welcome + profile setup ─────────────────────
  if (step === 'found') {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-title">
        <div className="modal-sheet" style={{ maxHeight: '90vh', background: '#090D0B' }}>
          <div className="modal-header">
            <div className="modal-title-box">
              <CheckCircle2 size={20} color="var(--green-primary)" />
              <h3 className="modal-title" id="signup-title">Welcome, {registrationData?.full_name}!</h3>
            </div>
          </div>
          <form onSubmit={handleCreateAccount} className="modal-body" style={{ gap: '14px' }}>
            {/* Registration confirmation badge */}
            <div style={{
              background: 'rgba(0, 230, 118, 0.08)',
              border: '1px solid rgba(0, 230, 118, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle2 size={18} color="#00E676" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#00E676' }}>
                  Techfest Registration Found
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {registrationData?.attendee_type || 'Attendee'}
                  {registrationData?.organization ? ` · ${registrationData.organization}` : ''}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: 1.4 }}>
              Set up your quest profile below. You can change your display name and avatar anytime.
            </p>

            {/* Display name (pre-filled, editable) */}
            <label style={labelStyle}>
              Display name
              <input autoComplete="name" required maxLength={60} value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Your display name" style={inputStyle} />
            </label>

            {/* Email (pre-filled from registration) */}
            <label style={labelStyle}>
              Email
              <input type="email" autoComplete="email" required maxLength={120} value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@example.com" style={inputStyle} />
            </label>

            {/* Password */}
            <label style={labelStyle}>
              Create a password
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={128}
                  value={password} autoComplete="new-password"
                  onChange={event => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPassword(value => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword} className="password-toggle">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {/* Role picker */}
            <div style={labelStyle}>
              I am a…
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

            {/* Avatar picker */}
            <div style={labelStyle}>
              Choose your avatar
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px', padding: '6px 0', marginTop: '6px'
              }}>
                {AVATARS.map(av => {
                  const isSelected = avatarId === av.id;
                  return (
                    <button type="button" key={av.id} aria-label={`Choose ${av.name}`}
                      aria-pressed={isSelected} onClick={() => setAvatarId(av.id)}
                      style={{
                        width: '44px', height: '44px', padding: 0, borderRadius: '50%',
                        border: isSelected ? '2.5px solid var(--green-primary)' : '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', overflow: 'hidden', cursor: 'pointer',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: isSelected ? '0 0 12px var(--green-glow)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                      dangerouslySetInnerHTML={{ __html: av.svg }}
                    />
                  );
                })}
              </div>
            </div>

            <button type="submit" className="pill-btn-action pill-btn-primary" disabled={isSubmitting}>
              <UserPlus size={16} />
              <span>{isSubmitting ? 'Creating account…' : 'Create my quest account'}</span>
            </button>

            <button type="button" className="pill-btn-action pill-btn-secondary"
              onClick={() => { setStep('lookup'); setRegistrationData(null); }}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Step: Sign in (returning users) ───────────────────────────
  if (step === 'signin') {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-title">
        <div className="modal-sheet" style={{ maxHeight: '90vh', background: '#090D0B' }}>
          <div className="modal-header">
            <div className="modal-title-box">
              <UserCheck size={20} color="var(--green-primary)" />
              <h3 className="modal-title" id="signup-title">Sign in</h3>
            </div>
          </div>
          <form onSubmit={handleSignIn} className="modal-body" style={{ gap: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Sign in to your existing TechFest Quest account.
            </p>
            <label style={labelStyle}>
              Email
              <input type="email" autoComplete="email" required maxLength={120} value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@example.com" style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Password
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={128}
                  value={password} autoComplete="current-password"
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Your password"
                  style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPassword(value => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword} className="password-toggle">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <button type="submit" className="pill-btn-action pill-btn-primary" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
            </button>
            <button type="button" className="pill-btn-action pill-btn-secondary"
              disabled={isSubmitting} onClick={handleSendCode}>
              <MailCheck size={16} />
              <span>Email me a sign-in code instead</span>
            </button>

            <div style={dividerStyle}>
              <span style={dividerTextStyle}>Don't have a quest account yet?</span>
            </div>

            <button type="button" className="pill-btn-action pill-btn-secondary"
              onClick={() => setStep('lookup')}>
              <ArrowLeft size={16} />
              <span>Find my Techfest registration</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Step: Verification (OTP) ──────────────────────────────────
  if (step === 'verification') {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-title">
        <div className="modal-sheet" style={{ maxHeight: '90vh', background: '#090D0B' }}>
          <div className="modal-header">
            <div className="modal-title-box">
              <MailCheck size={20} color="var(--green-primary)" />
              <h3 className="modal-title" id="signup-title">Verify your email</h3>
            </div>
          </div>
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
            <button type="button" className="pill-btn-action pill-btn-secondary"
              onClick={() => setStep('signin')}>
              Change email or resend code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
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

const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  margin: '4px 0'
};

const dividerTextStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap'
};
