import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Users, QrCode, UserCheck, Trophy, Sparkles } from 'lucide-react';

export const BottomNav = () => {
  const { currentTab, setCurrentTab, setActiveModal } = useApp();

  return (
    <nav className="bottom-dock">
      {/* 1. Home */}
      <button 
        className={`nav-tab-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => setCurrentTab('home')}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      {/* 2. People (Directory) */}
      <button 
        className={`nav-tab-item ${currentTab === 'people' ? 'active' : ''}`}
        onClick={() => setCurrentTab('people')}
      >
        <Users size={20} />
        <span>People</span>
      </button>

      {/* 3. CENTER SCAN BUTTON (Main App Action) */}
      <div className="center-scan-wrapper">
        <button 
          className="center-scan-btn"
          onClick={() => setActiveModal('scanner')}
          aria-label="Scan QR Code"
          title="Open Camera Scanner"
        >
          <QrCode size={26} strokeWidth={2.5} />
          <span className="center-scan-label">SCAN</span>
        </button>
      </div>

      {/* 4. Plug (Connections & Two-Way Handshake) */}
      <button 
        className={`nav-tab-item ${currentTab === 'plug' ? 'active' : ''}`}
        onClick={() => setCurrentTab('plug')}
        style={{ position: 'relative' }}
      >
        <UserCheck size={20} />
        <span>Plug</span>
      </button>

      {/* 5. Board (Leaderboards & Hub Wars) */}
      <button 
        className={`nav-tab-item ${currentTab === 'board' ? 'active' : ''}`}
        onClick={() => setCurrentTab('board')}
      >
        <Trophy size={20} />
        <span>Board</span>
      </button>
    </nav>
  );
};
