import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ATTENDEES } from '../data/mockAttendees';
import { getAvatarMeta } from '../data/avatars';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  Radio, 
  Maximize, 
  ArrowLeft,
  Flame,
  CheckCircle2
} from 'lucide-react';
import QRCode from 'qrcode';

export const VenueProjectorView = () => {
  const { user, points, currentRank, setCurrentTab } = useApp();
  const [screenQr, setScreenQr] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);

  // Generate join game QR for big screen
  useEffect(() => {
    QRCode.toDataURL('https://techfestjos.org/quest', {
      width: 200,
      margin: 1,
      color: {
        dark: '#00E676',
        light: '#0A0E0C'
      }
    }).then(url => {
      setScreenQr(url);
    });

    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const allBoard = [...MOCK_ATTENDEES, {
    id: user.id,
    name: user.name,
    role: user.role,
    title: currentRank.title,
    points: points,
    avatarId: user.avatarId
  }].sort((a, b) => b.points - a.points);

  const top10 = allBoard.slice(0, 10);

  const tickerItems = [
    '⚡ LIVE AT SARAU EVENT CENTER · JOS TECHFEST 2026 · THEME: AI X INDUSTRY',
    '🏆 TOP 10 PLAYERS ADVANCE TO THE STAGE PROMPT BATTLE AT 3:30 PM!',
    '🤖 10+ PARTNER BOOTHS OPEN FOR AUTOMATION CHALLENGES IN FOYER',
    '📱 SCAN THE QR CODE ON SCREEN TO JOIN TECHFEST QUEST & CLIMB THE BOARD'
  ];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#060A08',
      color: '#FFF',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative'
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid rgba(0, 230, 118, 0.3)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setCurrentTab('home')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#FFF',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Exit Projector View"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'var(--green-primary)',
                color: '#000',
                fontSize: '11px',
                fontWeight: '900',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                STAGE PROJECTOR
              </span>
              <h1 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-heading)', color: '#FFF' }}>
                JOS TECHFEST 2026 · LEADERBOARD
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Sarau Event Center, Jos · Real-Time Automation Points Ledger
            </p>
          </div>
        </div>

        {/* Big Screen QR to Join */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          padding: '8px 14px',
          borderRadius: '12px'
        }}>
          {screenQr && (
            <img src={screenQr} alt="Scan to join" style={{ width: '56px', height: '56px', borderRadius: '6px' }} />
          )}
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--green-primary)' }}>
              SCAN TO JOIN GAME
            </span>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              techfestjos.org/quest
            </div>
          </div>
        </div>
      </div>

      {/* Live Ticker Bar */}
      <div style={{
        background: 'rgba(0, 230, 118, 0.1)',
        border: '1px solid rgba(0, 230, 118, 0.25)',
        padding: '10px 16px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--green-primary)',
        letterSpacing: '0.5px'
      }}>
        {tickerItems[tickerIndex]}
      </div>

      {/* Grid: Top 10 Projector Rows */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '12px'
      }}>
        {top10.map((player, idx) => {
          const rank = idx + 1;
          const isTop3 = rank <= 3;

          return (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '14px',
                background: isTop3 ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: isTop3 ? '1.5px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: isTop3 ? '0 0 20px rgba(255, 215, 0, 0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '900',
                  background: rank === 1 ? '#FFD700' : (rank === 2 ? '#E0E0E0' : (rank === 3 ? '#CD7F32' : 'rgba(255,255,255,0.08)')),
                  color: rank <= 3 ? '#000' : '#FFF'
                }}>
                  {rank}
                </span>

                <div 
                  className="avatar-thumbnail"
                  style={{ width: '44px', height: '44px' }}
                  dangerouslySetInnerHTML={{ __html: getAvatarMeta(player.avatarId).svg }}
                />

                <div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFF' }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {player.title} · {player.role.toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '900',
                  fontFamily: 'var(--font-heading)',
                  color: isTop3 ? '#FFD700' : 'var(--green-primary)'
                }}>
                  {player.points}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Points
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
