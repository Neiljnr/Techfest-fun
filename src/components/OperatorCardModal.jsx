import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BADGES } from '../data/ranks';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Award,
  CheckCircle,
  Copy
} from 'lucide-react';
import QRCode from 'qrcode';

export const OperatorCardModal = () => {
  const { 
    user, 
    points, 
    currentRank, 
    avatarMeta, 
    roleMeta, 
    setActiveModal, 
    getClearedStagesCount,
    showToast 
  } = useApp();

  const [qrDataUrl, setQrDataUrl] = useState('');
  const clearedStages = getClearedStagesCount();

  useEffect(() => {
    if (user.qrToken) {
      QRCode.toDataURL(user.qrToken, {
        width: 180,
        margin: 1,
        color: {
          dark: '#00E676',
          light: '#0A0E0C'
        }
      }).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [user.qrToken]);

  const copyShareLink = () => {
    navigator.clipboard?.writeText(`https://techfestjos.org/operator/${user.ticketId || 'JTF26'}`);
    showToast('Operator Link Copied', 'Your verifiable operator pass URL is ready to share!', 'success');
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-sheet" 
        style={{ 
          height: '88vh', 
          maxHeight: '88vh',
          background: '#080C09'
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Sparkles size={20} color="var(--green-primary)" />
            <h3 className="modal-title">Official Operator Pass</h3>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ alignItems: 'center' }}>
          {/* Holographic Operator Card Visual */}
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: 'linear-gradient(135deg, #101F16 0%, #08120B 100%)',
            border: '2px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '24px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 230, 118, 0.15)'
          }}>
            {/* Cyber Corner Accents */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #00E676, #00B0FF, #FFD700)' }} />

            {/* Event Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', color: 'var(--green-primary)', textTransform: 'uppercase' }}>
                JOS TECHFEST 2026
              </span>
              <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)' }}>
                SARAU CENTER
              </span>
            </div>

            {/* Avatar & Glow */}
            <div 
              className="avatar-thumbnail"
              style={{
                width: '84px',
                height: '84px',
                borderWidth: '3px',
                borderColor: currentRank.color,
                boxShadow: `0 0 25px ${currentRank.color}44`,
                marginBottom: '12px'
              }}
              dangerouslySetInnerHTML={{ __html: avatarMeta.svg }}
            />

            {/* Name & Title */}
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FFF' }}>
              {user.name}
            </h3>

            <div style={{ display: 'flex', gap: '6px', margin: '6px 0 14px 0' }}>
              <span className={`role-chip ${user.role}`}>
                {user.role}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                color: currentRank.color,
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {currentRank.title}
              </span>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              width: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '10px',
              marginBottom: '14px'
            }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Automation Score
                </span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--green-primary)' }}>
                  {points} pts
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Stages Cleared
                </span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#00B0FF' }}>
                  {clearedStages}/4
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrDataUrl && (
              <div style={{
                padding: '8px',
                background: '#070A08',
                borderRadius: '14px',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                boxShadow: '0 0 15px rgba(0, 230, 118, 0.15)',
                marginBottom: '10px'
              }}>
                <img 
                  src={qrDataUrl} 
                  alt="Operator QR" 
                  style={{ width: '120px', height: '120px', display: 'block' }} 
                />
              </div>
            )}

            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
              PASS ID: {user.qrToken}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '340px' }}>
            <button
              className="pill-btn-action pill-btn-primary"
              style={{ flex: 1 }}
              onClick={copyShareLink}
            >
              <Copy size={16} />
              <span>Copy Pass Link</span>
            </button>

            <button
              className="pill-btn-action pill-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => {
                showToast('Card Saved', 'Operator pass saved to your photos!', 'success');
              }}
            >
              <Download size={16} />
              <span>Save Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
