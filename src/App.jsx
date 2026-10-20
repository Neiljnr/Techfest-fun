import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { PeopleScreen } from './components/PeopleScreen';
import { PlugScreen } from './components/PlugScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { VenueProjectorView } from './components/VenueProjectorView';

// Modals
import { ScannerModal } from './components/ScannerModal';
import { StageDetailModal } from './components/StageDetailModal';
import { PromptBlitzModal } from './components/PromptBlitzModal';
import { PartnerDetailModal } from './components/PartnerDetailModal';
import { OperatorCardModal } from './components/OperatorCardModal';
import { ProfileModal } from './components/ProfileModal';

import { 
  Sparkles, 
  Smartphone, 
  Maximize2, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Check
} from 'lucide-react';

export const App = () => {
  const { currentTab, activeModal, toastMessage } = useApp();
  const [wideMode, setWideMode] = useState(false);

  const isVenueMode = currentTab === 'venue';

  return (
    <div className="app-container">
      {/* Outer Shell */}
      <div 
        className={`app-wrapper ${isVenueMode || wideMode ? 'venue-fullscreen' : ''}`}
        style={wideMode && !isVenueMode ? { maxWidth: '720px' } : undefined}
      >
        {/* Floating Desktop Viewport Switcher */}
        {!isVenueMode && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '-110px',
            display: 'none',
            '@media (min-width: 900px)': { display: 'flex' }
          }} className="desktop-toggle-hint">
            <button
              onClick={() => setWideMode(!wideMode)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-light)',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Toggle mobile preview / wider container"
            >
              {wideMode ? <Smartphone size={12} /> : <Maximize2 size={12} />}
              <span>{wideMode ? 'Mobile' : 'Wide'}</span>
            </button>
          </div>
        )}

        {/* Global Toast */}
        {toastMessage && (
          <div className="toast-container">
            <div className={`toast-pill ${toastMessage.type}`}>
              {toastMessage.type === 'success' && <CheckCircle size={18} color="var(--green-primary)" />}
              {toastMessage.type === 'warning' && <AlertTriangle size={18} color="#FFD700" />}
              {toastMessage.type === 'error' && <AlertTriangle size={18} color="#FF5252" />}
              {toastMessage.type === 'info' && <Info size={18} color="#00B0FF" />}
              <div>
                <div className="toast-title">{toastMessage.title}</div>
                <div className="toast-desc">{toastMessage.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Header (Hidden in venue projector mode) */}
        {!isVenueMode && <Header />}

        {/* Main Tab Screen */}
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'people' && <PeopleScreen />}
        {currentTab === 'plug' && <PlugScreen />}
        {currentTab === 'board' && <LeaderboardScreen />}
        {currentTab === 'admin' && <AdminDashboard />}
        {currentTab === 'venue' && <VenueProjectorView />}

        {/* Bottom Dock Navigation (Hidden in venue projector or admin mode) */}
        {!isVenueMode && currentTab !== 'admin' && <BottomNav />}

        {/* Active Modals */}
        {activeModal === 'scanner' && <ScannerModal />}
        {activeModal === 'stage_detail' && <StageDetailModal />}
        {activeModal === 'blitz' && <PromptBlitzModal />}
        {activeModal === 'partner_detail' && <PartnerDetailModal />}
        {activeModal === 'operator_card' && <OperatorCardModal />}
        {activeModal === 'profile' && <ProfileModal />}
      </div>
    </div>
  );
};
