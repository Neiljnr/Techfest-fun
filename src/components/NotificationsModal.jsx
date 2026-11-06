import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsModal = () => {
  const { notifications, markNotificationsRead, setActiveModal } = useApp();

  useEffect(() => {
    if (notifications.some(item => !item.read_at)) markNotificationsRead();
  }, []);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="notif-title"
      onClick={() => setActiveModal(null)}>
      <div className="modal-sheet" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <Bell size={20} color="var(--green-primary)" />
            <h3 className="modal-title" id="notif-title">Notifications</h3>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveModal(null)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ gap: '10px', padding: '16px' }}>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', fontSize: '13px' }}>
              Nothing yet. When someone connects with you, it shows up here.
            </p>
          ) : notifications.map(item => (
            <div key={item.id} className="quest-card" style={{ padding: '12px 14px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px' }}>{item.title}</div>
              {item.body && <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{item.body}</div>}
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                {new Date(item.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
