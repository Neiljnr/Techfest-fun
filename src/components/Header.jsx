import React from 'react';
import { useApp } from '../context/AppContext';
import { Star, Wifi, WifiOff, QrCode, Shield, User } from 'lucide-react';

export const Header = () => {
  const {
    user,
    points,
    currentRank,
    avatarMeta,
    isOnline,
    toggleNetwork,
    offlineQueue,
    setActiveModal,
    setCurrentTab
  } = useApp();

  return (
    <header className="app-header">
      {/* Left: User Avatar & Name */}
      <div 
        className="header-user-group"
        onClick={() => setActiveModal('profile')}
        title="View & Edit Profile"
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
      </div>

      {/* Right: Points, Network Status & QR trigger */}
      <div className="header-actions-group">
        {/* Offline / Online simulator badge */}
        <button
          className={`network-badge ${isOnline ? 'online' : 'offline'}`}
          onClick={toggleNetwork}
          title={isOnline ? 'Tap to simulate weak venue network' : 'Offline mode active: tap to reconnect'}
        >
          {isOnline ? (
            <>
              <Wifi size={12} />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff size={12} />
              <span>{offlineQueue.length > 0 ? `${offlineQueue.length} Queued` : 'Offline'}</span>
            </>
          )}
        </button>

        {/* Current Points Pill */}
        <div 
          className="points-pill"
          onClick={() => setCurrentTab('board')}
          title="Total automation points earned"
        >
          <Star size={15} fill="#00E676" stroke="#00E676" />
          <span>{points}</span>
        </div>

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
