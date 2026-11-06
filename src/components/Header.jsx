import React from 'react';
import { useApp } from '../context/AppContext';
import { Star, Wifi, WifiOff, QrCode, Shield, Bell } from 'lucide-react';

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
    setCurrentTab,
    notifications
  } = useApp();
  const unreadCount = notifications.filter(item => !item.read_at).length;

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

        {/* Notifications */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => setActiveModal('notifications')}
          title="Notifications"
          aria-label={`Notifications, ${unreadCount} unread`}
          style={{ position: 'relative' }}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-3px', right: '-3px', minWidth: '16px', height: '16px',
              borderRadius: '8px', background: '#FF4081', color: '#fff', fontSize: '10px',
              fontWeight: 800, display: 'grid', placeItems: 'center', padding: '0 3px'
            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
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
