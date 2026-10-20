import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Flashlight, 
  Camera, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Keyboard,
  Building2,
  Users,
  Radio,
  Flame
} from 'lucide-react';

export const ScannerModal = () => {
  const { setActiveModal, handleQrScan, showToast, isOnline } = useApp();
  const [torchOn, setTorchOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setCameraError(null);
      } else {
        setCameraError('Camera API not accessible in this environment. Use test triggers or manual entry below.');
      }
    } catch (err) {
      console.log('Camera error:', err);
      setCameraError('Camera permission denied or camera unavailable. Test buttons ready below!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleTorch = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        track.applyConstraints({
          advanced: [{ torch: !torchOn }]
        }).then(() => setTorchOn(!torchOn))
          .catch(() => showToast('Torch unavailable', 'Flashlight is not supported on this camera', 'warning'));
      } else {
        setTorchOn(!torchOn);
        showToast('Torch toggled', torchOn ? 'Torch turned off' : 'Torch turned on', 'info');
      }
    } else {
      setTorchOn(!torchOn);
    }
  };

  const processCode = (code) => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    const res = handleQrScan(code);
    setScanResult(res);

    if (res && res.success) {
      setTimeout(() => {
        setActiveModal(null);
      }, 1400);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCode(manualCode.trim().toUpperCase());
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-sheet" 
        style={{ 
          height: '92vh', 
          maxHeight: '92vh',
          background: '#070A08',
          borderTop: '2px solid var(--green-primary)'
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Camera size={20} color="var(--green-primary)" />
            <h3 className="modal-title">Universal QR Scanner</h3>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          background: '#020302',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--text-muted)'
            }}>
              <Camera size={44} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>
                {cameraError || 'Camera active. Point at any TechFest badge, booth, or session QR.'}
              </p>
            </div>
          )}

          {/* High-tech Viewfinder reticle */}
          <div style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            border: '2px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '20px',
            pointerEvents: 'none',
            boxShadow: '0 0 25px rgba(0, 230, 118, 0.2), inset 0 0 25px rgba(0, 230, 118, 0.15)'
          }}>
            {/* Viewfinder corners */}
            <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '24px', height: '24px', borderTop: '4px solid #00E676', borderLeft: '4px solid #00E676', borderTopLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '24px', height: '24px', borderTop: '4px solid #00E676', borderRight: '4px solid #00E676', borderTopRightRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '24px', height: '24px', borderBottom: '4px solid #00E676', borderLeft: '4px solid #00E676', borderBottomLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '24px', height: '24px', borderBottom: '4px solid #00E676', borderRight: '4px solid #00E676', borderBottomRightRadius: '16px' }} />

            {/* Laser scanning line */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '10px',
              right: '10px',
              height: '2px',
              background: '#00E676',
              boxShadow: '0 0 10px #00E676',
              animation: 'pulse-glow 1.5s infinite ease-in-out'
            }} />
          </div>

          {/* Flashlight toggle */}
          <button
            onClick={toggleTorch}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: torchOn ? '#00E676' : 'rgba(0, 0, 0, 0.6)',
              color: torchOn ? '#000' : '#FFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Toggle Torch"
          >
            <Flashlight size={18} />
          </button>
        </div>

        {/* Body & Fast Test Simulator */}
        <div className="modal-body" style={{ paddingBottom: '30px' }}>
          {/* Scan result status */}
          {scanResult && (
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              background: scanResult.success ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 82, 82, 0.15)',
              border: `1px solid ${scanResult.success ? '#00E676' : '#FF5252'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {scanResult.success ? (
                <CheckCircle size={20} color="#00E676" />
              ) : (
                <AlertCircle size={20} color="#FF5252" />
              )}
              <div style={{ fontSize: '13px' }}>
                <span style={{ fontWeight: '700', color: '#FFF' }}>
                  {scanResult.success ? 'Scan Verified!' : 'Scan Issue'}
                </span>
                <p style={{ color: 'var(--text-light)', marginTop: '2px' }}>
                  {scanResult.success ? `Captured ${scanResult.name || 'target'}` : scanResult.reason}
                </p>
              </div>
            </div>
          )}

          {/* Instant Simulation Buttons (Essential for Desktop & Testing on any screen) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--green-primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                ⚡ Test Code Simulator (All Targets)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Tap to simulate real scan
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {/* 1. Attendee Scan */}
              <button
                className="share-btn"
                onClick={() => processCode('JTF26-ATT-NANRET-4519')}
                style={{ textAlign: 'left', padding: '10px', height: 'auto', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00B0FF', fontWeight: '700', fontSize: '12px' }}>
                  <Users size={14} />
                  <span>Connect: Nanret P.</span>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  Founder Role (+15 pts with Bonus)
                </span>
              </button>

              {/* 2. Partner Booth PICTDA */}
              <button
                className="share-btn"
                onClick={() => processCode('JTF26-PICTDA-B01')}
                style={{ textAlign: 'left', padding: '10px', height: 'auto', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00E676', fontWeight: '700', fontSize: '12px' }}>
                  <Building2 size={14} />
                  <span>Booth 01: PICTDA</span>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  State AI Agency (+10 pts)
                </span>
              </button>

              {/* 3. Partner Booth Sarau */}
              <button
                className="share-btn"
                onClick={() => processCode('JTF26-SARAU-B02')}
                style={{ textAlign: 'left', padding: '10px', height: 'auto', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFD700', fontWeight: '700', fontSize: '12px' }}>
                  <Building2 size={14} />
                  <span>Booth 02: Sarau Hub</span>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  Venue Logistics (+10 pts)
                </span>
              </button>

              {/* 4. Keynote Hall 1 */}
              <button
                className="share-btn"
                onClick={() => processCode('JTF26-HALL-KEYNOTE1')}
                style={{ textAlign: 'left', padding: '10px', height: 'auto', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7C4DFF', fontWeight: '700', fontSize: '12px' }}>
                  <Radio size={14} />
                  <span>Opening Keynote</span>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  Sarau Main Arena (+10 pts)
                </span>
              </button>

              {/* 5. Golden Drop Coffee */}
              <button
                className="share-btn"
                onClick={() => processCode('JTF26-SIGNAL-GOLDEN-COFFEE')}
                style={{ gridColumn: 'span 2', textAlign: 'left', padding: '10px', background: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.3)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFD700', fontWeight: '700', fontSize: '12px' }}>
                  <Flame size={15} />
                  <span>Golden QR at Coffee Station (Flash Drop)</span>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>
                  First 50 operators claim surprise +25 bonus points!
                </span>
              </button>
            </div>
          </div>

          {/* Fallback Manual Code Entry (Q6) */}
          <form onSubmit={handleManualSubmit} style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Or type a code manually if camera is obstructed:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. JTF26-ATT-NANRET-4519"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#FFF',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
              <button
                type="submit"
                className="pill-btn-action pill-btn-primary"
                style={{ width: 'auto', padding: '0 18px', fontSize: '13px' }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
