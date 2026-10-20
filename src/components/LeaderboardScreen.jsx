import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ATTENDEES, FOUNDER_TRACK_ATTENDEES } from '../data/mockAttendees';
import { COMMUNITY_HUBS, getNormalizedHubScore } from '../data/hubs';
import { getAvatarMeta } from '../data/avatars';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Search, 
  Monitor, 
  Users, 
  Briefcase, 
  Flame, 
  Sparkles 
} from 'lucide-react';

export const LeaderboardScreen = () => {
  const { user, points, currentRank, setCurrentTab } = useApp();
  const [activeBoardTab, setActiveBoardTab] = useState('main'); // 'main', 'founder', 'hubs'
  const [searchFilter, setSearchFilter] = useState('');

  // Assemble Main Board list with current live user inserted
  const mainBoardList = [...MOCK_ATTENDEES, {
    id: user.id,
    name: user.name,
    role: user.role,
    title: currentRank.title,
    points: points,
    avatarId: user.avatarId,
    ticketType: user.ticketType,
    hubId: user.hubId
  }]
    .sort((a, b) => b.points - a.points)
    .filter(p => p.name.toLowerCase().includes(searchFilter.toLowerCase()));

  // Founder track list
  const founderBoardList = [...FOUNDER_TRACK_ATTENDEES]
    .sort((a, b) => b.points - a.points);

  // Hub Wars list (sorted by normalized score)
  const hubsList = [...COMMUNITY_HUBS]
    .map(hub => {
      // Add current user points if member of this hub
      const extraPts = user.hubId === hub.id ? points : 0;
      const total = hub.totalPoints + extraPts;
      const members = hub.members + (user.hubId === hub.id ? 1 : 0);
      return {
        ...hub,
        calculatedScore: Math.round(total / members),
        totalPoints: total,
        members
      };
    })
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  const top3 = mainBoardList.slice(0, 3);

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Leaderboard</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Live ranking · Ties broken by time of arrival
          </p>
        </div>

        {/* Venue Screen Mode Trigger (L4) */}
        <button
          onClick={() => setCurrentTab('venue')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 215, 0, 0.12)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            color: '#FFD700',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '11.5px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
          title="Open Big-Screen Projector View for Sarau Arena"
        >
          <Monitor size={14} />
          <span>Venue Screen</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '4px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setActiveBoardTab('main')}
          style={{
            padding: '8px 4px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeBoardTab === 'main' ? 'var(--green-primary)' : 'transparent',
            color: activeBoardTab === 'main' ? '#090D0B' : 'var(--text-muted)'
          }}
        >
          Main Board
        </button>
        <button
          onClick={() => setActiveBoardTab('founder')}
          style={{
            padding: '8px 4px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeBoardTab === 'founder' ? '#00B0FF' : 'transparent',
            color: activeBoardTab === 'founder' ? '#090D0B' : 'var(--text-muted)'
          }}
        >
          Founder Track
        </button>
        <button
          onClick={() => setActiveBoardTab('hubs')}
          style={{
            padding: '8px 4px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeBoardTab === 'hubs' ? '#FFD700' : 'transparent',
            color: activeBoardTab === 'hubs' ? '#090D0B' : 'var(--text-muted)'
          }}
        >
          Hub Wars
        </button>
      </div>

      {/* MAIN BOARD CONTENT */}
      {activeBoardTab === 'main' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top 3 Podium */}
          {top3.length >= 3 && !searchFilter && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr 1fr',
              alignItems: 'flex-end',
              gap: '8px',
              padding: '16px 8px 8px 8px',
              background: 'linear-gradient(180deg, rgba(0, 230, 118, 0.08) 0%, rgba(0,0,0,0) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              {/* Rank 2 (Silver) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#E0E0E0' }}>2ND</span>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: '2px solid #E0E0E0',
                  overflow: 'hidden'
                }} dangerouslySetInnerHTML={{ __html: getAvatarMeta(top3[1].avatarId).svg }} />
                <span style={{ fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                  {top3[1].name}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--green-primary)' }}>
                  {top3[1].points}
                </span>
                <div style={{ height: '50px', width: '100%', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px' }} />
              </div>

              {/* Rank 1 (Gold) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
                <Crown size={22} color="#FFD700" />
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFD700' }}>1ST</span>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '3px solid #FFD700',
                  overflow: 'hidden',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
                }} dangerouslySetInnerHTML={{ __html: getAvatarMeta(top3[0].avatarId).svg }} />
                <span style={{ fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                  {top3[0].name}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#FFD700' }}>
                  {top3[0].points} pts
                </span>
                <div style={{ height: '75px', width: '100%', background: 'rgba(255, 215, 0, 0.15)', borderTop: '2px solid #FFD700', borderRadius: '6px' }} />
              </div>

              {/* Rank 3 (Bronze) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#CD7F32' }}>3RD</span>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: '2px solid #CD7F32',
                  overflow: 'hidden'
                }} dangerouslySetInnerHTML={{ __html: getAvatarMeta(top3[2].avatarId).svg }} />
                <span style={{ fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                  {top3[2].name}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--green-primary)' }}>
                  {top3[2].points}
                </span>
                <div style={{ height: '35px', width: '100%', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px' }} />
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search leaderboard..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                fontSize: '12.5px',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          {/* Leaderboard Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mainBoardList.map((player, idx) => {
              const rank = idx + 1;
              const isMe = player.id === user.id;

              return (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: isMe ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: isMe ? '1.5px solid var(--green-primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: isMe ? '0 0 15px rgba(0, 230, 118, 0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`rank-badge-num rank-${rank <= 3 ? rank : 'other'}`}>
                      {rank}
                    </span>
                    <div 
                      className="avatar-thumbnail"
                      style={{ width: '34px', height: '34px' }}
                      dangerouslySetInnerHTML={{ __html: getAvatarMeta(player.avatarId).svg }}
                    />
                    <div>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: isMe ? 'var(--green-primary)' : '#FFF' }}>
                        {player.name} {isMe && '(You)'}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {player.title} · {player.role.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '15px',
                    fontWeight: '800',
                    color: isMe ? 'var(--green-primary)' : '#FFF'
                  }}>
                    {player.points} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOUNDER TRACK BOARD (Day 2) */}
      {activeBoardTab === 'founder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            background: 'rgba(0, 176, 255, 0.08)',
            border: '1px solid rgba(0, 176, 255, 0.25)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '12.5px',
            color: 'var(--text-light)'
          }}>
            🚀 <strong>Day 2 Founder Track</strong> rewards executive roundtable engagement, open demos, and warm introductions (Cap: 200 pts).
          </div>

          {founderBoardList.map((f, idx) => (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`rank-badge-num rank-${idx < 3 ? idx + 1 : 'other'}`}>
                  {idx + 1}
                </span>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFF' }}>
                    {f.name}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {f.company} · {f.roundtables} Roundtables · {f.warmIntros} Warm Intros
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '15px', fontWeight: '800', color: '#00B0FF' }}>
                {f.points} pts
              </span>
            </div>
          ))}
        </div>
      )}

      {/* HUB WARS BOARD (Normalized Team Scores) */}
      {activeBoardTab === 'hubs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '12.5px',
            color: 'var(--text-light)'
          }}>
            🛡️ <strong>Hub Wars</strong> calculates average score per active member (Total Points ÷ Members) so any size community hub competes on fair footing!
          </div>

          {hubsList.map((hub, idx) => {
            const isUserHub = user.hubId === hub.id;

            return (
              <div
                key={hub.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: '12px',
                  background: isUserHub ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: isUserHub ? '1.5px solid #FFD700' : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`rank-badge-num rank-${idx < 3 ? idx + 1 : 'other'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span style={{ fontSize: '14.5px', fontWeight: '800', color: isUserHub ? '#FFD700' : '#FFF' }}>
                      {hub.name} {isUserHub && '(Your Hub)'}
                    </span>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {hub.location} · {hub.members} active members
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: hub.color }}>
                    {hub.calculatedScore}
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    pts / member
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
