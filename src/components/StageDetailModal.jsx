import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PARTNERS } from '../data/partners';
import { 
  X, 
  Check, 
  ExternalLink, 
  Copy, 
  Building2, 
  Users, 
  Radio, 
  Zap, 
  Send, 
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const StageDetailModal = () => {
  const {
    modalData: stage,
    setActiveModal,
    setModalData,
    stage1Quests,
    completeStage1Quest,
    getStageProgress,
    connections,
    partnerVisits,
    showToast
  } = useApp();

  const [postInputs, setPostInputs] = useState({});

  if (!stage) return null;

  const progress = getStageProgress(stage.number);

  const handlePostSubmit = (questId) => {
    const url = postInputs[questId] || '';
    if (!url.trim()) {
      showToast('Paste Post URL', 'Please paste the link to your post to verify.', 'warning');
      return;
    }
    completeStage1Quest(questId, url);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ height: '88vh', maxHeight: '88vh' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottomColor: stage.color }}>
          <div className="modal-title-box">
            <span style={{ 
              color: stage.color, 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              {stage.number === 1 && <Radio size={22} />}
              {stage.number === 2 && <Users size={22} />}
              {stage.number === 3 && <Zap size={22} />}
              {stage.number === 4 && <Building2 size={22} />}
            </span>
            <div>
              <h3 className="modal-title">Stage {stage.number}: {stage.title}</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {stage.tagline}
              </p>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Progress Banner */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${progress.isCleared ? 'var(--green-primary)' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: progress.isCleared ? 'var(--green-primary)' : 'var(--text-light)' }}>
                {progress.isCleared ? '✅ STAGE CLEARED · YOU DEY MOVE!' : '⚡ PROGRESS TOWARD CLEARANCE'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: stage.color }}>
                {progress.points}/{stage.cap} PTS
              </span>
            </div>

            <div className="progress-bar-shell">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${Math.min(100, (progress.points / stage.cap) * 100)}%`,
                  background: stage.color
                }}
              />
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {progress.progressLabel}
            </span>
          </div>

          {/* STAGE 1: BOOT UP QUEST LIST */}
          {stage.number === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)' }}>
                Warm-Up Social Automations (Cap: 40 pts · Cleared at 25 pts)
              </h4>

              {stage1Quests.map((quest) => {
                const isDone = quest.completed;

                return (
                  <div
                    key={quest.id}
                    style={{
                      background: isDone ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isDone ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: isDone ? 'var(--green-primary)' : '#FFF' }}>
                            {quest.title}
                          </span>
                          {isDone && <Check size={16} color="var(--green-primary)" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {quest.rule}
                        </span>
                      </div>
                      <span style={{
                        background: isDone ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: isDone ? 'var(--green-primary)' : 'var(--text-light)',
                        fontSize: '11.5px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        +{quest.points} PTS
                      </span>
                    </div>

                    {/* Action depending on type */}
                    {!isDone && quest.type === 'social_follow' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <a 
                          href={quest.targetUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="share-btn"
                          style={{ flex: 1, textDecoration: 'none' }}
                        >
                          <ExternalLink size={13} />
                          <span>{quest.actionText}</span>
                        </a>
                        <button
                          className="pill-btn-action pill-btn-primary"
                          style={{ width: 'auto', padding: '0 16px', fontSize: '12.5px' }}
                          onClick={() => completeStage1Quest(quest.id)}
                        >
                          I Followed
                        </button>
                      </div>
                    )}

                    {!isDone && quest.type === 'social_post' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                        <button
                          className="share-btn"
                          onClick={() => {
                            navigator.clipboard?.writeText(quest.prefilledText);
                            showToast('Copied Hype Text', 'Paste it on X or LinkedIn and submit your post link!', 'info');
                          }}
                        >
                          <Copy size={13} />
                          <span>Copy Event Hype Text</span>
                        </button>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="Paste your post link here..."
                            value={postInputs[quest.id] || ''}
                            onChange={(e) => setPostInputs({ ...postInputs, [quest.id]: e.target.value })}
                            style={{
                              flex: 1,
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              color: '#FFF',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                          <button
                            className="pill-btn-action pill-btn-primary"
                            style={{ width: 'auto', padding: '0 14px', fontSize: '12px' }}
                            onClick={() => handlePostSubmit(quest.id)}
                          >
                            <Send size={13} />
                            <span>Verify</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {!isDone && quest.type === 'newsletter' && (
                      <button
                        className="pill-btn-action pill-btn-primary"
                        style={{ marginTop: '4px', fontSize: '12.5px' }}
                        onClick={() => completeStage1Quest(quest.id)}
                      >
                        Subscribe with Gmail
                      </button>
                    )}

                    {!isDone && quest.type === 'referral_share' && (
                      <button
                        className="pill-btn-action pill-btn-primary"
                        style={{ marginTop: '4px', fontSize: '12.5px' }}
                        onClick={() => {
                          navigator.clipboard?.writeText('https://techfestjos.org/quest');
                          completeStage1Quest(quest.id);
                        }}
                      >
                        Copy & Share Referral
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* STAGE 2: PLUG IN OVERVIEW */}
          {stage.number === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: 'rgba(0, 176, 255, 0.08)',
                border: '1px solid rgba(0, 176, 255, 0.25)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#00B0FF', marginBottom: '6px' }}>
                  Two-Way Handshake Networking
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-light)', lineHeight: 1.4 }}>
                  Scan another attendee's QR or share yours. Both players must confirm within 2 minutes.
                  <br />
                  • Same role connect: <strong>+10 points</strong>
                  <br />
                  • Cross-role connect (e.g. Builder ↔ Founder): <strong>+15 points (+5 role bonus)</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="pill-btn-action pill-btn-primary"
                  onClick={() => {
                    setActiveModal('operator_card');
                  }}
                >
                  Show My QR Code
                </button>
                <button 
                  className="pill-btn-action pill-btn-secondary"
                  onClick={() => {
                    setActiveModal('scanner');
                  }}
                >
                  Open Scanner
                </button>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: '700', marginTop: '6px' }}>
                Confirmed Connections ({connections.length}/5 to clear)
              </h4>

              {connections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No connections yet. Scan an attendee in Sarau Hall to start plugging in!
                </div>
              ) : (
                connections.map(c => (
                  <div 
                    key={c.id} 
                    style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#FFF' }}>{c.name}</span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {c.role.toUpperCase()} {c.isDifferentRole && '· 🌟 Cross-role bonus earned'}
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--green-primary)' }}>
                      +{c.pointsAwarded} PTS
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* STAGE 4: PARTNERS BOOTH LIST */}
          {stage.number === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)' }}>
                10+ Partner Booths at Sarau Hall (Visited: {Object.keys(partnerVisits).length}/3 to clear)
              </h4>

              {PARTNERS.map(partner => {
                const visit = partnerVisits[partner.id];
                const isVisited = !!visit;
                const isTaskDone = visit && visit.taskCompleted;

                return (
                  <div
                    key={partner.id}
                    onClick={() => {
                      setModalData(partner);
                      setActiveModal('partner_detail');
                    }}
                    style={{
                      background: isVisited ? 'rgba(255, 64, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isVisited ? 'rgba(255, 64, 129, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'transform 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFF' }}>
                          {partner.name}
                        </span>
                        {isTaskDone && (
                          <span style={{ fontSize: '10px', background: 'rgba(0, 230, 118, 0.2)', color: '#00E676', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            DONE
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {partner.booth} · {partner.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '800', color: partner.color }}>
                        {isVisited ? (isTaskDone ? '+25' : '+10') : '0'}/25 PTS
                      </span>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
