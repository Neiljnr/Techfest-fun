import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Building2, 
  CheckCircle, 
  Clock, 
  RotateCw, 
  Sparkles,
  MapPin,
  Check,
  Award
} from 'lucide-react';
import QRCode from 'qrcode';

export const PartnerDetailModal = () => {
  const { 
    modalData: partner, 
    setActiveModal, 
    partnerVisits, 
    setPartnerVisits, 
    addPoints, 
    playTone,
    showToast 
  } = useApp();

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [rotatingTimer, setRotatingTimer] = useState(180); // 3 minutes rotating code
  const [selectedTaskOption, setSelectedTaskOption] = useState(null);
  const [taskAnswered, setTaskAnswered] = useState(false);

  if (!partner) return null;

  const visit = partnerVisits[partner.id] || { scanned: false, taskCompleted: false, points: 0 };

  // Generate rotating QR code with timestamp hash simulation
  useEffect(() => {
    const timeSlot = Math.floor(Date.now() / 180000); // 3-min window
    const signedPayload = `${partner.boothCode}-TS${timeSlot}`;

    QRCode.toDataURL(signedPayload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#00E676',
        light: '#0A0E0C'
      }
    }).then(url => {
      setQrDataUrl(url);
    });

    const interval = setInterval(() => {
      setRotatingTimer(prev => (prev <= 1 ? 180 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [partner.boothCode]);

  const handleTaskOption = (idx) => {
    if (taskAnswered || visit.taskCompleted) return;

    setSelectedTaskOption(idx);
    setTaskAnswered(true);

    const isCorrect = idx === partner.task.correctIndex;
    if (isCorrect) {
      playTone('points');
      setPartnerVisits(prev => ({
        ...prev,
        [partner.id]: { ...(prev[partner.id] || {}), scanned: true, taskCompleted: true, points: 25 }
      }));

      addPoints(
        `partner-task-${partner.id}`,
        `${partner.name} Challenge Completed`,
        15,
        4,
        `Completed 2-minute booth automation challenge`
      );
      showToast('Challenge Cleared!', `+15 pts from ${partner.name}!`, 'success');
    } else {
      playTone('error');
      showToast('Incorrect', 'Review the prompt and try again!', 'warning');
      setTimeout(() => setTaskAnswered(false), 1200);
    }
  };

  const minutesLeft = Math.floor(rotatingTimer / 60);
  const secondsLeft = rotatingTimer % 60;

  return (
    <div className="modal-overlay">
      <div 
        className="modal-sheet" 
        style={{ 
          height: '88vh', 
          maxHeight: '88vh',
          borderTop: `2px solid ${partner.color}`
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Building2 size={20} color={partner.color} />
            <div>
              <h3 className="modal-title">{partner.name}</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {partner.booth} · {partner.category}
              </p>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Description */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid var(--border-subtle)'
          }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: partner.color, marginBottom: '4px' }}>
              {partner.tagline}
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-light)', lineHeight: 1.45 }}>
              {partner.description}
            </p>
          </div>

          {/* Rotating QR Display (PRD Q3 & M3) */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '11.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Booth Screen Live Code
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00E676', fontWeight: '700' }}>
                <Clock size={12} />
                Rotates in {minutesLeft}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </span>
            </div>

            {qrDataUrl && (
              <div style={{
                padding: '10px',
                background: '#0A0E0C',
                borderRadius: '12px',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                boxShadow: '0 0 20px rgba(0, 230, 118, 0.15)'
              }}>
                <img 
                  src={qrDataUrl} 
                  alt="Rotating Partner QR" 
                  style={{ width: '150px', height: '150px', display: 'block' }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '4px 8px',
                borderRadius: '6px',
                color: 'var(--text-muted)'
              }}>
                {partner.boothCode}
              </span>
              {visit.scanned && (
                <span style={{
                  fontSize: '11px',
                  color: 'var(--green-primary)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Check size={13} strokeWidth={3} /> Booth Checked In (+10 pts)
                </span>
              )}
            </div>
          </div>

          {/* 2-Minute Partner Micro Task */}
          <div style={{
            background: 'rgba(255, 64, 129, 0.06)',
            border: '1px solid rgba(255, 64, 129, 0.25)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF4081', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                ⚡ 2-Minute Booth Challenge
              </span>
              <span style={{
                background: visit.taskCompleted ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 64, 129, 0.2)',
                color: visit.taskCompleted ? 'var(--green-primary)' : '#FF4081',
                fontSize: '11.5px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {visit.taskCompleted ? 'COMPLETED (+15 PTS)' : '+15 PTS'}
              </span>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFF' }}>
              {partner.task.title}
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-light)' }}>
              {partner.task.prompt}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {partner.task.options.map((opt, idx) => {
                const isSelected = selectedTaskOption === idx;
                const isDone = visit.taskCompleted && idx === partner.task.correctIndex;

                return (
                  <button
                    key={idx}
                    onClick={() => handleTaskOption(idx)}
                    disabled={visit.taskCompleted}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      textAlign: 'left',
                      fontSize: '12.5px',
                      cursor: visit.taskCompleted ? 'default' : 'pointer',
                      border: isDone || (taskAnswered && idx === partner.task.correctIndex)
                        ? '1.5px solid #00E676'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isDone || (taskAnswered && idx === partner.task.correctIndex)
                        ? 'rgba(0, 230, 118, 0.15)'
                        : 'rgba(255, 255, 255, 0.03)',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <span>{opt}</span>
                    {(isDone || (taskAnswered && idx === partner.task.correctIndex)) && (
                      <CheckCircle size={16} color="#00E676" />
                    )}
                  </button>
                );
              })}
            </div>

            {visit.taskCompleted && (
              <div style={{
                background: 'rgba(0, 230, 118, 0.1)',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                color: 'var(--text-light)'
              }}>
                🎉 {partner.task.rewardText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
