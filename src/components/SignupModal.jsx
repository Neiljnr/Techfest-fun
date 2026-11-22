import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, MailCheck, Search, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SignupModal = () => {
  const { sendLoginCode, verifyLoginCode, lookupRegistration, loginAttendee, showToast } = useApp();
  const [step, setStep] = useState('lookup');
  const [identifier, setIdentifier] = useState('');
  const [registration, setRegistration] = useState(null);
  const [matches, setMatches] = useState([]);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const findRegistration = async (event) => {
    event.preventDefault();
    setBusy(true);
    const result = await lookupRegistration(identifier.trim());
    if (result?.found) {
      setRegistration({ ...result, role: mapAttendeeTypeToRole(result.attendee_type) });
      setStep('confirm');
    } else if (result?.matches?.length) {
      setMatches(result.matches);
      setStep('select');
    } else if (result) {
      showToast('No registration found', 'Check the spelling or try the email used to register.', 'warning');
    }
    setBusy(false);
  };

  const chooseRegistration = (item) => {
    setRegistration({ ...item, role: mapAttendeeTypeToRole(item.attendee_type) });
    setStep('confirm');
  };

  const enterGame = async () => {
    setBusy(true);
    await loginAttendee(registration);
    setBusy(false);
  };

  const requestAdminCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    const sent = await sendLoginCode({ email, createAccount: false });
    if (sent) setStep('verification');
    setBusy(false);
  };

  const verifyAdminCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    await verifyLoginCode(email, code);
    setBusy(false);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-title">
      <div className="modal-sheet" style={{ maxHeight: '90vh', background: '#090D0B' }}>
        <div className="modal-header">
          <div className="modal-title-box">
            {step === 'verification' || step === 'admin' ? <MailCheck size={20} color="var(--green-primary)" /> : <Search size={20} color="var(--green-primary)" />}
            <h3 className="modal-title" id="signup-title">
              {step === 'confirm' ? 'Confirm your registration' : step === 'select' ? 'Choose your registration' : step === 'admin' ? 'Organizer sign in' : step === 'verification' ? 'Verify organizer email' : 'Join TechFest Quest'}
            </h3>
          </div>
        </div>

        {step === 'lookup' && <form onSubmit={findRegistration} className="modal-body" style={{ gap: 16 }}>
          <p style={copyStyle}>Enter the <strong>name or email</strong> you used to register. We’ll show your registration details for you to confirm.</p>
          <label style={labelStyle}>Your name or email
            <input autoComplete="email" required maxLength={254} value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Name or email" style={inputStyle} autoFocus />
          </label>
          <button type="submit" className="pill-btn-action pill-btn-primary" disabled={busy}><Search size={16} /><span>{busy ? 'Searching…' : 'Find my registration'}</span></button>
          <div style={dividerStyle}><span style={dividerTextStyle}>For event organizers</span></div>
          <button type="button" className="pill-btn-action pill-btn-secondary" onClick={() => setStep('admin')}><UserCheck size={16} /><span>Organizer sign in</span></button>
        </form>}

        {step === 'select' && <div className="modal-body" style={{ gap: 12 }}>
          <p style={copyStyle}>More than one person has that name. Choose the registration that is yours.</p>
          {matches.map(item => <button key={item.email} type="button" className="pill-btn-action pill-btn-secondary" onClick={() => chooseRegistration(item)} style={{ display: 'block', textAlign: 'left', height: 'auto', padding: 14 }}>
            <strong>{item.full_name}</strong><br /><span>{item.email}</span>{item.organization ? <><br /><span>{item.organization}</span></> : null}
          </button>)}
          <button type="button" className="pill-btn-action pill-btn-secondary" onClick={() => setStep('lookup')}><ArrowLeft size={16} />Back</button>
        </div>}

        {step === 'confirm' && registration && <div className="modal-body" style={{ gap: 16 }}>
          <p style={copyStyle}>Check these details. If they match your TechFest registration, continue into the game.</p>
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}><CheckCircle2 size={19} color="#00E676" /><strong style={{ color: '#00E676' }}>Registration found</strong></div>
            <Detail label="Name" value={registration.full_name} />
            <Detail label="Email" value={registration.email} />
            <Detail label="Registration" value={registration.attendee_type || registration.registration_type || 'Attendee'} />
            {registration.organization && <Detail label="Organization" value={registration.organization} />}
          </div>
          <button type="button" className="pill-btn-action pill-btn-primary" disabled={busy} onClick={enterGame}><CheckCircle2 size={16} /><span>{busy ? 'Starting your game…' : 'That’s me — enter the game'}</span></button>
          <button type="button" className="pill-btn-action pill-btn-secondary" disabled={busy} onClick={() => { setRegistration(null); setStep('lookup'); }}><ArrowLeft size={16} />That’s not me</button>
        </div>}

        {step === 'admin' && <form onSubmit={requestAdminCode} className="modal-body" style={{ gap: 16 }}>
          <p style={copyStyle}>A one-time code will be sent to your organizer email. Staff permissions are checked by Quest after sign in.</p>
          <label style={labelStyle}>Organizer email
            <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="organizer@example.com" style={inputStyle} />
          </label>
          <button type="submit" className="pill-btn-action pill-btn-primary" disabled={busy}><MailCheck size={16} />{busy ? 'Sending…' : 'Email me a sign-in code'}</button>
          <button type="button" className="pill-btn-action pill-btn-secondary" onClick={() => setStep('lookup')}><ArrowLeft size={16} />Back</button>
        </form>}

        {step === 'verification' && <form onSubmit={verifyAdminCode} className="modal-body" style={{ gap: 16 }}>
          <p style={copyStyle}>Enter the six-digit code sent to <strong>{email}</strong>.</p>
          <label style={labelStyle}>Verification code
            <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" style={inputStyle} />
          </label>
          <button type="submit" className="pill-btn-action pill-btn-primary" disabled={busy}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
          <button type="button" className="pill-btn-action pill-btn-secondary" onClick={() => setStep('admin')}>Change email or resend code</button>
        </form>}
      </div>
    </div>
  );
};

const mapAttendeeTypeToRole = (attendeeType = '') => {
  const type = attendeeType.toLowerCase();
  if (type.includes('founder') || type.includes('business')) return 'founder';
  if (type.includes('designer') || type.includes('product')) return 'designer';
  if (type.includes('student')) return 'student';
  return 'builder';
};
const Detail = ({ label, value }) => <div style={{ marginTop: 7 }}><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{label}</span><div style={{ color: '#E6EDE9', fontWeight: 600, overflowWrap: 'anywhere' }}>{value}</div></div>;
const copyStyle = { color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, margin: 0 };
const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text-light)' };
const inputStyle = { display: 'block', width: '100%', marginTop: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '10px 12px', color: '#FFF', fontSize: 14 };
const cardStyle = { background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.22)', borderRadius: 12, padding: 14 };
const dividerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' };
const dividerTextStyle = { fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' };
