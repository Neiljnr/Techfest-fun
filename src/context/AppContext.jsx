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

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    return saved;
  } catch (e) {
    return fallback;
  }
};

const readStoredJson = (key, fallback) => {
  const saved = readStorage(key, null);
  if (saved === null) return fallback;

  try {
    return JSON.parse(saved);
  } catch (e) {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Storage may be unavailable in private browsing or restricted environments.
  }
};

const GUEST_USER = () => ({
  id: '',
  name: '',
  email: '',
  role: 'builder',
  avatarId: 'av-1',
  ticketType: 'free',
  ticketId: '',
  hubId: '',
  city: '',
  bio: '',
  qrToken: '',
  isCheckedIn: false,
  isOnboarded: false,
  hideFromPublicBoard: false
});

const isDemoAccount = (profile) => {
  if (!profile) return false;
  const demoEmails = ['keziah.pam@gmail.com'];
  return (
    profile.id === 'op-neil-92' ||
    profile.name === 'Keziah Pam' ||
    demoEmails.includes(String(profile.email || '').toLowerCase())
  );
};

const clearDemoStorage = () => {
  try {
    const keys = [
      'techfest_user',
      'techfest_points',
      'techfest_ledger',
      'techfest_stage1',
      'techfest_connections',
      'techfest_blitz',
      'techfest_partners',
      'techfest_sessions',
      'techfest_drops',
      'techfest_visitor_name'
    ];
    keys.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    // ignore storage restrictions
  }
};

const isValidInvite = (profile) => (
  profile &&
  typeof profile.id === 'string' &&
  typeof profile.name === 'string' &&
  typeof profile.role === 'string'
);

