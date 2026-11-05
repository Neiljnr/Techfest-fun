import React, { useState } from 'react';
import { QrCode, UserPlus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/avatars';

export const SignupModal = () => {
  const { signupInvite, completeSignup, cancelSignup } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('builder');

  const handleSubmit = (event) => {
    event.preventDefault();
    completeSignup({ name, email, role });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-title">
      <div className="modal-sheet" style={{ maxHeight: '90vh', background: '#090D0B' }}>
        <div className="modal-header">
          <div className="modal-title-box">
            <UserPlus size={20} color="var(--green-primary)" />
            <h3 className="modal-title" id="signup-title">Create your demo profile</h3>
          </div>
          <button className="modal-close-btn" onClick={cancelSignup} aria-label="Close signup">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ gap: '16px' }}>
          {signupInvite ? (
            <div className="quest-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <QrCode size={20} color="var(--green-primary)" />
              <div>
                <strong style={{ display: 'block' }}>Invited by {signupInvite.name}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Your demo profiles will be linked in this browser.
                </span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              This is a local demo profile. A Gmail address format is required, but ownership is not verified.
            </p>
          )}

          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)' }}>
            Your name
            <input
              autoComplete="name"
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Keziah Pam"
              style={inputStyle}
            />
          </label>

          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)' }}>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={120}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </label>

          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)' }}>
            Your role
            <select value={role} onChange={(event) => setRole(event.target.value)} style={inputStyle}>
              {ROLES.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </label>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Your profile and scores are stored only in this browser. Do not use this prototype for official event scoring.
          </p>

          <button
            type="submit"
            className="pill-btn-action pill-btn-primary"
          >
            <UserPlus size={16} />
            <span>Create account & connect</span>
          </button>
        </form>
      </div>
    </div>
  );
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
