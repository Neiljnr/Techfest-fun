import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Flashlight, 
  Camera, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Upload,
  Check
} from 'lucide-react';

export const ScannerModal = () => {
  const { setActiveModal, handleQrScan, showToast } = useApp();
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [capturedTarget, setCapturedTarget] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const reticleRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastProcessedTimeRef = useRef(0);
  const lastScanCheckRef = useRef(0);
  const fileInputRef = useRef(null);
  const barcodeDetectorRef = useRef(null);

  // Initialize camera when modal mounts or facingMode flips
  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      await startCamera(facingMode, isCancelled);
    };

    init();

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [facingMode]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const startCamera = async (mode, isCancelled = false) => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (!isCancelled) {
          setCameraError('Camera access requires HTTPS or is not supported in this browser environment.');
          setCameraActive(false);
        }
        return;
      }

      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 1 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (isCancelled) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      // Check if flashlight / torch capability is available
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
        setTorchSupported(true);
      } else {
        setTorchSupported(false);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        try {
          await videoRef.current.play();
        } catch (e) {
          console.log('Video play caught:', e);
        }
      }

      setCameraActive(true);
      setCameraError(null);
      startScanLoop();
    } catch (err) {
      console.warn('Camera start error:', err);
      if (!isCancelled) {
        let msg = 'Camera permission denied or camera unavailable.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Camera permission was denied. Allow camera access in your browser or enter the event code manually.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          msg = 'No camera was found. Enter the event code manually instead.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          msg = 'Camera is in use by another app. Close background camera apps and try again.';
        }
        setCameraError(msg);
        setCameraActive(false);
      }
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn }]
          });
          setTorchOn(!torchOn);
        } catch (e) {
          showToast('Torch unavailable', 'Could not toggle flashlight on this hardware', 'warning');
        }
      } else {
        showToast('Torch unavailable', 'Flashlight is not supported on this camera', 'warning');
      }
    }
  };

  const processCode = useCallback(async (rawCode) => {
    if (!rawCode) return;

    // Clean and extract code (handle full URL encoding or trailing spaces)
    let cleanCode = String(rawCode).trim();
    if (!/^https?:\/\//i.test(cleanCode)) {
      const match = cleanCode.match(/JTF26-[A-Z0-9_-]+/i);
      if (match) {
        cleanCode = match[0].toUpperCase();
      }
    }

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }

    setCapturedTarget(cleanCode);
    const res = await handleQrScan(cleanCode);
    setScanResult(res);

    if (res && res.success && res.type !== 'partner') {
      setTimeout(() => {
        setActiveModal(null);
      }, 1500);
    }
  }, [handleQrScan, setActiveModal]);

  const startScanLoop = () => {
    const scan = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || !frameRef.current || !reticleRef.current || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        animationFrameRef.current = requestAnimationFrame(scan);
        return;
      }

      const now = Date.now();
      // Throttle scanning to ~120ms intervals for smooth performance and battery life
      if (now - lastScanCheckRef.current > 120) {
        lastScanCheckRef.current = now;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width && height) {
          if (canvas.width !== 512 || canvas.height !== 512) {
            canvas.width = 512;
            canvas.height = 512;
          }

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            const frameBounds = frameRef.current.getBoundingClientRect();
            const targetBounds = reticleRef.current.getBoundingClientRect();
            const scale = Math.max(frameBounds.width / width, frameBounds.height / height);
            const displayedWidth = width * scale;
            const displayedHeight = height * scale;
            const sourceX = Math.max(0, (
              targetBounds.left - frameBounds.left + (displayedWidth - frameBounds.width) / 2
            ) / scale);
            const sourceY = Math.max(0, (
              targetBounds.top - frameBounds.top + (displayedHeight - frameBounds.height) / 2
            ) / scale);
            const sourceWidth = Math.min(targetBounds.width / scale, width - sourceX);
            const sourceHeight = Math.min(targetBounds.height / scale, height - sourceY);
            if (sourceWidth <= 0 || sourceHeight <= 0) {
              animationFrameRef.current = requestAnimationFrame(scan);
              return;
            }
            ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

            let detectedText = null;

            // 1. Hardware accelerated native BarcodeDetector if available
            if ('BarcodeDetector' in window) {
              try {
                if (!barcodeDetectorRef.current) {
                  barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
                }
                const barcodes = await barcodeDetectorRef.current.detect(canvas);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  detectedText = barcodes[0].rawValue;
                }
              } catch (e) {
                // Silently fallback to jsQR
              }
            }

            // 2. Pure JS decoding with jsQR
            if (!detectedText) {
              try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: 'dontInvert'
                });
                if (decoded && decoded.data) {
                  detectedText = decoded.data;
                }
              } catch (err) {
                // Frame read error
              }
            }

            // If a code was detected and cooldown period passed
            if (detectedText && !isProcessingRef.current && (now - lastProcessedTimeRef.current > 2500)) {
              lastProcessedTimeRef.current = now;
              isProcessingRef.current = true;
              processCode(detectedText);
              setTimeout(() => {
                isProcessingRef.current = false;
              }, 2200);
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  };

  // Upload an image containing a QR code from gallery / screenshot
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          processCode(code.data);
        } else {
          showToast('No QR Code Found', 'No readable QR code was detected in that image. Try direct camera scanning or manual entry.', 'warning');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCode(manualCode.trim());
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
        <div ref={frameRef} style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          background: '#020302',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Real Video Element (always mounted so refs attach cleanly) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              videoRef.current?.play().catch(e => console.log('play on metadata:', e));
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: cameraActive ? 'block' : 'none'
            }}
          />

          {/* Hidden Canvas for QR Frame Analysis */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Fallback Camera Placeholder when camera is inactive/error */}
          {!cameraActive && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--text-muted)',
              zIndex: 1
            }}>
              <Camera size={44} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', maxWidth: '320px', margin: '0 auto', color: cameraError ? '#FF8A80' : 'var(--text-muted)' }}>
                {cameraError || 'Initializing camera stream...'}
              </p>
            </div>
          )}

          {/* High-tech Viewfinder reticle */}
          <div ref={reticleRef} style={{
            position: 'absolute',
            width: 'min(78vw, 260px)',
            height: 'min(78vw, 260px)',
            border: scanResult?.success ? '2px solid #00E676' : '2px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '20px',
            pointerEvents: 'none',
            boxShadow: scanResult?.success 
              ? '0 0 35px rgba(0, 230, 118, 0.6), inset 0 0 25px rgba(0, 230, 118, 0.4)'
              : '0 0 25px rgba(0, 230, 118, 0.2), inset 0 0 25px rgba(0, 230, 118, 0.15)',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}>
            {/* Viewfinder corners */}
            <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '24px', height: '24px', borderTop: '4px solid #00E676', borderLeft: '4px solid #00E676', borderTopLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '24px', height: '24px', borderTop: '4px solid #00E676', borderRight: '4px solid #00E676', borderTopRightRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '24px', height: '24px', borderBottom: '4px solid #00E676', borderLeft: '4px solid #00E676', borderBottomLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '24px', height: '24px', borderBottom: '4px solid #00E676', borderRight: '4px solid #00E676', borderBottomRightRadius: '16px' }} />

            {/* Laser scanning line */}
            {cameraActive && !scanResult?.success && (
              <div style={{
                position: 'absolute',
                left: '8px',
                right: '8px',
                height: '2px',
                background: '#00E676',
                boxShadow: '0 0 12px #00E676, 0 0 4px #FFF',
                animation: 'scanLaser 2.2s infinite ease-in-out'
              }} />
            )}

            {/* Target acquired lock overlay */}
            {scanResult?.success && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 230, 118, 0.15)',
                borderRadius: '18px'
              }}>
                <CheckCircle size={48} color="#00E676" style={{ filter: 'drop-shadow(0 0 10px #00E676)' }} />
              </div>
            )}
          </div>

          {/* Viewfinder Controls (Torch, Flip Camera, Upload Image) */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
            zIndex: 3
          }}>
            {/* Gallery / Image Upload */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageFileChange} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
                color: '#FFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
              title="Upload QR Code Image"
            >
              <Upload size={18} />
            </button>

            {/* Camera Switcher (Front/Back) */}
            <button
              onClick={flipCamera}
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
                color: '#FFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
              title="Flip Camera (Front/Back)"
            >
              <RotateCcw size={18} />
            </button>

            {/* Flashlight toggle */}
            {torchSupported && (
              <button
                onClick={toggleTorch}
                style={{
                  background: torchOn ? '#00E676' : 'rgba(0, 0, 0, 0.65)',
                  color: torchOn ? '#000' : '#FFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)'
                }}
                title="Toggle Torch"
              >
                <Flashlight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Scanner actions */}
        <div className="modal-body" style={{ paddingBottom: '30px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Center an organizer-issued event QR or attendee QR inside the frame.
          </p>

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
                  {scanResult.success
                    ? scanResult.code
                      ? `Code: ${scanResult.code}`
                      : `Captured ${scanResult.name || capturedTarget || 'target'}`
                    : scanResult.reason}
                </p>
              </div>
            </div>
          )}

          {/* Fallback Manual Code Entry */}
          <form onSubmit={handleManualSubmit} style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Or enter code / token manually:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter an organizer-issued code"
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
