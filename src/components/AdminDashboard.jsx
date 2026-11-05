import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PARTNERS } from '../data/partners';
import { SESSIONS } from '../data/sessions';
import QRCode from 'qrcode';
import { 
  Shield, 
  Flame, 
  RotateCcw, 
  Users, 
  QrCode, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft,
  PlusCircle,
  Trophy,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    adminLedger,
    reverseLedgerEntry, 
    staffEventCodes,
    createEventCode,
    leaderboard,
    setCurrentTab,
    showToast
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview', 'drops', 'ledger', 'finale'
  const [dropTitle, setDropTitle] = useState('');
  const [dropPoints, setDropPoints] = useState(20);
  const [dropHint, setDropHint] = useState('');
  const [eventKind, setEventKind] = useState('signal');
  const [eventId, setEventId] = useState('');
  const [eventStage, setEventStage] = useState(2);
  const [claimLimit, setClaimLimit] = useState(50);
  const [expirationMinutes, setExpirationMinutes] = useState(10);
  const [createdCode, setCreatedCode] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversingEntryId, setReversingEntryId] = useState(null);

  const handleCreateDrop = async (e) => {
    e.preventDefault();
    if (!dropTitle.trim()) return;

    const result = await createEventCode({
      kind: eventKind,
      eventId: eventId.trim() || `${eventKind}-${crypto.randomUUID()}`,
      title: dropTitle.trim(),
      points: parseInt(dropPoints, 10) || 20,
      stage: Number(eventStage),
      description: dropHint.trim(),
      hint: dropHint.trim(),
      claimLimit: claimLimit ? Number(claimLimit) : null,
      expirationMinutes: Number(expirationMinutes)
    });
    if (!result) return;
    setCreatedCode(result);
    setDropTitle('');
    setDropHint('');
    setEventId('');
  };

  const handleConfirmReversal = (id) => {
    if (!reversalReason.trim()) {
      showToast('Reason Required', 'Audit log requires a documented reason for reversing points.', 'warning');
      return;
    }
    reverseLedgerEntry(id, reversalReason.trim());
    setReversingEntryId(null);
    setReversalReason('');
  };

  const publicPoints = leaderboard.reduce((sum, attendee) => sum + attendee.points, 0);
  const activeCodeCount = staffEventCodes.filter(code => (
    code.active && new Date(code.expires_at).getTime() > Date.now()
  )).length;

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentTab('home')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#FFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Organizer Admin Console</h2>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Jos TechFest 2026 Operations & Dispute Desk
            </p>
          </div>
        </div>

        <span style={{
          background: 'rgba(0, 230, 118, 0.15)',
          color: 'var(--green-primary)',
          fontSize: '11px',
          fontWeight: '800',
          padding: '4px 8px',
          borderRadius: '6px'
        }}>
          ROLE: STAFF ADMIN
        </span>
      </div>

      {/* Nav Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '4px',
        borderRadius: '10px'
      }}>
        {['overview', 'drops', 'ledger', 'finale'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveAdminTab(tab)}
            style={{
              padding: '6px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              cursor: 'pointer',
              background: activeAdminTab === tab ? 'var(--green-primary)' : 'transparent',
              color: activeAdminTab === tab ? '#000' : 'var(--text-muted)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeAdminTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Real-time Event Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            <div className="quest-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Public leaderboard accounts
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#00E676', fontFamily: 'var(--font-heading)' }}>
                {leaderboard.length}
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Live Supabase directory</span>
            </div>

            <div className="quest-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active event QR codes
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#00B0FF', fontFamily: 'var(--font-heading)' }}>
                {activeCodeCount}
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Organizer-issued and expiring</span>
            </div>

            <div className="quest-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Public leaderboard points
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFD700', fontFamily: 'var(--font-heading)' }}>
                {publicPoints.toLocaleString()}
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Computed from server ledger</span>
            </div>

            <div className="quest-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ledger rows available
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFF', fontFamily: 'var(--font-heading)' }}>
                {adminLedger.length}
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--green-primary)' }}>Latest 200 entries</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quest-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '700' }}>Quick Staff Operations</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                className="pill-btn-action pill-btn-primary"
                style={{ fontSize: '12px', padding: '8px' }}
                onClick={() => setActiveAdminTab('drops')}
              >
                <Flame size={14} />
                <span>Broadcast Drop</span>
              </button>

              <button
                className="pill-btn-action pill-btn-secondary"
                style={{ fontSize: '12px', padding: '8px' }}
                onClick={() => setCurrentTab('venue')}
              >
                <QrCode size={14} />
                <span>Projector View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIGNAL DROPS TAB */}
      {activeAdminTab === 'drops' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form 
            onSubmit={handleCreateDrop}
            className="quest-card"
            style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#FFD700' }}>
              Create an event QR
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Issue a random, server-generated QR for a partner, session, or limited-use event. Codes expire automatically.
            </p>

            <label style={fieldLabelStyle}>
              Event type
              <select value={eventKind} onChange={(e) => {
                const kind = e.target.value;
                setEventKind(kind);
                setEventStage(kind === 'partner' ? 4 : kind === 'session' ? 2 : 2);
              }} style={fieldStyle}>
                <option value="signal">Signal drop</option>
                <option value="partner">Partner booth</option>
                <option value="session">Session</option>
                <option value="roundtable">Roundtable check-in</option>
              </select>
            </label>

            {eventKind === 'partner' && (
              <select value={eventId} onChange={e => setEventId(e.target.value)} style={fieldStyle} required>
                <option value="">Select a partner</option>
                {PARTNERS.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
              </select>
            )}
            {eventKind === 'session' && (
              <select value={eventId} onChange={e => setEventId(e.target.value)} style={fieldStyle}>
                <option value="">Select a session</option>
                {SESSIONS.map(session => <option key={session.id} value={session.id}>{session.title}</option>)}
              </select>
            )}
            {(eventKind === 'signal' || eventKind === 'roundtable') && (
              <input
                type="text"
                placeholder="Event ID (leave blank to generate one)"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                style={fieldStyle}
              />
            )}

            <input
              type="text"
              placeholder="Event title"
              value={dropTitle}
              onChange={(e) => setDropTitle(e.target.value)}
              required
              maxLength={100}
              style={fieldStyle}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Points (1-50)"
                min="1"
                max="50"
                value={dropPoints}
                onChange={(e) => setDropPoints(e.target.value)}
                required
                style={{ ...fieldStyle, width: '120px' }}
              />
              <input
                type="text"
                placeholder="Description / location hint"
                value={dropHint}
                onChange={(e) => setDropHint(e.target.value)}
                maxLength={160}
                style={{ ...fieldStyle, flex: 1 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={fieldLabelStyle}>
                Stage
                <input type="number" min="1" max="4" value={eventStage}
                  onChange={e => setEventStage(e.target.value)} style={fieldStyle} />
              </label>
              <label style={fieldLabelStyle}>
                Claim limit
                <input type="number" min="1" placeholder="Unlimited" value={claimLimit}
                  onChange={e => setClaimLimit(e.target.value)} style={fieldStyle} />
              </label>
              <label style={fieldLabelStyle}>
                Expires (minutes)
                <input type="number" min="1" max="1440" value={expirationMinutes}
                  onChange={e => setExpirationMinutes(e.target.value)} style={fieldStyle} />
              </label>
            </div>

            {eventKind === 'partner' && (
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                Challenge answers are checked against the private server answer key.
              </p>
            )}

            <button type="submit" className="pill-btn-action pill-btn-primary">
              <Flame size={16} />
              <span>Generate event QR</span>
            </button>
          </form>

          {createdCode && <EventCodeCard code={createdCode} showToast={showToast} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700' }}>Issued event codes ({staffEventCodes.length})</h4>
            {staffEventCodes.map(code => <EventCodeCard key={code.code} code={code} showToast={showToast} />)}
          </div>
        </div>
      )}

      {/* LEDGER & AUDIT TAB (PRD S2, M4) */}
      {activeAdminTab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            Every point change is stored as an immutable ledger record. Reversals require an audit reason.
          </div>

          {adminLedger.map(entry => (
            <div
              key={entry.id}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: entry.isReversed ? 'rgba(255, 82, 82, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${entry.isReversed ? 'rgba(255, 82, 82, 0.3)' : 'var(--border-subtle)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: entry.isReversed ? '#FF5252' : '#FFF', textDecoration: entry.isReversed ? 'line-through' : 'none' }}>
                  {entry.attendeeName ? `${entry.attendeeName}: ` : ''}{entry.title}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: entry.isReversed ? '#FF5252' : 'var(--green-primary)' }}>
                  {entry.isReversed ? `-${entry.points}` : `+${entry.points}`} PTS
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Reason: {entry.reason}</span>
                <span>{entry.timestamp}</span>
              </div>

              {entry.isReversed && (
                <span style={{ fontSize: '11px', color: '#FF8A80', fontStyle: 'italic' }}>
                  Audit note: {entry.reversalReason || entry.reason}
                </span>
              )}

              {!entry.isReversed && (
                <div style={{ marginTop: '4px' }}>
                  {reversingEntryId === entry.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="State reason for reversal..."
                        value={reversalReason}
                        onChange={(e) => setReversalReason(e.target.value)}
                        style={{
                          flex: 1,
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 82, 82, 0.4)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#FFF',
                          fontSize: '11px'
                        }}
                      />
                      <button
                        onClick={() => handleConfirmReversal(entry.id)}
                        style={{
                          background: '#FF5252',
                          border: 'none',
                          color: '#FFF',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReversingEntryId(entry.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '10.5px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Audit / Reverse Points
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FINALE VERIFICATION TAB (PRD 5.9, F1-F3) */}
      {activeAdminTab === 'finale' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#FFD700' }}>
              Stage Finale: The Top 10 Prompt Battle
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', lineHeight: 1.4 }}>
              Rankings below use server-recorded scores and exclude attendees who opted out of the public board.
            </p>
          </div>

          <h4 style={{ fontSize: '13px', fontWeight: '700' }}>
            Current public leaderboard top 10
          </h4>

          {leaderboard.slice(0, 10).map((fin, idx) => (
            <div
              key={fin.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`rank-badge-num rank-${idx < 3 ? idx + 1 : 'other'}`}>
                  {idx + 1}
                </span>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{fin.name}</span>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {fin.role} · public leaderboard
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--green-primary)' }}>
                {fin.points} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EventCodeCard = ({ code, showToast }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const expired = !code.active || new Date(code.expires_at).getTime() <= Date.now();

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(code.code, { width: 180, margin: 1 })
      .then(url => {
        if (active) setQrDataUrl(url);
      })
      .catch(error => {
        console.error('Could not render the event QR code.', error);
        if (active) setQrError('QR image could not be generated. Copy the code below and render it with a trusted QR tool.');
      });
    return () => { active = false; };
  }, [code.code]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.code);
      showToast('Event code copied', 'The code is ready to share with authorized event staff.', 'success');
    } catch (error) {
      console.error('Could not copy the event code.', error);
      showToast('Could not copy code', 'Clipboard access was denied by this browser.', 'warning');
    }
  };

  return (
    <div className="quest-card" style={{
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      opacity: expired ? 0.6 : 1
    }}>
      {!expired && qrDataUrl && (
        <img src={qrDataUrl} alt={`QR code for ${code.title}`} style={{ width: 100, height: 100, background: '#FFF', padding: 5, borderRadius: 8 }} />
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <strong>{code.title}</strong>
        <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
          {code.kind} · +{code.points} points · {code.claimed_count}/{code.claim_limit ?? '∞'} claims
        </div>
        <code style={{ display: 'block', overflowWrap: 'anywhere', marginTop: 6 }}>{code.code}</code>
        <div style={{ color: expired ? '#FF8A80' : 'var(--green-primary)', fontSize: 11, marginTop: 4 }}>
          {expired ? 'Expired or disabled' : `Expires ${new Date(code.expires_at).toLocaleString()}`}
        </div>
        {qrError && <p style={{ color: '#FF8A80', fontSize: 11 }}>{qrError}</p>}
        {!expired && <button type="button" className="pill-btn-action pill-btn-secondary" onClick={copyCode}>Copy code</button>}
      </div>
    </div>
  );
};

const fieldStyle = {
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '10px',
  color: '#FFF',
  fontSize: '13px'
};

const fieldLabelStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  fontSize: '11px',
  color: 'var(--text-muted)'
};
