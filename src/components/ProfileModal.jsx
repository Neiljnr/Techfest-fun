import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AVATARS, ROLES, getRoleMeta } from '../data/avatars';
import { COMMUNITY_HUBS } from '../data/hubs';
import { 
  X, 
  User, 
  Shield, 
  Trash2, 
  Save, 
  Check, 
  Key,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const ProfileModal = () => {
  const { 
    user, 
    setUser, 
    setActiveModal, 
    setCurrentTab, 
    deleteMyData, 
    showToast 
  } = useApp();

  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [avatarId, setAvatarId] = useState(user.avatarId);
  const [hubId, setHubId] = useState(user.hubId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      name: name.trim() || 'Operator',
      role,
      avatarId,
      hubId
    }));
    showToast('Profile Updated', 'Operator parameters synchronized.', 'success');
    setActiveModal(null);
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-sheet" 
        style={{ 
          height: '90vh', 
          maxHeight: '90vh',
          background: '#090D0B'
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <User size={20} color="var(--green-primary)" />
            <h3 className="modal-title">Operator Profile & Settings</h3>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="modal-body" style={{ gap: '18px' }}>
          {/* Display Name Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
              Display Name (Shown on Leaderboards)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Keziah Pam"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#FFF',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Role Picker */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
              Operator Role (Affects Cross-Role Networking Bonuses)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {ROLES.map(r => {
                const isSelected = role === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: isSelected ? `2px solid ${r.color}` : '1px solid var(--border-subtle)',
                      background: isSelected ? `${r.color}20` : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#FFF' : 'var(--text-muted)',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '13px', color: isSelected ? r.color : '#FFF' }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: '10.5px', marginTop: '2px', opacity: 0.8 }}>
                      {r.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Selector (12 Illustrated Avatars) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>
              Choose Character Avatar
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '8px',
              padding: '6px 0'
            }}>
              {AVATARS.map(av => {
                const isSelected = avatarId === av.id;
                return (
                  <div
                    key={av.id}
                    onClick={() => setAvatarId(av.id)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: isSelected ? '2.5px solid var(--green-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 12px var(--green-glow)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                    dangerouslySetInnerHTML={{ __html: av.svg }}
                  />
                );
              })}
            </div>
          </div>

          {/* Hub Wars Selection */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
              Community Hub (For Plateau Hub Wars)
            </label>
            <select
              value={hubId}
              onChange={(e) => setHubId(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(20, 30, 24, 0.95)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#FFF',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              {COMMUNITY_HUBS.map(hub => (
                <option key={hub.id} value={hub.id}>
                  {hub.name} ({hub.location})
                </option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <button type="submit" className="pill-btn-action pill-btn-primary">
            <Save size={16} />
            <span>Save Profile Parameters</span>
          </button>

          {/* Organizer Console Shortcut */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#FFF' }}>
                Organizer Admin Desk
              </span>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Broadcast drops, view audit log & supervise finale
              </p>
            </div>
            <button
              type="button"
              className="pill-btn-action pill-btn-secondary"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '11.5px' }}
              onClick={() => {
                setActiveModal(null);
                setCurrentTab('admin');
              }}
            >
              Open Desk
            </button>
          </div>

          {/* Privacy & NDPA Data Deletion */}
          <div style={{
            background: 'rgba(255, 82, 82, 0.05)',
            border: '1px solid rgba(255, 82, 82, 0.2)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} color="#FF5252" />
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#FF5252' }}>
                Nigeria Data Protection Act (NDPA) Privacy
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              As per TechFest privacy policy: your data is yours. You have the right to purge all personal records and score history at any time.
            </p>

            {showDeleteConfirm ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={deleteMyData}
                  style={{
                    flex: 1,
                    background: '#FF5252',
                    border: 'none',
                    color: '#FFF',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Yes, Permanently Purge My Data
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#FFF',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FF8A80',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={13} />
                <span>Delete All My Data & Opt-Out</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
