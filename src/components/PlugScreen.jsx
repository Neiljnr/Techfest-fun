import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserCheck, 
  Clock, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Users
} from 'lucide-react';
import QRCode from 'qrcode';
import { SocialLinks } from './SocialLinks';
import { cleanSocialLinks, normalizeSocialUrl, SOCIAL_PLATFORMS } from '../utils/socialLinks';

export const PlugScreen = () => {
  const { 
    user, 
    connections, 
    updateProfile
  } = useApp();

  const [qrUrl, setQrUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [socialValues, setSocialValues] = useState({
    x: user.socialLinks?.x || '',
    facebook: user.socialLinks?.facebook || '',
    linkedin: user.socialLinks?.linkedin || ''
  });
  const [socialError, setSocialError] = useState('');
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  useEffect(() => {
    setSocialValues({
      x: user.socialLinks?.x || '',
      facebook: user.socialLinks?.facebook || '',
      linkedin: user.socialLinks?.linkedin || ''
    });
  }, [user.socialLinks]);

  const saveSocialLinks = async (event) => {
    event.preventDefault();
    const invalid = SOCIAL_PLATFORMS.find(({ key }) => socialValues[key].trim() && !normalizeSocialUrl(key, socialValues[key]));
    if (invalid) {
      setSocialError(`Enter a valid ${invalid.label} profile URL.`);
      return;
    }
    setSocialError('');
    setIsSavingSocial(true);
    try {
      await updateProfile({ socialLinks: cleanSocialLinks(socialValues) });
    } finally {
      setIsSavingSocial(false);
    }
  };

  // Generate attendee's own QR code
  useEffect(() => {
    let isCancelled = false;
    setQrUrl('');
    setQrError('');

    QRCode.toDataURL(`JTF26-ATT-${user.qrToken}`, {
        width: 320,
        margin: 4,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        if (!isCancelled) setQrUrl(url);
      }).catch(error => {
        if (!isCancelled) {
          setQrError(error.message || 'The operator QR could not be generated.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user.id, user.name, user.role, user.avatarId, user.qrToken]);

  return (
    <div className="main-content">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Connect with people</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Show your QR or scan someone else's. You connect instantly and both earn points.
        </p>
      </div>

      {/* Attendee badge */}
      <div 
        className="quest-card" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          padding: '24px 16px',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--green-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>My Badge QR</h3>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '320px' }}>
          Show this code to another attendee or partner to connect and earn points together.
        </p>

        {/* High contrast QR box */}
        {qrUrl ? (
          <div style={{
            padding: '10px',
            background: '#FFFFFF',
            border: '2px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 0 24px rgba(0, 230, 118, 0.2)'
          }}>
            <img 
              src={qrUrl} 
              alt="My Badge QR" 
              style={{ width: '240px', height: '240px', display: 'block', imageRendering: 'pixelated' }} 
            />
          </div>
        ) : qrError ? (
          <p role="alert" style={{ color: '#FF8A80', fontSize: '12px' }}>{qrError}</p>
        ) : (
          <div role="status" style={{ width: '240px', height: '240px', background: '#FFF', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#111', fontSize: '12px' }}>
            Preparing your QRâ€¦
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '800' }}>
            {user.name} ({user.role.toUpperCase()})
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
            {user.qrToken}
          </span>
        </div>
      </div>

      <form className="quest-card social-edit-card" onSubmit={saveSocialLinks}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Add social profiles (optional)</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Share the profiles you want other attendees to see in Connect and People.
          </p>
        </div>
        {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
          <label className="social-input-row" key={key}>
            <span className="social-input-label">{label}</span>
            <input
              className="social-input"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder={placeholder}
              value={socialValues[key]}
              onChange={event => setSocialValues(values => ({ ...values, [key]: event.target.value }))}
              aria-label={`${label} profile URL`}
            />
          </label>
        ))}
        {socialError && <p role="alert" style={{ color: '#FFB16B', fontSize: '12px' }}>{socialError}</p>}
        <button className="pill-btn-action pill-btn-primary" type="submit" disabled={isSavingSocial}>
          {isSavingSocial ? 'Saving…' : 'Save social links'}
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Leave a field blank to keep that profile private.</p>
      </form>

      {/* 4. Confirmed Connections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800' }}>
          Confirmed Connections ({connections.length})
        </h4>

        {connections.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: 'var(--text-muted)',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            fontSize: '13px'
          }}>
            No connections yet. Scan an attendee QR in Sarau Hall to connect!
          </div>
        ) : (
          connections.map(conn => (
            <div
              key={conn.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px 14px'
              }}
            >
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFF' }}>
                  {conn.name}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {conn.role.toUpperCase()} Â· Confirmed at {conn.confirmedAt}
                  {conn.role !== user.role && ' Â· Cross-role'}
                </div>
                <SocialLinks links={conn.socialLinks} name={conn.name} />
              </div>

              <span style={{
                fontSize: '13px',
                fontWeight: '800',
                color: 'var(--green-primary)'
              }}>
                Connected
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
