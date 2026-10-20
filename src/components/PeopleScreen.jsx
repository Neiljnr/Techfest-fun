import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ATTENDEES } from '../data/mockAttendees';
import { ROLES, getAvatarMeta } from '../data/avatars';
import { 
  Search, 
  Filter, 
  Sparkles, 
  UserPlus, 
  Check, 
  Star,
  Users,
  Building
} from 'lucide-react';

export const PeopleScreen = () => {
  const { user, connections, handleQrScan, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const connectedIds = connections.map(c => c.attendeeId);

  const filteredAttendees = MOCK_ATTENDEES.filter(att => {
    if (att.id === user.id) return false;
    const matchesSearch = att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          att.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          att.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || att.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleQuickConnect = (att) => {
    handleQrScan(att.qrToken);
  };

  return (
    <div className="main-content">
      {/* Search & Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>People & Operators</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Connect with builders in Sarau Hall. <strong>Cross-role connections earn +15 pts!</strong>
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '10px 14px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by name, startup or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFF',
              fontSize: '13px',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>

        {/* Role Filters Pill Bar */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          <button
            onClick={() => setSelectedRole('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: selectedRole === 'all' ? '1px solid var(--green-primary)' : '1px solid var(--border-subtle)',
              background: selectedRole === 'all' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: selectedRole === 'all' ? 'var(--green-primary)' : 'var(--text-light)',
              whiteSpace: 'nowrap'
            }}
          >
            All Roles
          </button>

          {ROLES.map(role => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: isSelected ? `1px solid ${role.color}` : '1px solid var(--border-subtle)',
                  background: isSelected ? `${role.color}22` : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? role.color : 'var(--text-light)',
                  whiteSpace: 'nowrap'
                }}
              >
                {role.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredAttendees.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            color: 'var(--text-muted)',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '14px'
          }}>
            No operators found matching your criteria.
          </div>
        ) : (
          filteredAttendees.map(att => {
            const isConnected = connectedIds.includes(att.id);
            const isDiffRole = att.role !== user.role;
            const avatar = getAvatarMeta(att.avatarId);

            return (
              <div
                key={att.id}
                className="quest-card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  border: isConnected ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div 
                      className="avatar-thumbnail"
                      style={{ width: '44px', height: '44px', borderColor: avatar.border }}
                      dangerouslySetInnerHTML={{ __html: avatar.svg }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '800', fontSize: '15px' }}>{att.name}</span>
                        <span className={`role-chip ${att.role}`}>
                          {att.role}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {att.company} · {att.title}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: isDiffRole ? '#00B0FF' : 'var(--green-primary)',
                    background: isDiffRole ? 'rgba(0, 176, 255, 0.12)' : 'rgba(0, 230, 118, 0.12)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {isDiffRole ? '+15 PTS (Bonus)' : '+10 PTS'}
                  </span>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-light)', lineHeight: 1.4 }}>
                  {att.bio}
                </p>

                {/* Interests tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {att.interests.map((tag, i) => (
                    <span 
                      key={i} 
                      style={{ 
                        fontSize: '10.5px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Connect action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                    Token: {att.qrToken}
                  </span>

                  {isConnected ? (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--green-primary)'
                    }}>
                      <Check size={14} strokeWidth={3} /> Connected
                    </span>
                  ) : (
                    <button
                      className="pill-btn-action pill-btn-primary"
                      style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => handleQuickConnect(att)}
                    >
                      <UserPlus size={13} />
                      <span>Plug In</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
