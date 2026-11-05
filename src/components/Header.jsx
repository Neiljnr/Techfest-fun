import React from 'react';
import { useApp } from '../context/AppContext';
import { Star, Wifi, WifiOff, QrCode, Shield } from 'lucide-react';

export const Header = () => {
  const {
    user,
    points,
    currentRank,
    avatarMeta,
    isOnline,
    isAdmin,
    offlineQueue,
    syncOfflineQueue,
    setActiveModal,
    setCurrentTab
  } = useApp();

  return (
    <header className="app-header">
      {/* Left: User Avatar & Name */}
      <button
        type="button"
        className="header-user-group"
        onClick={() => setActiveModal('profile')}
        title="View & Edit Profile"
        aria-label="View and edit profile"
      >
        <div 
          className="avatar-thumbnail"
          dangerouslySetInnerHTML={{ __html: avatarMeta.svg }}
        />
        <div className="header-name-box">
          <span className="header-name">{user.name || 'Operator'}</span>
          <span className="header-title-badge" style={{ color: currentRank.color }}>
            {currentRank.title}
          </span>
        </div>
      </button>

      {/* Right: Points, Network Status & QR trigger */}
      <div className="header-actions-group">
        {/* Offline / Online simulator badge */}
        <button
          className={`network-badge ${isOnline ? 'online' : 'offline'}`}
          onClick={syncOfflineQueue}
          disabled={!isOnline || offlineQueue.length === 0}
          title={isOnline
            ? offlineQueue.length > 0 ? 'Synchronize saved scans' : 'Internet connection available'
            : 'Waiting for an internet connection'}
        >
          {isOnline ? (
            <>
              <Wifi size={12} />
              <span>{offlineQueue.length > 0 ? `${offlineQueue.length} Queued` : 'Online'}</span>
            </>
          ) : (
            <>
              <WifiOff size={12} />
              <span>{offlineQueue.length > 0 ? `${offlineQueue.length} Queued` : 'Offline'}</span>
            </>
          )}
        </button>

        {isAdmin && (
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => setCurrentTab('admin')}
            title="Organizer admin console"
            aria-label="Open organizer admin console"
          >
            <Shield size={17} />
          </button>
        )}

        {/* Current Points Pill */}
        <button
          type="button"
          className="points-pill"
          onClick={() => setCurrentTab('board')}
          title="Total automation points earned"
          aria-label={`View leaderboard, ${points} points`}
        >
          <Star size={15} fill="#00E676" stroke="#00E676" />
          <span>{points}</span>
        </button>

        {/* My QR Quick Button */}
        <button 
          className="header-icon-btn"
          onClick={() => setActiveModal('operator_card')}
          title="Open My Operator Card & QR"
        >
          <QrCode size={18} />
        </button>
      </div>
    </header>
  );
};
