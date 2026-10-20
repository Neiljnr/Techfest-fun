import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STAGES } from '../data/quests';
import { MOCK_ATTENDEES } from '../data/mockAttendees';
import { 
  Zap, 
  Users, 
  Radio, 
  Building2, 
  Check, 
  Lock, 
  ArrowRight, 
  Copy, 
  Share2, 
  MessageCircle, 
  QrCode, 
  Sparkles,
  Flame,
  Award,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const HomeScreen = () => {
  const {
    user,
    points,
    currentRank,
    getStageProgress,
    getClearedStagesCount,
    setActiveModal,
    setModalData,
    setCurrentTab,
    signalDrops,
    showToast
  } = useApp();

  const [copiedRef, setCopiedRef] = useState(false);

  const clearedCount = getClearedStagesCount();
  const referralLink = `https://techfestjos.org/quest?ref=${user.ticketId || 'JTF26-OP'}`;

  const copyReferral = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopiedRef(true);
    showToast('Link Copied!', 'Share your operator pass with fellow builders (+10 pts each).', 'success');
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Automate the Day at Jos TechFest 2026! Join me on TechFest Quest, complete challenges and climb the leaderboard at Sarau Event Center: ${referralLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Determine active stage for Next Up
  const stage1Prog = getStageProgress(1);
  const stage2Prog = getStageProgress(2);
  const stage3Prog = getStageProgress(3);
  const stage4Prog = getStageProgress(4);

  let nextStage = STAGES[0];
  let nextProg = stage1Prog;
  if (stage1Prog.isCleared && !stage2Prog.isCleared) {
    nextStage = STAGES[1];
    nextProg = stage2Prog;
  } else if (stage2Prog.isCleared && !stage3Prog.isCleared) {
    nextStage = STAGES[2];
    nextProg = stage3Prog;
  } else if (stage3Prog.isCleared && !stage4Prog.isCleared) {
    nextStage = STAGES[3];
    nextProg = stage4Prog;
  }

  // Active flash drop
  const activeFlashDrop = signalDrops.find(d => d.active);

  // Top 5 preview
  // Insert current user into leaderboard copy to compute exact live rank
  const allBoard = [...MOCK_ATTENDEES, {
    id: user.id,
    name: user.name,
    role: user.role,
    title: currentRank.title,
    points: points,
    avatarId: user.avatarId,
    ticketType: user.ticketType
  }].sort((a, b) => b.points - a.points);

  const userRankIndex = allBoard.findIndex(p => p.id === user.id) + 1;
  const top5 = allBoard.slice(0, 5);

  return (
    <div className="main-content">
      {/* 1. Welcome Card (H2) */}
      <div className="quest-card card-highlight welcome-card">
        <div className="welcome-badge-row">
          <span className="event-tag">
            <Sparkles size={12} />
            Jos TechFest 2026 · AI x Industry
          </span>
          <span 
            className="rank-link-badge"
            onClick={() => setCurrentTab('board')}
            title="Click to view full leaderboard"
          >
            Rank #{userRankIndex}
            <ChevronRight size={14} />
          </span>
        </div>

        <div>
          <h2 className="welcome-title">Automate the Day</h2>
          <p className="welcome-subtitle">
            Sarau Event Center, Jos · 26-27 Nov · Complete quests, plug into builders, and rule the board.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00E676',
              boxShadow: '0 0 8px #00E676'
            }} />
            <span style={{ fontSize: '12.5px', color: '#E0E7E2' }}>
              Checked in at Sarau Event Center
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--green-primary)', fontWeight: '700' }}>
            TICKET: FREE
          </span>
        </div>
      </div>

      {/* 2. Quest Tracker Card (H3) */}
      <div className="quest-card stage-tracker-card">
        <div className="stage-tracker-header">
          <div className="tracker-title-box">
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>The Four Stages</h3>
          </div>
          <span className="tracker-count-badge">
            {clearedCount}/4 Cleared
          </span>
        </div>

        {/* 4 Circular Nodes Row */}
        <div className="stages-nodes-row">
          {STAGES.map((stg) => {
            const prog = getStageProgress(stg.number);
            const isCleared = prog.isCleared;
            const isActive = nextStage.id === stg.id;

            return (
              <div 
                key={stg.id} 
                className={`stage-node-item ${isCleared ? 'cleared' : ''} ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (stg.number === 3) {
                    setActiveModal('blitz');
                  } else {
                    setModalData(stg);
                    setActiveModal('stage_detail');
                  }
                }}
              >
                <div 
                  className="stage-circle-btn"
                  style={{
                    color: isCleared ? 'var(--green-primary)' : stg.color,
                    borderColor: isCleared ? 'var(--green-primary)' : (isActive ? stg.color : 'rgba(255,255,255,0.1)')
                  }}
                >
                  {stg.number === 1 && <Radio size={22} />}
                  {stg.number === 2 && <Users size={22} />}
                  {stg.number === 3 && <Zap size={22} />}
                  {stg.number === 4 && <Building2 size={22} />}

                  {isCleared && (
                    <div className="stage-check-mini">
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  )}
                </div>
                <span className="stage-label-text">{stg.title}</span>
              </div>
            );
          })}
        </div>

        {/* Pill Button below: "Start the quest" */}
        <button 
          className="pill-btn-action pill-btn-primary"
          onClick={() => {
            if (nextStage.number === 3) {
              setActiveModal('blitz');
            } else {
              setModalData(nextStage);
              setActiveModal('stage_detail');
            }
          }}
        >
          <span>{clearedCount === 4 ? 'All Stages Cleared! View Stats' : `Enter Stage ${nextStage.number}: ${nextStage.title}`}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 3. Next Up Card (H4) */}
      <div className="quest-card next-up-card">
        <div className="next-up-header">
          <span className="next-up-badge">
            Stage {nextStage.number} Active
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Cap: {nextStage.cap} pts
          </span>
        </div>

        <div>
          <h4 className="next-up-title">{nextStage.title}: {nextStage.subtitle}</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {nextStage.flavor}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-shell">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${Math.min(100, Math.round((nextProg.points / nextStage.cap) * 100))}%`,
              background: nextStage.color
            }}
          />
        </div>

        <div className="next-up-footer">
          <span>{nextProg.progressLabel}</span>
          <button 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--green-primary)',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => {
              if (nextStage.number === 3) {
                setActiveModal('blitz');
              } else {
                setModalData(nextStage);
                setActiveModal('stage_detail');
              }
            }}
          >
            Open Tasks <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 4. Live Signal Drop Banner (Surprise Flash Quest) */}
      {activeFlashDrop && (
        <div 
          className="quest-card"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 145, 0, 0.08) 100%)',
            borderColor: 'rgba(255, 215, 0, 0.35)',
            cursor: 'pointer'
          }}
          onClick={() => setActiveModal('scanner')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 215, 0, 0.2)',
              color: '#FFD700',
              fontSize: '10.5px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              <Flame size={12} />
              {activeFlashDrop.badge}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#FFD700' }}>
              +{activeFlashDrop.points} PTS
            </span>
          </div>

          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>
            {activeFlashDrop.title}
          </h4>
          <p style={{ fontSize: '12px', color: '#D4DDD7' }}>
            {activeFlashDrop.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '11.5px', color: '#A0B0A7' }}>
            <span>📍 {activeFlashDrop.hint}</span>
            <span style={{ color: '#FFD700', fontWeight: '700' }}>Tap to Scan Code</span>
          </div>
        </div>
      )}

      {/* 5. Quick Networking Bar (H6) */}
      <div className="quick-qr-row">
        <div 
          className="quick-qr-card"
          onClick={() => setActiveModal('operator_card')}
        >
          <div className="quick-qr-icon">
            <QrCode size={22} />
          </div>
          <div className="quick-qr-info">
            <h4>My QR Card</h4>
            <p>Show for 2-way connect</p>
          </div>
        </div>

        <div 
          className="quick-qr-card"
          onClick={() => setCurrentTab('people')}
        >
          <div className="quick-qr-icon" style={{ background: 'rgba(0, 176, 255, 0.12)', color: '#00B0FF' }}>
            <Users size={22} />
          </div>
          <div className="quick-qr-info">
            <h4>Find People</h4>
            <p>Cross-role bonuses</p>
          </div>
        </div>
      </div>

      {/* 6. Referral Card (H5) */}
      <div className="quest-card referral-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Refer Fellow Builders</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Earn +10 points for every friend who checks in at Sarau Event Center (up to 5).
            </p>
          </div>
          <span style={{
            background: 'rgba(0, 230, 118, 0.15)',
            color: 'var(--green-primary)',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 8px',
            borderRadius: '8px'
          }}>
            +10 PTS
          </span>
        </div>

        <div className="referral-link-box">
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            className="referral-input" 
          />
          <button className="btn-copy" onClick={copyReferral}>
            {copiedRef ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="share-buttons-row">
          <button className="share-btn whatsapp" onClick={shareWhatsApp}>
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </button>
          <button className="share-btn" onClick={copyReferral}>
            <Share2 size={15} />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* 7. Top 5 Players Preview (H9) */}
      <div className="quest-card leaderboard-preview-card">
        <div className="card-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#FFD700" />
            <h3>Leaderboard Top 5</h3>
          </div>
          <span className="text-link" onClick={() => setCurrentTab('board')}>
            See board
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {top5.map((player, idx) => {
            const rankNum = idx + 1;
            const isMe = player.id === user.id;

            return (
              <div 
                key={player.id} 
                className="preview-player-row"
                style={{
                  border: isMe ? '1px solid var(--green-primary)' : '1px solid transparent',
                  background: isMe ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div className="preview-player-left">
                  <span className={`rank-badge-num rank-${rankNum <= 3 ? rankNum : 'other'}`}>
                    {rankNum}
                  </span>
                  <div>
                    <div className="preview-player-name">
                      {player.name} {isMe && <span style={{ color: 'var(--green-primary)', fontSize: '11px' }}>(You)</span>}
                    </div>
                    <div className="preview-player-role">
                      {player.title} · {player.role.toUpperCase()}
                    </div>
                  </div>
                </div>

                <span className="preview-player-points">
                  {player.points} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Community Links & Event Dispatch (H8) */}
      <div className="quest-card" style={{ padding: '14px' }}>
        <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-light)' }}>
          Plateau Tech Community Hub
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a 
            href="https://whatsapp.com/channel/jos-techfest" 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-white)',
              textDecoration: 'none',
              fontSize: '12.5px'
            }}
          >
            <span>💬 Official WhatsApp Community Channel</span>
            <ExternalLink size={14} color="var(--green-primary)" />
          </a>
          <a 
            href="https://techfestjos.org" 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-white)',
              textDecoration: 'none',
              fontSize: '12.5px'
            }}
          >
            <span>🌐 TechFest 2026 Sarau Event Agenda & Speakers</span>
            <ExternalLink size={14} color="var(--green-primary)" />
          </a>
        </div>
      </div>
    </div>
  );
};