const getInviteFromCode = (rawCode, currentUser) => {
  const code = String(rawCode || '').trim();

  try {
    const joinData = new URL(code).searchParams.get('join');
    if (joinData) {
      const profile = JSON.parse(joinData);
      if (isValidInvite(profile)) return profile;
    }
  } catch (e) {
    // Not an invite URL; try a regular attendee token below.
  }

  const attendee = MOCK_ATTENDEES.find(profile => profile.qrToken === code);
  if (attendee) return attendee;
  if (currentUser.qrToken === code) return currentUser;
  return null;
};

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
    const savedUser = readStoredJson('techfest_user', null);
    if (savedUser && isDemoAccount(savedUser)) {
      clearDemoStorage();
      return GUEST_USER();
    }
    if (savedUser && typeof savedUser.name === 'string' && typeof savedUser.email === 'string') {
      return savedUser;
    }
    return GUEST_USER();
  });

  const [points, setPoints] = useState(() => {
    const saved = readStorage('techfest_points', null);
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [ledger, setLedger] = useState(() => {
    const savedLedger = readStoredJson('techfest_ledger', null);
    if (savedLedger) {
      return savedLedger;
    }
    return [];
  });

  const [stage1Quests, setStage1Quests] = useState(() => {
    const savedStage1 = readStoredJson('techfest_stage1', null);
    if (savedStage1) {
      return savedStage1;
    }
    return INITIAL_STAGE1_QUESTS;
  });

  // Stage 2: People connections
  const [connections, setConnections] = useState(() => {
    const savedConnections = readStoredJson('techfest_connections', null);
    if (savedConnections) {
      return savedConnections;
    }
    return [];
  });

  // Incoming 2-way pending handshake requests
  const [pendingHandshakes, setPendingHandshakes] = useState([]);

  // Stage 3: Prompt Blitz status
  const [blitzState, setBlitzState] = useState(() => {
    const savedBlitz = readStoredJson('techfest_blitz', null);
    if (savedBlitz) {
      return savedBlitz;
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
    const savedPartnerVisits = readStoredJson('techfest_partners', null);
    if (savedPartnerVisits) {
      return savedPartnerVisits;
    }
    return {};
  });

  // Keynote Capture sessions
  const [capturedSessions, setCapturedSessions] = useState(() => {
    const savedSessions = readStoredJson('techfest_sessions', null);
    if (savedSessions) {
      return savedSessions;
    }
    return [];
  });

  // Signal Drops claimed
  const [claimedDrops, setClaimedDrops] = useState(() => {
    const savedDrops = readStoredJson('techfest_drops', null);
    if (savedDrops) {
      return savedDrops;
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
  const [signupMode, setSignupMode] = useState(false);
  const [signupInvite, setSignupInvite] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    writeStorage('techfest_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    writeStorage('techfest_points', points.toString());
  }, [points]);

  useEffect(() => {
    writeStorage('techfest_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    writeStorage('techfest_stage1', JSON.stringify(stage1Quests));
  }, [stage1Quests]);

  useEffect(() => {
    writeStorage('techfest_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    writeStorage('techfest_blitz', JSON.stringify(blitzState));
  }, [blitzState]);

  useEffect(() => {
    writeStorage('techfest_partners', JSON.stringify(partnerVisits));
  }, [partnerVisits]);

  useEffect(() => {
    writeStorage('techfest_sessions', JSON.stringify(capturedSessions));
  }, [capturedSessions]);

  useEffect(() => {
    writeStorage('techfest_drops', JSON.stringify(claimedDrops));
  }, [claimedDrops]);

  useEffect(() => {
    const joinData = new URLSearchParams(window.location.search).get('join');
    if (!joinData) return;

    try {
      const profile = JSON.parse(joinData);
      if (!isValidInvite(profile)) {
        throw new Error('The invite QR does not contain a valid operator profile.');
      }

      setSignupInvite(profile);
      setSignupMode(true);
      setActiveModal('signup');
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
    } catch (error) {
      showToast('Invite Link Invalid', error.message, 'error');
    }
  }, []);

  useEffect(() => {
    if (!user || !user.email || !user.isOnboarded) {
      setActiveModal('signup');
      setCurrentTab('home');
    }
  }, [user.email, user.isOnboarded]);

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

    if (signupMode) {
      const invite = getInviteFromCode(rawCode, user);
      if (!invite) {
        playTone('error');
        showToast('Operator QR Not Recognized', 'Scan a TechFest operator badge QR to continue account setup.', 'warning');
        return { success: false, reason: 'Operator QR not recognized' };
      }
      setSignupInvite(invite);
      setActiveModal('signup');
      return { success: true, type: 'signup_invite', name: invite.name };
    }

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

    // 1. Attendee QR: legacy token or a URL carrying a signup invite.
    const attendeeProfile = getInviteFromCode(rawCode, user);
    if (attendeeProfile) {
      const attendeeName = attendeeProfile.name;
      const attendeeId = attendeeProfile.id;
      const attendeeCode = attendeeProfile.qrToken || attendeeId;

      if (attendeeId === user.id) {
        playTone('error');
        showToast('That Is Your QR', 'Scan another operator badge to view their code.', 'warning');
        return { success: false, reason: 'Cannot view your own QR' };
      }

      showToast('Operator Code Captured', `${attendeeName}'s QR code was read.`, 'info');
      return {
        success: true,
        type: 'attendee_code',
        name: attendeeName,
        code: attendeeCode,
        points: 0
      };
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

  const startSignup = () => {
    setSignupInvite(null);
    setSignupMode(false);
    setActiveModal('signup');
  };

  const cancelSignup = () => {
    setSignupMode(false);
    setSignupInvite(null);
    setActiveModal(null);
  };

  const completeSignup = ({ name, email, role }) => {
    const normalizedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedName) {
      showToast('Name required', 'Please enter your full name before continuing.', 'warning');
      return;
    }

    if (!normalizedEmail || !/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) {
      showToast('Use a valid Gmail address', 'Only Gmail email addresses can be used for this signup flow.', 'warning');
      return;
    }

    const newId = `op-${Date.now()}`;
    const slug = normalizedName.replace(/[^A-Z0-9]+/gi, '-').replace(/^-|-$/g, '').toUpperCase() || 'OPERATOR';
    const newUser = {
      id: newId,
      name: normalizedName,
      email: normalizedEmail,
      role: role || 'builder',
      avatarId: 'av-1',
      ticketType: 'free',
      ticketId: `JTF26-REG-${normalizedEmail.split('@')[0].slice(0, 8).toUpperCase()}`,
      hubId: 'hub-jos-innovators',
      city: 'Jos',
      bio: '',
      qrToken: `JTF26-ATT-${slug}-${Date.now().toString().slice(-6)}`,
      isCheckedIn: true,
      isOnboarded: true,
      hideFromPublicBoard: false
    };

    const nextPoints = 5;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setUser(newUser);
    setPoints(nextPoints);
    setLedger([
      {
        id: `led-profile-${Date.now()}`,
        questId: 'q-profile',
        title: 'Complete Operator Profile',
        points: 5,
        stage: 1,
        timestamp: now,
        reason: 'Profile setup on onboarding',
        isReversed: false
      }
    ]);
    setStage1Quests(INITIAL_STAGE1_QUESTS);
    setPendingHandshakes([]);
    setBlitzState({
      completed: false,
      score: 0,
      correctCount: 0,
      totalAnswered: 0,
      speedBonusTotal: 0,
      completedAt: null
    });

    if (signupInvite) {
      const isDifferentRole = signupInvite.role !== newUser.role;
      const connectionPoints = isDifferentRole ? 15 : 10;
      const newConnection = {
        id: `conn-${Date.now()}`,
        attendeeId: signupInvite.id,
        name: signupInvite.name,
        role: signupInvite.role,
        avatarId: signupInvite.avatarId || 'av-2',
        isDifferentRole,
        pointsAwarded: connectionPoints,
        confirmedAt: now
      };

      setConnections([newConnection]);
      setPoints(connectionPoints + 5);
      setLedger([
        {
          id: `led-profile-${Date.now()}`,
          questId: 'q-profile',
          title: 'Complete Operator Profile',
          points: 5,
          stage: 1,
          timestamp: now,
          reason: 'Profile setup on onboarding',
          isReversed: false
        },
        {
          id: `led-connect-${Date.now()}`,
          questId: `conn-${signupInvite.id}`,
          title: `Connected with ${signupInvite.name}`,
          points: connectionPoints,
          stage: 2,
          timestamp: now,
          reason: 'Joined through an operator invite QR',
          isReversed: false
        }
      ]);
      showToast('Account Created!', `You’re connected with ${signupInvite.name} and saved with your real Gmail account.`, 'success');
    } else {
      setConnections([]);
      setPartnerVisits({});
      setCapturedSessions([]);
      setClaimedDrops([]);
      showToast('Account Created!', `Your real Gmail account for ${normalizedEmail} is now saved in this browser.`, 'success');
    }

    setSignupMode(false);
    setSignupInvite(null);
    setCurrentTab('home');
    setActiveModal(null);
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
        signupMode,
        signupInvite,
        startSignup,
        cancelSignup,
        completeSignup,
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
