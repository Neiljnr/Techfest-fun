import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { getRoleMeta, getAvatarMeta } from '../data/avatars';

const POLL_MS = 3000;

export const ScreenPage = () => {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(false);
  const [joinQr, setJoinQr] = useState('');
  const [bumped, setBumped] = useState({});
  const previous = useRef({});

  useEffect(() => {
    QRCode.toDataURL(window.location.origin, {
      width: 900,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: { dark: '#061009', light: '#FFFFFF' }
    }).then(setJoinQr).catch(error => console.error('Could not create the Quest join QR.', error));
  }, []);

  useEffect(() => {
    let stopped = false;
    const load = async () => {
      try {
        const response = await fetch('/api/leaderboard', { cache: 'no-store' });
        if (!response.ok) throw new Error('bad status');
        const body = await response.json();
        if (stopped) return;
        const changed = {};
        body.players.forEach(player => {
          if (previous.current[player.id] !== undefined && previous.current[player.id] !== player.points) {
            changed[player.id] = true;
          }
          previous.current[player.id] = player.points;
        });
        setPlayers(body.players);
        setError(false);
        if (Object.keys(changed).length) {
          setBumped(changed);
          window.setTimeout(() => setBumped({}), 2500);
        }
      } catch {
        if (!stopped) setError(true);
      }
    };
    load();
    const interval = window.setInterval(load, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, []);

  const top = players.slice(0, 10);

  return (
    <div className="screen-page">
      <header className="screen-head">
        <div>
          <h1>TechFest Quest</h1>
          <p>Jos TechFest 2026 · Live leaderboard</p>
        </div>
      </header>

      {error && <div className="screen-warn">Reconnecting…</div>}

      <div className="screen-content">
      <ol className="screen-list">
        {top.length === 0 && !error && <li className="screen-empty">No players yet. Be the first to join!</li>}
        {top.map((player, index) => {
          const role = getRoleMeta(player.role);
          const avatar = getAvatarMeta(player.avatarId);
          return (
            <li key={player.id} className={`screen-row ${bumped[player.id] ? 'bumped' : ''}`}
              style={{ borderColor: index < 3 ? role.color : 'rgba(255,255,255,0.08)' }}>
              <span className="screen-rank">{index + 1}</span>
              <span className="screen-avatar" dangerouslySetInnerHTML={{ __html: avatar.svg }} />
              <span className="screen-name">{player.name}</span>
              <span className="screen-role" style={{ color: role.color, borderColor: role.color }}>{role.name}</span>
              <span className="screen-points">{player.points}</span>
            </li>
          );
        })}
      </ol>
      <aside className="screen-join" aria-label="Join TechFest Quest">
        <div className="screen-join-copy">
          <strong>JOIN THE QUEST</strong>
          <span>Scan with your phone camera</span>
        </div>
        {joinQr
          ? <img src={joinQr} alt={`Scan to join TechFest Quest at ${window.location.host}`} />
          : <div className="screen-qr-loading">Preparing join code…</div>}
        <span className="screen-join-url">{window.location.host}</span>
      </aside>
      </div>
    </div>
  );
};
