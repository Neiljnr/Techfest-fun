import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { PeopleScreen } from './components/PeopleScreen';
import { PlugScreen } from './components/PlugScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { VenueProjectorView } from './components/VenueProjectorView';

// Modals
import { ScannerModal } from './components/ScannerModal';
import { StageDetailModal } from './components/StageDetailModal';
import { PromptBlitzModal } from './components/PromptBlitzModal';
import { PartnerDetailModal } from './components/PartnerDetailModal';
import { OperatorCardModal } from './components/OperatorCardModal';
import { ProfileModal } from './components/ProfileModal';
import { SignupModal } from './components/SignupModal';
import { AdminDashboard } from './components/AdminDashboard';

import { 
  Smartphone, 
  Maximize2, 
  CheckCircle, 
  AlertTriangle, 
  Info
} from 'lucide-react';

export const App = () => {
  const {
    currentTab, activeModal, toastMessage, user, isAdmin, authLoading,
    dataLoading, backendError, isSupabaseConfigured, refreshData
  } = useApp();
  const [wideMode, setWideMode] = useState(false);

  const isVenueMode = currentTab === 'venue';

  if (!isSupabaseConfigured) {
    return (
      <div className="app-container">
        <div className="app-wrapper" style={{ maxWidth: '480px' }}>
          <main className="main-content">
            <h1>Neon setup required</h1>
            <p>Add <code>VITE_NEON_AUTH_URL</code> and <code>VITE_NEON_DATA_API_URL</code> to the environment, then restart the app.</p>
          </main>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <div className="app-container"><div className="app-wrapper"><main className="main-content">Restoring your secure session…</main></div></div>;
  }

  if (!user) {
    return (
      <div className="app-container">
        <div className="app-wrapper" style={{ maxWidth: '480px' }}>
          <SignupModal />
          {toastMessage && <div className={`toast-pill ${toastMessage.type}`}>{toastMessage.title}: {toastMessage.message}</div>}
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return <div className="app-container"><div className="app-wrapper"><main className="main-content">Loading your event account…</main></div></div>;
  }

  if (backendError) {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <main className="main-content">
            <h1>Could not load event data</h1>
            <p>{backendError}</p>
            <button className="pill-btn-action pill-btn-primary" onClick={() => refreshData()}>Retry</button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Outer Shell */}
      <div 
        className={`app-wrapper ${isVenueMode ? 'venue-fullscreen' : wideMode ? 'wide-mode' : ''}`}
        style={wideMode && !isVenueMode ? { maxWidth: '720px' } : undefined}
      >
        {/* Floating Desktop Viewport Switcher */}
        {!isVenueMode && (
          <div className="desktop-toggle-hint">
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
        {currentTab === 'admin' && isAdmin ? <AdminDashboard /> : null}
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'people' && <PeopleScreen />}
        {currentTab === 'plug' && <PlugScreen />}
        {currentTab === 'board' && <LeaderboardScreen />}
        {currentTab === 'venue' && <VenueProjectorView />}

        {/* Bottom Dock Navigation (Hidden in venue projector mode) */}
        {!isVenueMode && <BottomNav />}

        {/* Active Modals */}
        {activeModal === 'scanner' && <ScannerModal />}
        {activeModal === 'stage_detail' && <StageDetailModal />}
        {activeModal === 'blitz' && <PromptBlitzModal />}
        {activeModal === 'partner_detail' && <PartnerDetailModal />}
        {activeModal === 'operator_card' && <OperatorCardModal />}
        {activeModal === 'profile' && <ProfileModal />}
        {activeModal === 'signup' && <SignupModal />}
      </div>
    </div>
  );
};
