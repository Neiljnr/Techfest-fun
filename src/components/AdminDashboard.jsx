import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ATTENDEES } from '../data/mockAttendees';
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
    ledger, 
    reverseLedgerEntry, 
    signalDrops, 
    triggerNewSignalDrop, 
    setCurrentTab,
    showToast 
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview', 'drops', 'ledger', 'finale'
  const [dropTitle, setDropTitle] = useState('');
  const [dropPoints, setDropPoints] = useState(20);
  const [dropHint, setDropHint] = useState('');
  const [reversalReason, setReversalReason] = useState('');
  const [reversingEntryId, setReversingEntryId] = useState(null);

  const handleCreateDrop = (e) => {
    e.preventDefault();
    if (!dropTitle.trim()) return;

    triggerNewSignalDrop({
      title: dropTitle.trim(),
      points: parseInt(dropPoints, 10) || 20,
      hint: dropHint.trim() || 'Sarau Event Center Arena'
    });

    setDropTitle('');
    setDropHint('');
    setActiveAdminTab('overview');
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
                Sarau Check-Ins
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#00E676', fontFamily: 'var(--font-heading)' }}>
                812 / 1,000
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>81.2% Check-In Rate</span>
            </div>

            <div className="quest-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Scan Velocity
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#00B0FF', fontFamily: 'var(--font-heading)' }}>
                48 scans/min
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Across 10 partner booths</span>
            </div>

            <div className="quest-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Points Minted
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFD700', fontFamily: 'var(--font-heading)' }}>
                248,650
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Stored on immutable ledger</span>
            </div>

            <div className="quest-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Disputes Flagged
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFF', fontFamily: 'var(--font-heading)' }}>
                0 Critical
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--green-primary)' }}>Clean Audit Trace</span>
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
              Trigger New Live Signal Drop
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Broadcast surprise quests announced on the main Sarau stage.
            </p>

            <input
              type="text"
              placeholder="Drop Title (e.g. Flash IoT Booth Challenge)"
              value={dropTitle}
              onChange={(e) => setDropTitle(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px',
                color: '#FFF',
                fontSize: '13px'
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Points"
                value={dropPoints}
                onChange={(e) => setDropPoints(e.target.value)}
                style={{
                  width: '100px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#FFF',
                  fontSize: '13px'
                }}
              />
              <input
                type="text"
                placeholder="Location hint (e.g. Near Sarau Stage)"
                value={dropHint}
                onChange={(e) => setDropHint(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#FFF',
                  fontSize: '13px'
                }}
              />
            </div>

            <button type="submit" className="pill-btn-action pill-btn-primary">
              <Flame size={16} />
              <span>Broadcast Live to Attendees</span>
            </button>
          </form>

          {/* List of active drops */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700' }}>Active Signal Drops ({signalDrops.length})</h4>
            {signalDrops.map(d => (
              <div 
                key={d.id} 
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFF' }}>{d.title}</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    📍 {d.hint} · {d.code}
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFD700' }}>
                  +{d.points} PTS
                </span>
              </div>
            ))}
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

          {ledger.map(entry => (
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
                  {entry.title}
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
                  Audit note: {entry.reversalReason}
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
              Cutoff time freezes the main board. Top 10 finalists face off live on stage at Sarau Event Center before judges.
            </p>
          </div>

          <h4 style={{ fontSize: '13px', fontWeight: '700' }}>
            Verified Stage Finalists (Cutoff Queue)
          </h4>

          {MOCK_ATTENDEES.slice(0, 10).map((fin, idx) => (
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
                    Ticket: {fin.ticketType.toUpperCase()} · ID Checked ✅
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
