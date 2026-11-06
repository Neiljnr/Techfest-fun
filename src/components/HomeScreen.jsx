import { useApp } from '../context/AppContext';
import { STAGES } from '../data/quests';
import { getTitleForPoints } from '../data/ranks';
import { 
  Zap, 
  Users, 
  Radio, 
  Building2, 
  Check, 
  Lock, 
  ArrowRight, 
  QrCode, 
  Sparkles,
  Flame,
  Award,
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
    leaderboard,
    stageSettings,
    showToast
  } = useApp();

  const openStage = (stg) => {
    if (!stageSettings[stg.number]) {
      showToast('Not open yet', `Stage ${stg.number} opens when the organizers announce it.`, 'warning');
      return;
    }
    if (stg.number === 3) {
      setActiveModal('blitz');
    } else {
      setModalData(stg);
      setActiveModal('stage_detail');
    }
  };

  const clearedCount = getClearedStagesCount();

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
  const allBoard = leaderboard.some(player => player.id === user.id)
    ? [...leaderboard]
    : [...leaderboard, {
    id: user.id,
    name: user.name,
    role: user.role,
    title: currentRank.title,
    points: points,
    avatarId: user.avatarId,
    hubId: user.hubId
  }];
  allBoard.sort((a, b) => b.points - a.points);

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
          <button
            type="button"
            className="rank-link-badge"
            onClick={() => setCurrentTab('board')}
            title="Click to view full leaderboard"
            aria-label={`View leaderboard, current rank ${userRankIndex}`}
          >
            Rank #{userRankIndex}
            <ChevronRight size={14} />
          </button>
        </div>

        <div>
          <h2 className="welcome-title">Automate the Day</h2>
          <p className="welcome-subtitle">
            Sarau Event Center, Jos · 26-27 Nov · Complete quests, plug into builders, and rule the board.
          </p>
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
              <button
                type="button"
                key={stg.id} 
                className={`stage-node-item ${isCleared ? 'cleared' : ''} ${isActive ? 'active' : ''}`}
                style={stageSettings[stg.number] ? undefined : { opacity: 0.45 }}
                aria-label={`Open stage ${stg.number}: ${stg.title}`}
                onClick={() => openStage(stg)}
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
              </button>
            );
          })}
        </div>

        {/* Pill Button below: "Start the quest" */}
        <button 
          className="pill-btn-action pill-btn-primary"
          onClick={() => openStage(nextStage)}
        >
          <span>{clearedCount === 4 ? 'All Stages Cleared! View Stats' : stageSettings[nextStage.number] ? `Enter Stage ${nextStage.number}: ${nextStage.title}` : `Stage ${nextStage.number} opens soon`}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 3. Next Up Card (H4) */}
      <div className="quest-card next-up-card">
        <div className="next-up-header">
          <span className="next-up-badge">
            Stage {nextStage.number} {stageSettings[nextStage.number] ? 'Active' : 'Locked'}
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
            onClick={() => openStage(nextStage)}
          >
            Open Tasks <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 4. Live Signal Drop Banner (Surprise Flash Quest) */}
      {activeFlashDrop && (
        <button
          type="button"
          className="quest-card flash-drop-card"
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
        </button>
      )}

      {/* 5. Quick Networking Bar (H6) */}
      <div className="quick-qr-row">
        <button
          type="button"
          className="quick-qr-card"
          aria-label="Open my operator QR card"
          onClick={() => setActiveModal('operator_card')}
        >
          <div className="quick-qr-icon">
            <QrCode size={22} />
          </div>
          <div className="quick-qr-info">
            <h4>My QR Card</h4>
            <p>Show for 2-way connect</p>
          </div>
        </button>

        <button
          type="button"
          className="quick-qr-card"
          aria-label="Find people"
          onClick={() => setCurrentTab('people')}
        >
          <div className="quick-qr-icon" style={{ background: 'rgba(0, 176, 255, 0.12)', color: '#00B0FF' }}>
            <Users size={22} />
          </div>
          <div className="quick-qr-info">
            <h4>Find People</h4>
            <p>Cross-role bonuses</p>
          </div>
        </button>
      </div>

      {/* 7. Top 5 Players Preview (H9) */}
      <div className="quest-card leaderboard-preview-card">
        <div className="card-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#FFD700" />
            <h3>Leaderboard Top 5</h3>
          </div>
          <button type="button" className="text-link" onClick={() => setCurrentTab('board')}>
            See board
          </button>
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
                      {getTitleForPoints(player.points).title} · {player.role.toUpperCase()}
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
    </div>
  );
};
