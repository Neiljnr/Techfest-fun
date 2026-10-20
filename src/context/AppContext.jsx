import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { STAGES, INITIAL_STAGE1_QUESTS } from '../data/quests';
import { PARTNERS } from '../data/partners';
import { SESSIONS } from '../data/sessions';
import { INITIAL_SIGNAL_DROPS } from '../data/signalDrops';
import { MOCK_ATTENDEES, FOUNDER_TRACK_ATTENDEES } from '../data/mockAttendees';
import { COMMUNITY_HUBS, getNormalizedHubScore } from '../data/hubs';
import { getTitleForPoints, BADGES } from '../data/ranks';
import { getAvatarMeta, getRoleMeta } from '../data/avatars';

const AppContext = createContext();

// Simple Web Audio API sound generator for snappy feedback
const playTone = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'scan') {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'points') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'stage_clear') {
      // Fanfare
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.15, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.25);
      });
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
};

export const AppProvider = ({ children }) => {
  // Persistent state initialized from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('techfest_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'op-neil-92',
      name: 'Keziah Pam',
      email: 'keziah.pam@gmail.com',
      role: 'builder',
      avatarId: 'av-1',
      ticketType: 'free',
      ticketId: 'JTF26-REG-88219',
      hubId: 'hub-jos-innovators',
      city: 'Jos',
      bio: 'Training local dialect LLMs & building agritech solutions on the Plateau.',
      qrToken: 'JTF26-ATT-KEZIAH-88219',
      isCheckedIn: true, // checked in at Sarau Event Center
      isOnboarded: true,
      hideFromPublicBoard: false
    };
  });

  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('techfest_points');
    return saved ? parseInt(saved, 10) : 5; // Starts with 5 for profile completion
  });

  const [ledger, setLedger] = useState(() => {
    const saved = localStorage.getItem('techfest_ledger');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'led-1',
        questId: 'q-profile',
        title: 'Complete Operator Profile',
        points: 5,
        stage: 1,
        timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: 'Profile setup on onboarding',
        isReversed: false
      }
    ];
  });

  const [stage1Quests, setStage1Quests] = useState(() => {
    const saved = localStorage.getItem('techfest_stage1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_STAGE1_QUESTS;
  });

  // Stage 2: People connections
  const [connections, setConnections] = useState(() => {
    const saved = localStorage.getItem('techfest_connections');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'conn-1',
        attendeeId: 'user-nanret',
        name: 'Nanret P.',
        role: 'founder',
        avatarId: 'av-3',
        isDifferentRole: true,
        pointsAwarded: 15, // 10 connection + 5 role bonus
        confirmedAt: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'conn-2',
        attendeeId: 'user-zainab',
        name: 'Zainab M.',
        role: 'designer',
        avatarId: 'av-5',
        isDifferentRole: true,
        pointsAwarded: 15,
        confirmedAt: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Incoming 2-way pending handshake requests
  const [pendingHandshakes, setPendingHandshakes] = useState([
    {
      id: 'hs-1',
      senderId: 'user-pam',
      name: 'Pam K.',
      role: 'founder',
      avatarId: 'av-4',
      expiresIn: 110, // seconds
      points: 15
    }
  ]);

  // Stage 3: Prompt Blitz status
  const [blitzState, setBlitzState] = useState(() => {
    const saved = localStorage.getItem('techfest_blitz');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      completed: false,
      score: 0,
      correctCount: 0,
      totalAnswered: 0,
      speedBonusTotal: 0,
      completedAt: null
    };
  });

  // Stage 4: Partner visits
  const [partnerVisits, setPartnerVisits] = useState(() => {
    const saved = localStorage.getItem('techfest_partners');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      'partner-pictda': { scanned: true, taskCompleted: true, points: 25 },
      'partner-sarau': { scanned: true, taskCompleted: false, points: 10 }
    };
  });

  // Keynote Capture sessions
  const [capturedSessions, setCapturedSessions] = useState(() => {
    const saved = localStorage.getItem('techfest_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['sess-1'];
  });

  // Signal Drops claimed
  const [claimedDrops, setClaimedDrops] = useState(() => {
    const saved = localStorage.getItem('techfest_drops');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Signal Drops catalog (Admin can add new)
  const [signalDrops, setSignalDrops] = useState(INITIAL_SIGNAL_DROPS);

  // Network simulation & Offline scan queue
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'people', 'plug', 'board', 'admin', 'venue'
  const [activeModal, setActiveModal] = useState(null); // 'scanner', 'stage_detail', 'blitz', 'partner_detail', 'operator_card', 'privacy', 'profile'
  const [modalData, setModalData] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('techfest_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('techfest_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('techfest_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('techfest_stage1', JSON.stringify(stage1Quests));
  }, [stage1Quests]);

  useEffect(() => {
    localStorage.setItem('techfest_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('techfest_blitz', JSON.stringify(blitzState));
  }, [blitzState]);

  useEffect(() => {
    localStorage.setItem('techfest_partners', JSON.stringify(partnerVisits));
  }, [partnerVisits]);

  useEffect(() => {
    localStorage.setItem('techfest_sessions', JSON.stringify(capturedSessions));
  }, [capturedSessions]);

  useEffect(() => {
    localStorage.setItem('techfest_drops', JSON.stringify(claimedDrops));
  }, [claimedDrops]);

  // Toast auto-clear
  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Add points to ledger
  const addPoints = (questId, title, pts, stageNumber, reason) => {
    const newEntry = {
      id: `led-${Date.now()}`,
      questId,
      title,
      points: pts,
      stage: stageNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reason: reason || 'Quest completion',
      isReversed: false
    };

    setPoints(prev => prev + pts);
    setLedger(prev => [newEntry, ...prev]);
    playTone('points');

    showToast(`+${pts} Points!`, `${title} — You dey move!`, 'success');
  };

  // Check stage clear status
  // Stage 1: 25+ pts from Stage 1 quests
  // Stage 2: 5+ confirmed connections
  // Stage 3: Blitz completed with 5+ correct
  // Stage 4: 3+ partner booths visited
  const getStageProgress = (stageNumber) => {
    if (stageNumber === 1) {
      const stage1Pts = ledger
        .filter(entry => entry.stage === 1 && !entry.isReversed)
        .reduce((sum, item) => sum + item.points, 0);
      const isCleared = stage1Pts >= 25;
      return {
        points: Math.min(stage1Pts, 40),
        cap: 40,
        threshold: 25,
        isCleared,
        progressLabel: `${Math.min(stage1Pts, 40)}/40 pts (Needs 25 to clear)`
      };
    }
    if (stageNumber === 2) {
      const count = connections.length;
      const stage2Pts = ledger
        .filter(entry => entry.stage === 2 && !entry.isReversed)
        .reduce((sum, item) => sum + item.points, 0);
      const isCleared = count >= 5;
      return {
        points: Math.min(stage2Pts, 200),
        cap: 200,
        threshold: 5,
        count,
        isCleared,
        progressLabel: `${count}/5 connections confirmed`
      };
    }
    if (stageNumber === 3) {
      const isCleared = blitzState.completed && blitzState.correctCount >= 5;
      return {
        points: blitzState.score,
        cap: 150,
        threshold: 5,
        count: blitzState.correctCount,
        isCleared,
        progressLabel: blitzState.completed
          ? `${blitzState.correctCount}/10 correct (${blitzState.score} pts)`
          : 'Blitz opens mid-event'
      };
    }
    if (stageNumber === 4) {
      const visitedCount = Object.keys(partnerVisits).length;
      const stage4Pts = ledger
        .filter(entry => entry.stage === 4 && !entry.isReversed)
        .reduce((sum, item) => sum + item.points, 0);
      const isCleared = visitedCount >= 3;
      return {
        points: Math.min(stage4Pts, 150),
        cap: 150,
        threshold: 3,
        count: visitedCount,
        isCleared,
        progressLabel: `${visitedCount}/3 partners visited`
      };
    }
    return { points: 0, cap: 100, threshold: 0, isCleared: false };
  };

  const getClearedStagesCount = () => {
    let cleared = 0;
    if (getStageProgress(1).isCleared) cleared++;
    if (getStageProgress(2).isCleared) cleared++;
    if (getStageProgress(3).isCleared) cleared++;
    if (getStageProgress(4).isCleared) cleared++;
    return cleared;
  };

  // Complete a Stage 1 quest
  const completeStage1Quest = (questId, inputUrl = '') => {
    const quest = stage1Quests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    setStage1Quests(prev =>
      prev.map(q => q.id === questId ? { ...q, completed: true, inputUrl } : q)
    );

    addPoints(quest.id, quest.title, quest.points, 1, `Stage 1 task: ${quest.platform || quest.title}`);

    // Check if this clears Stage 1
    const currentPts = ledger.filter(e => e.stage === 1 && !e.isReversed).reduce((s, i) => s + i.points, 0);
    if (currentPts + quest.points >= 25 && currentPts < 25) {
      playTone('stage_clear');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      showToast('Stage 1 Cleared!', 'Stage 1 Boot Up cleared. You dey move!', 'success');
    }
  };

  // Confirm incoming 2-way handshake
  const confirmHandshake = (handshakeId) => {
    const handshake = pendingHandshakes.find(h => h.id === handshakeId);
    if (!handshake) return;

    const isDiff = handshake.role !== user.role;
    const pts = isDiff ? 15 : 10; // 10 connection + 5 role bonus

    const newConn = {
      id: `conn-${Date.now()}`,
      attendeeId: handshake.senderId,
      name: handshake.name,
      role: handshake.role,
      avatarId: handshake.avatarId,
      isDifferentRole: isDiff,
      pointsAwarded: pts,
      confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConnections(prev => [newConn, ...prev]);
    setPendingHandshakes(prev => prev.filter(h => h.id !== handshakeId));

    addPoints(
      `conn-${handshake.senderId}`,
      `Two-Way Connect with ${handshake.name}`,
      pts,
      2,
      isDiff ? `Connection (+10) & Different Role Bonus (+5 for ${handshake.role} ↔ ${user.role})` : 'Connection (+10)'
    );

    if (connections.length + 1 >= 5 && connections.length < 5) {
      playTone('stage_clear');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      showToast('Stage 2 Cleared!', 'Stage 2: Plug In cleared. 5 human connections unlocked!', 'success');
    }
  };

  // Process a QR code scan
  const handleQrScan = (rawCode) => {
    playTone('scan');

    // If offline, queue the scan!
    if (!isOnline) {
      const queueItem = {
        id: `offline-${Date.now()}`,
        code: rawCode,
        timestamp: new Date().toLocaleTimeString()
      };
      setOfflineQueue(prev => [...prev, queueItem]);
      showToast(
        'Offline Scan Saved!',
        'No network, no wahala. We saved it offline & will sync when you are back.',
        'info'
      );
      return { success: true, offline: true };
    }

    // Parse the code type
    // 1. Attendee: JTF26-ATT-[NAME]-[ID]
    if (rawCode.startsWith('JTF26-ATT-')) {
      const match = MOCK_ATTENDEES.find(a => a.qrToken === rawCode || rawCode.includes(a.name.split(' ')[0].toUpperCase()));
      const attendeeName = match ? match.name : 'TechFest Operator';
      const attendeeRole = match ? match.role : 'operator';
      const attendeeAvatar = match ? match.avatarId : 'av-2';
      const attendeeId = match ? match.id : `user-${Date.now()}`;

      // Check if already connected
      if (connections.some(c => c.attendeeId === attendeeId)) {
        playTone('error');
        showToast('Already Connected', `You and ${attendeeName} have already plugged in!`, 'warning');
        return { success: false, reason: 'Already connected' };
      }

      // Check stage 2 cap (max 10 connections for points)
      if (connections.length >= 10) {
        showToast('Stage 2 Cap Reached', 'You have hit the 10-connection point cap, but network link added!', 'info');
      }

      const isDiff = attendeeRole !== user.role;
      const pts = isDiff ? 15 : 10;

      const newConn = {
        id: `conn-${Date.now()}`,
        attendeeId,
        name: attendeeName,
        role: attendeeRole,
        avatarId: attendeeAvatar,
        isDifferentRole: isDiff,
        pointsAwarded: pts,
        confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConnections(prev => [newConn, ...prev]);
      addPoints(
        `conn-${attendeeId}`,
        `Two-Way Connect with ${attendeeName}`,
        pts,
        2,
        isDiff ? `Connection (+10) & Role Bonus (+5 for ${attendeeRole} ↔ ${user.role})` : 'Connection (+10)'
      );

      return { success: true, type: 'attendee', name: attendeeName, points: pts };
    }

    // 2. Partner Booth: JTF26-[PARTNER]-B[NUM]
    if (rawCode.includes('JTF26-') && (rawCode.includes('-B0') || rawCode.includes('-B1'))) {
      const partner = PARTNERS.find(p => p.boothCode === rawCode || rawCode.includes(p.id.split('-')[1].toUpperCase()));
      if (partner) {
        const existing = partnerVisits[partner.id];
        if (existing && existing.scanned) {
          playTone('error');
          showToast('Booth Already Scanned', `You already checked into ${partner.name}!`, 'warning');
          return { success: false, reason: 'Already scanned booth' };
        }

        setPartnerVisits(prev => ({
          ...prev,
          [partner.id]: { ...(prev[partner.id] || {}), scanned: true, points: 10 }
        }));

        addPoints(`partner-booth-${partner.id}`, `Visited ${partner.name}`, 10, 4, `Booth check-in at ${partner.booth}`);

        // Open partner mini task
        setTimeout(() => {
          setModalData(partner);
          setActiveModal('partner_detail');
        }, 500);

        return { success: true, type: 'partner', partner };
      }
    }

    // 3. Keynote Session: JTF26-HALL-[NAME]
    if (rawCode.startsWith('JTF26-HALL-')) {
      const session = SESSIONS.find(s => s.code === rawCode || rawCode.includes(s.id.toUpperCase()));
      if (session) {
        if (capturedSessions.includes(session.id)) {
          playTone('error');
          showToast('Session Already Captured', `You have already recorded attendance for: ${session.title}`, 'warning');
          return { success: false, reason: 'Already captured' };
        }

        setCapturedSessions(prev => [...prev, session.id]);
        addPoints(`session-${session.id}`, `Captured: ${session.title}`, 10, 2, `Session check-in at ${session.hall}`);
        return { success: true, type: 'session', session };
      }
    }

    // 4. Signal Drop: JTF26-SIGNAL-[NAME]
    if (rawCode.startsWith('JTF26-SIGNAL-')) {
      const drop = signalDrops.find(d => d.code === rawCode || rawCode.includes(d.id.toUpperCase()));
      if (drop) {
        if (claimedDrops.includes(drop.id)) {
          playTone('error');
          showToast('Signal Already Claimed', `You have already claimed this drop!`, 'warning');
          return { success: false, reason: 'Already claimed drop' };
        }

        setClaimedDrops(prev => [...prev, drop.id]);
        addPoints(`drop-${drop.id}`, `Signal Drop: ${drop.title}`, drop.points, 2, 'Surprise signal quest claimed!');
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
        return { success: true, type: 'drop', drop };
      }
    }

    // Unknown code fallback
    playTone('error');
    showToast('Invalid QR Code', 'That QR is not recognized or has expired. Find a fresh one and try again.', 'error');
    return { success: false, reason: 'Unrecognized code' };
  };

  // Replay & sync offline queue
  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) {
      showToast('Offline Queue Clean', 'All scans are up to date. No pending records.', 'info');
      return;
    }

    const count = offlineQueue.length;
    offlineQueue.forEach(item => {
      handleQrScan(item.code);
    });

    setOfflineQueue([]);
    showToast('Offline Scans Synced!', `Successfully synchronized ${count} offline scan(s). Points updated!`, 'success');
  };

  // Toggle Network Online/Offline
  const toggleNetwork = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      showToast('Network Restored', 'Back online at Sarau Center! Auto-syncing pending scans...', 'success');
      setTimeout(() => {
        syncOfflineQueue();
      }, 400);
    } else {
      showToast('Offline Mode Activated', 'Simulating weak venue Wi-Fi. Scans will be queued locally.', 'warning');
    }
  };

  // Admin audit ledger reversal
  const reverseLedgerEntry = (entryId, reason) => {
    setLedger(prev =>
      prev.map(item => {
        if (item.id === entryId) {
          setPoints(p => Math.max(0, p - item.points));
          return { ...item, isReversed: true, reversalReason: reason };
        }
        return item;
      })
    );
    showToast('Points Reversed', `Entry ${entryId} has been revoked with audit note.`, 'info');
  };

  // Trigger a new surprise signal drop
  const triggerNewSignalDrop = (dropData) => {
    const newDrop = {
      id: `drop-${Date.now()}`,
      title: dropData.title || 'Flash Arena Challenge',
      badge: '⚡ LIVE DROP',
      points: dropData.points || 20,
      code: `JTF26-SIGNAL-CUSTOM-${Date.now()}`,
      description: dropData.description || 'Announced from the main stage at Sarau Event Center!',
      hint: dropData.hint || 'Sarau Stage Floor',
      active: true,
      claimedCount: 0,
      limit: dropData.limit || 50,
      expiresIn: 'Active Now'
    };

    setSignalDrops(prev => [newDrop, ...prev]);
    showToast('⚡ Signal Drop Broadcasted!', `Live quest: "${newDrop.title}" (+${newDrop.points} pts) is live!`, 'warning');
  };

  // Nigeria Data Protection Act (NDPA) Compliant one-tap deletion
  const deleteMyData = () => {
    localStorage.clear();
    setPoints(0);
    setLedger([]);
    setConnections([]);
    setPendingHandshakes([]);
    setBlitzState({ completed: false, score: 0, correctCount: 0, totalAnswered: 0, speedBonusTotal: 0, completedAt: null });
    setPartnerVisits({});
    setCapturedSessions([]);
    setClaimedDrops([]);
    setUser({
      id: `op-new-${Date.now()}`,
      name: 'Guest Builder',
      email: '',
      role: 'builder',
      avatarId: 'av-1',
      ticketType: 'free',
      ticketId: 'JTF26-GUEST',
      hubId: 'hub-jos-innovators',
      city: 'Jos',
      bio: '',
      qrToken: `JTF26-ATT-GUEST-${Date.now()}`,
      isCheckedIn: false,
      isOnboarded: false,
      hideFromPublicBoard: false
    });
    showToast('Data Erased', 'All local records and personal information have been purged.', 'info');
    setActiveModal(null);
  };

  // Current rank metadata
  const currentRank = getTitleForPoints(points);
  const avatarMeta = getAvatarMeta(user.avatarId);
  const roleMeta = getRoleMeta(user.role);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        points,
        addPoints,
        ledger,
        reverseLedgerEntry,
        currentRank,
        avatarMeta,
        roleMeta,
        stage1Quests,
        completeStage1Quest,
        connections,
        pendingHandshakes,
        confirmHandshake,
        blitzState,
        setBlitzState,
        partnerVisits,
        setPartnerVisits,
        capturedSessions,
        claimedDrops,
        signalDrops,
        triggerNewSignalDrop,
        handleQrScan,
        isOnline,
        toggleNetwork,
        offlineQueue,
        syncOfflineQueue,
        toastMessage,
        showToast,
        currentTab,
        setCurrentTab,
        activeModal,
        setActiveModal,
        modalData,
        setModalData,
        getStageProgress,
        getClearedStagesCount,
        deleteMyData,
        playTone
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
