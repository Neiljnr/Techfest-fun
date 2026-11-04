import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  QrCode, 
  UserCheck, 
  Clock, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Users,
  Briefcase
} from 'lucide-react';
import QRCode from 'qrcode';

export const PlugScreen = () => {
  const { 
    user, 
    connections, 
    pendingHandshakes, 
    confirmHandshake, 
    addPoints,
    showToast,
    startSignup
  } = useApp();

  const [qrUrl, setQrUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [roundtableCheckedIn, setRoundtableCheckedIn] = useState(false);

  // Generate attendee's own QR code
  useEffect(() => {
    let isCancelled = false;
    setQrUrl('');
    setQrError('');

    const qrToken = user.qrToken || `JTF26-ATT-${user.id}`;
    const inviteUrl = new URL(window.location.pathname, window.location.origin);
    inviteUrl.searchParams.set('register', 'true');
    inviteUrl.searchParams.set('join', JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role,
      avatarId: user.avatarId,
      qrToken
    }));

    QRCode.toDataURL(inviteUrl.toString(), {
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

  const handleRoundtableCheckin = () => {
    if (roundtableCheckedIn) return;
    setRoundtableCheckedIn(true);
    addPoints(
      'day2-roundtable-1',
      'Day 2 Founder Roundtable Check-In',
      20,
      2,
      'Executive roundtable networking check-in'
    );
    showToast('Roundtable Verified!', '+20 pts awarded for Day 2 Founder session.', 'success');
  };

  return (
    <div className="main-content">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Plug: Networking & QR</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          "Humans in the loop." Show your QR to connect or confirm incoming handshakes.
        </p>
      </div>

      {/* 1. Pending Two-Sided Handshake Prompts (PRD P2) */}
      {pendingHandshakes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00E676',
              boxShadow: '0 0 8px #00E676'
            }} />
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--green-primary)', textTransform: 'uppercase' }}>
              Incoming Connection Requests (Confirm within 2 mins)
            </h4>
          </div>

          {pendingHandshakes.map(hs => (
            <div
              key={hs.id}
              className="quest-card"
              style={{
                border: '1.5px solid var(--green-primary)',
                background: 'rgba(0, 230, 118, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800' }}>
                    {hs.name} scanned your QR!
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Role: {hs.role.toUpperCase()} {hs.role !== user.role && '· 🌟 Cross-role bonus eligible!'}
                  </span>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: 'var(--green-primary)',
                  background: 'rgba(0, 230, 118, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  +{hs.points} PTS
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="pill-btn-action pill-btn-primary"
                  style={{ flex: 1, padding: '8px' }}
                  onClick={() => confirmHandshake(hs.id)}
                >
                  <Check size={16} strokeWidth={3} />
                  <span>Confirm Connection (+{hs.points} pts)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. My QR Code Card (High Contrast) */}
      <div className="quest-card" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '10px',
        borderColor: 'rgba(0, 230, 118, 0.3)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800' }}>New to TechFest Quest?</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Scan a signed-up operator’s badge to create your demo account and connect automatically.
        </p>
        <button className="pill-btn-action pill-btn-secondary" onClick={startSignup}>
          <QrCode size={16} />
          <span>Join with a QR invite</span>
        </button>
      </div>

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
          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>My Operator Badge QR</h3>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '320px' }}>
          Present this code to another builder or partner booth to plug into the network.
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
            Preparing your QR…
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

      {/* 3. Day 2: Founder Track Roundtable Check-in (Section 6) */}
      <div 
        className="quest-card"
        style={{
          background: 'rgba(0, 176, 255, 0.06)',
          border: '1px solid rgba(0, 176, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} color="#00B0FF" />
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#FFF' }}>
              Day 2: Founder Roundtable
            </h4>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#00B0FF',
            background: 'rgba(0, 176, 255, 0.15)',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            +20 PTS
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
          Exclusive executive track for CEOs, CTOs and founders at Sarau VIP lounge.
        </p>

        {roundtableCheckedIn ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            color: '#00B0FF',
            fontWeight: '700'
          }}>
            <Check size={16} strokeWidth={3} />
            Checked in to Day 2 Roundtable
          </div>
        ) : (
          <button
            className="pill-btn-action pill-btn-primary"
            style={{ fontSize: '13px' }}
            onClick={handleRoundtableCheckin}
          >
            Check In to Founder Roundtable
          </button>
        )}
      </div>

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
            No connections yet. Scan an attendee QR in Sarau Hall to start plugging in!
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
                  {conn.role.toUpperCase()} · Confirmed at {conn.confirmedAt}
                  {conn.isDifferentRole && ' · 🌟 Cross-role Bonus'}
                </div>
              </div>

              <span style={{
                fontSize: '13px',
                fontWeight: '800',
                color: 'var(--green-primary)'
              }}>
                +{conn.pointsAwarded} PTS
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
