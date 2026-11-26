import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAvatarMeta } from '../data/avatars';
import { getTitleForPoints } from '../data/ranks';
import { Crown, Search, Monitor } from 'lucide-react';

export const LeaderboardScreen = () => {
  const { user, points, setCurrentTab, leaderboard, isAdmin } = useApp();
  const [searchFilter, setSearchFilter] = useState('');
  const [banterIndex, setBanterIndex] = useState(0);
  const [rankMoves, setRankMoves] = useState({});
  const previousRanksRef = useRef(null);
  const rankMoveTimerRef = useRef(null);

  const ownBoardEntry = {
    id: user.id,
    name: user.name,
    role: user.role,
    title: getTitleForPoints(points).title,
    points: points,
    avatarId: user.avatarId,
    hubId: user.hubId
  };
  const boardWithCurrentUser = isAdmin || leaderboard.some(player => player.id === user.id)
    ? leaderboard
    : [...leaderboard, ownBoardEntry];
  const mainBoardList = [...boardWithCurrentUser]
    .sort((a, b) => b.points - a.points)
    .filter(p => p.name.toLowerCase().includes(searchFilter.toLowerCase()));

  const top3 = mainBoardList.slice(0, 3);
  const overallRank = [...boardWithCurrentUser].sort((a, b) => b.points - a.points)
    .findIndex(player => player.id === user.id) + 1;
  const banterLines = isAdmin
    ? ['Players, the crown is up for grabs. Who go collect am? 👑', 'One good quiz fit scatter this whole board 🤯⚡', 'Current leader, enjoy am while e last 😂']
    : overallRank === 1
      ? ['You see this top? Na here I go dey 😎👑', 'Top spot secured… for now. Who wan try? 😂', 'Oga at the top, no blink o 👀']
      : overallRank === 2
        ? ['I dey come for that top spot. Hold am well 😤🚀', 'Second place na temporary arrangement 😅', 'One quiz and I don collect that crown 🤭👑']
        : ['Small small, I dey climb. Make una watch 👀📈', 'No panic, comeback dey load… 🔥', 'I’m taking the top spot one point at a time 🏃🏽‍♂️💨', 'This board no be family property; we fit collect am 😂'];

  useEffect(() => {
    setBanterIndex(0);
    const timer = window.setInterval(() => setBanterIndex(index => (index + 1) % banterLines.length), 7000);
    return () => window.clearInterval(timer);
  }, [overallRank, banterLines.length]);

  useEffect(() => {
    const rankedPlayers = [...boardWithCurrentUser].sort((a, b) => b.points - a.points);
    const currentRanks = new Map(rankedPlayers.map((player, index) => [player.id, index + 1]));
    const previousRanks = previousRanksRef.current;
    window.clearTimeout(rankMoveTimerRef.current);

    if (previousRanks) {
      const moves = {};
      currentRanks.forEach((rank, playerId) => {
        const previousRank = previousRanks.get(playerId);
        if (previousRank && previousRank !== rank) moves[playerId] = previousRank - rank;
      });
      setRankMoves(moves);
      if (Object.keys(moves).length) {
        rankMoveTimerRef.current = window.setTimeout(() => setRankMoves({}), 7000);
      }
    }

    previousRanksRef.current = currentRanks;
  }, [leaderboard, points, user.id, isAdmin]);

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
          onClick={() => window.open('/screen', '_blank', 'noopener')}
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
          title="Open projector view with large Quest join QR"
        >
          <Monitor size={14} />
          <span>Projector + Join QR</span>
        </button>
      </div>

      <div style={{
        padding: '8px 12px',
        borderRadius: '12px',
        background: 'rgba(24, 214, 74, 0.12)',
        color: 'var(--green-primary)',
        fontSize: '13px',
        fontWeight: '800',
        textAlign: 'center'
      }}>
        🏆 Main Board
      </div>

      {/* MAIN BOARD CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div aria-live="polite" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '11px 13px',
            borderRadius: '12px',
            background: 'rgba(24, 214, 74, 0.08)',
            border: '1px solid rgba(24, 214, 74, 0.2)',
            color: 'var(--text-light)',
            fontSize: '12.5px',
            fontWeight: '650'
          }}>
            <span aria-hidden="true" style={{ fontSize: '16px' }}>💬</span>
            <span>{banterLines[banterIndex]}</span>
          </div>
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
                    {rankMoves[player.id] && (
                      <span
                        aria-label={rankMoves[player.id] > 0 ? `Moved up ${rankMoves[player.id]} places` : `Moved down ${Math.abs(rankMoves[player.id])} places`}
                        title={rankMoves[player.id] > 0 ? `Up ${rankMoves[player.id]} places` : `Down ${Math.abs(rankMoves[player.id])} places`}
                        style={{
                          color: rankMoves[player.id] > 0 ? 'var(--green-primary)' : '#FF8A80',
                          fontSize: '10px',
                          fontWeight: '800',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {rankMoves[player.id] > 0 ? `▲${rankMoves[player.id]}` : `▼${Math.abs(rankMoves[player.id])}`}
                      </span>
                    )}
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
                        {getTitleForPoints(player.points).title} · {player.role.toUpperCase()}
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
    </div>
  );
};
