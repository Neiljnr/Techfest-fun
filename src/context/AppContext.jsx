import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_STAGE1_QUESTS } from '../data/quests';
import { PARTNERS } from '../data/partners';
import { getTitleForPoints } from '../data/ranks';
import { getAvatarMeta, getRoleMeta } from '../data/avatars';
import { isNeonConfigured as isSupabaseConfigured, neon as supabase } from '../lib/neon';

const PENDING_SIGNUP_KEY = 'techfest-pending-signup';
const SNAPSHOT_KEY = 'techfest-snapshot';

const readPendingSignup = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_SIGNUP_KEY) || 'null');
  } catch {
    return null;
  }
};

const AppContext = createContext(null);
const EMPTY_BLITZ = {
  completed: false,
  score: 0,
  correctCount: 0,
  totalAnswered: 0,
  speedBonusTotal: 0,
  completedAt: null
};
const OFFLINE_QUEUE_KEY = 'techfest_prod_offline_queue_v1';

const readOfflineQueue = () => {
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Unable to read the offline scan queue.', error);
    return [];
  }
};

const saveOfflineQueue = (queue) => {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Unable to persist the offline scan queue.', error);
    throw new Error('This device could not save the scan for later synchronization.');
  }
};

const mapProfile = (profile, authUser) => ({
  id: profile.id,
  name: profile.name,
  email: authUser.email || '',
  role: profile.role,
  avatarId: profile.avatar_id,
  ticketType: 'attendee',
  ticketId: `JTF26-${profile.id.slice(0, 8).toUpperCase()}`,
  hubId: profile.hub_id,
  city: 'Jos',
  bio: profile.bio,
  company: profile.company,
  qrToken: profile.qr_token,
  isCheckedIn: false,
  isOnboarded: true,
  hideFromPublicBoard: profile.hide_from_public_board
});

const mapLedgerEntry = (entry) => ({
  id: entry.id,
  questId: entry.event_key,
  title: entry.title,
  points: entry.points,
  stage: entry.stage,
  timestamp: new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  reason: entry.reason,
  isReversed: Boolean(entry.reversed_at),
  reversalReason: entry.reversal_reason,
  attendeeName: entry.attendee_name,
  attendeeRole: entry.attendee_role
});

const mapConnection = (row, userId, userRole, ownLedger) => {
  const isRequester = row.requester_id === userId;
  const attendeeId = isRequester ? row.recipient_id : row.requester_id;
  const awardedEntry = ownLedger.find(entry =>
    entry.questId === `connection:${attendeeId}` && !entry.isReversed
  );
  return {
    id: row.id,
    attendeeId,
    name: isRequester ? row.recipient_name : row.requester_name,
    role: isRequester ? row.recipient_role : row.requester_role,
    avatarId: isRequester ? row.recipient_avatar_id : row.requester_avatar_id,
    status: row.status,
    isDifferentRole: (isRequester ? row.recipient_role : row.requester_role) !== userRole,
    pointsAwarded: awardedEntry?.points || 0,
    confirmedAt: row.confirmed_at
      ? new Date(row.confirmed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null
  };
};

const playTone = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    const now = context.currentTime;
    if (type === 'error') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.linearRampToValueAtTime(80, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      return;
    }
    oscillator.frequency.setValueAtTime(type === 'scan' ? 587.33 : 659.25, now);
    oscillator.frequency.setValueAtTime(type === 'scan' ? 880 : 783.99, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    oscillator.start(now);
    oscillator.stop(now + 0.25);
  } catch (error) {
    console.warn('Audio feedback is unavailable.', error);
  }
};

export const AppProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [points, setPoints] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [adminLedger, setAdminLedger] = useState([]);
  const [stage1Quests, setStage1Quests] = useState(INITIAL_STAGE1_QUESTS);
  const [connections, setConnections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const seenNotificationIds = useRef(null);
  const [blitzState, setBlitzState] = useState(EMPTY_BLITZ);
  const [partnerVisits, setPartnerVisits] = useState({});
  const [capturedSessions, setCapturedSessions] = useState([]);
  const [claimedDrops, setClaimedDrops] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [signalDrops, setSignalDrops] = useState([]);
  const [staffEventCodes, setStaffEventCodes] = useState([]);
  const [staffQuizQuestions, setStaffQuizQuestions] = useState([]);
  const [stageSettings, setStageSettings] = useState({ 1: true, 2: true, 3: false, 4: false });
  const loadedUserRef = useRef(null);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(readOfflineQueue);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [signupMode, setSignupMode] = useState(true);
  const [signupInvite, setSignupInvite] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    window.setTimeout(() => setToastMessage(null), 4500);
  };

  const showError = (title, error) => {
    console.error(title, error);
    showToast(title, error?.message || 'The request could not be completed. Please try again.', 'error');
  };

  const applySnapshot = (snapshot) => {
    setUser(snapshot.user);
    setLedger(snapshot.ledger);
    setPoints(snapshot.points);
    setStage1Quests(snapshot.quests);
    setConnections(snapshot.connections);
    setBlitzState(snapshot.blitz);
    setPartnerVisits(snapshot.partnerVisits);
    setCapturedSessions(snapshot.capturedSessions);
    setClaimedDrops(snapshot.claimedDrops);
    setAttendees(snapshot.attendees);
    setLeaderboard(snapshot.leaderboard);
    setSignalDrops(snapshot.drops);
    setIsAdmin(snapshot.isAdmin);
    setStageSettings(snapshot.stages);
  };

  const refreshData = async (authUser = session?.user) => {
    if (!isSupabaseConfigured || !authUser) return;
    // Background refreshes must not blank the screen or close open popups.
    let firstLoad = loadedUserRef.current !== authUser.id;
    if (firstLoad) {
      // Paint the last known state instantly; fresh data replaces it a moment later.
      try {
        const cached = JSON.parse(localStorage.getItem(`${SNAPSHOT_KEY}:${authUser.id}`) || 'null');
        if (cached?.user) {
          applySnapshot(cached);
          loadedUserRef.current = authUser.id;
          firstLoad = false;
        }
      } catch { /* ignore a corrupt cache */ }
    }
    if (firstLoad) {
      setDataLoading(true);
      setBackendError('');
    }
    try {
      const pending = readPendingSignup();
      const hasPending = pending?.email === authUser.email?.toLowerCase();
      // One parallel round trip. Staff-only views simply return nothing for normal attendees.
      const fetchAll = () => Promise.all([
        supabase.from('profiles').select('*').eq('id', authUser.id).single(),
        supabase.from('participant_state').select('*').eq('user_id', authUser.id).single(),
        supabase.from('point_ledger').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
        supabase.from('my_connections').select('*').order('created_at', { ascending: false }),
        supabase.from('attendee_directory').select('*').order('name'),
        supabase.from('leaderboard').select('*').order('points', { ascending: false }),
        supabase.from('active_event_catalog').select('*').order('title'),
        supabase.rpc('get_event_access'),
        supabase.from('stage_settings').select('*'),
        supabase.from('staff_ledger').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('staff_event_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('staff_quiz_questions').select('*').order('sort_order', { ascending: true })
      ]);
      let results = await fetchAll();
      // Only new accounts (or a pending signup) need the profile created first.
      if (hasPending || results[0].error || results[1].error) {
        const { error: profileError } = await supabase.rpc('ensure_profile', {
          p_name: hasPending ? pending.name : null,
          p_role: hasPending ? pending.role : null
        });
        if (profileError) throw profileError;
        localStorage.removeItem(PENDING_SIGNUP_KEY);
        results = await fetchAll();
      }
      const [profileResult, stateResult, ledgerResult, connectionsResult,
        attendeesResult, boardResult, catalogResult, accessResult, stagesResult,
        staffLedgerResult, eventCodesResult, staffQuizResult] = results;
      const failed = results.slice(0, 9).find(result => result.error);
      if (failed) throw failed.error;

      const currentUser = mapProfile(profileResult.data, authUser);
      const ownLedger = ledgerResult.data.map(mapLedgerEntry);
      const totalPoints = ownLedger
        .filter(entry => !entry.isReversed && !entry.title.startsWith('Reversal:'))
        .reduce((sum, entry) => sum + entry.points, 0);
      const staff = Boolean(accessResult.data?.is_staff);
      const connectionRows = connectionsResult.data;
      const confirmed = connectionRows
        .filter(row => row.status === 'confirmed')
        .map(row => mapConnection(row, authUser.id, currentUser.role, ownLedger));
      const questRows = INITIAL_STAGE1_QUESTS.map(quest => ({
        ...quest,
        completed: ownLedger.some(entry =>
          entry.questId === (quest.id === 'q-profile' ? 'profile-created' : quest.id)
        )
      }));
      const state = stateResult.data;
      const boardRows = boardResult.data.map(row => ({
        id: row.id,
        name: row.name,
        role: row.role,
        avatarId: row.avatar_id,
        hubId: row.hub_id,
        points: row.points
      }));
      const directoryRows = attendeesResult.data.map(row => ({
        id: row.id,
        name: row.name,
        role: row.role,
        avatarId: row.avatar_id,
        hubId: row.hub_id,
        bio: row.bio,
        company: row.company,
        title: row.company || row.role
      }));
      const drops = catalogResult.data
        .filter(item => item.kind === 'signal')
        .map(item => ({ ...item, active: true }));

      const snapshot = {
        user: currentUser,
        ledger: ownLedger,
        points: totalPoints,
        quests: questRows,
        connections: confirmed,
        blitz: state.blitz_state || EMPTY_BLITZ,
        partnerVisits: state.partner_visits || {},
        capturedSessions: state.captured_sessions || [],
        claimedDrops: state.claimed_drops || [],
        attendees: directoryRows,
        leaderboard: boardRows,
        drops,
        isAdmin: staff,
        stages: Object.fromEntries(stagesResult.data.map(row => [row.stage, row.active]))
      };
      applySnapshot(snapshot);
      try {
        localStorage.setItem(`${SNAPSHOT_KEY}:${authUser.id}`, JSON.stringify(snapshot));
      } catch { /* storage full or unavailable: cache is optional */ }
      loadedUserRef.current = authUser.id;

      if (staff) {
        if (staffLedgerResult.error) throw staffLedgerResult.error;
        if (eventCodesResult.error) throw eventCodesResult.error;
        if (staffQuizResult.error) throw staffQuizResult.error;
        setAdminLedger(staffLedgerResult.data.map(mapLedgerEntry));
        setStaffEventCodes(eventCodesResult.data);
        setStaffQuizQuestions(staffQuizResult.data);
      } else {
        setAdminLedger([]);
        setStaffEventCodes([]);
        setStaffQuizQuestions([]);
      }
    } catch (error) {
      if (firstLoad) setBackendError(error.message || 'Could not load your account data.');
      throw error;
    } finally {
      if (firstLoad) setDataLoading(false);
    }
  };

  const mapBoardRows = rows => rows.map(row => ({
    id: row.id,
    name: row.name,
    role: row.role,
    avatarId: row.avatar_id,
    hubId: row.hub_id,
    points: row.points
  }));

  const refreshLeaderboard = async () => {
    const { data, error } = await supabase.from('leaderboard').select('*').order('points', { ascending: false });
    if (error) return;
    setLeaderboard(mapBoardRows(data));
  };

  // Lightweight live poll: board, own notifications, and own score
  const pollLive = async (authUser) => {
    const [boardResult, notifResult, stagesResult] = await Promise.all([
      supabase.from('leaderboard').select('*').order('points', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('stage_settings').select('*')
    ]);
    if (!boardResult.error) setLeaderboard(mapBoardRows(boardResult.data));
    if (!stagesResult.error) {
      setStageSettings(Object.fromEntries(stagesResult.data.map(row => [row.stage, row.active])));
    }
    if (notifResult.error) return;
    const rows = notifResult.data;
    setNotifications(rows);
    if (seenNotificationIds.current === null) {
      seenNotificationIds.current = new Set(rows.map(row => row.id));
      return;
    }
    const fresh = rows.filter(row => !seenNotificationIds.current.has(row.id));
    if (fresh.length) {
      fresh.forEach(row => seenNotificationIds.current.add(row.id));
      playTone('points');
      showToast(fresh[0].title, fresh[0].body || '', 'success');
      refreshData(authUser).catch(() => {});
    }
  };

  const markNotificationsRead = async () => {
    setNotifications(rows => rows.map(row => ({ ...row, read_at: row.read_at || new Date().toISOString() })));
    await supabase.rpc('mark_notifications_read');
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) showError('Could not restore sign-in', error);
      setSession(data?.session || null);
      setAuthLoading(false);
    });
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      loadedUserRef.current = null;
      if (!authLoading) {
        Object.keys(localStorage)
          .filter(key => key.startsWith(`${SNAPSHOT_KEY}:`))
          .forEach(key => localStorage.removeItem(key));
      }
      setUser(null);
      setIsAdmin(false);
      setDataLoading(false);
      return;
    }
    refreshData(session.user).catch(error => showError('Account data unavailable', error));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user) {
      seenNotificationIds.current = null;
      setNotifications([]);
      return undefined;
    }
    const authUser = session.user;
    const tick = () => {
      if (document.visibilityState === 'visible') pollLive(authUser);
    };
    const interval = window.setInterval(tick, 4000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    try {
      saveOfflineQueue(offlineQueue);
    } catch (error) {
      showError('Offline scan was not saved', error);
    }
  }, [offlineQueue]);

  const sendLoginCode = async ({ name, email, role, createAccount }) => {
    if (!isSupabaseConfigured) {
      showToast('Backend setup required', 'Add the Neon Auth and Data API URLs to the environment before signing in.', 'error');
      return false;
    }
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (createAccount) {
      localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
        email: normalizedEmail, name: String(name || '').trim(), role
      }));
    }
    const options = { shouldCreateUser: Boolean(createAccount) };
    const { error } = await supabase.auth.signInWithOtp({ email: normalizedEmail, options });
    if (error) {
      showError('Could not send verification code', error);
      return false;
    }
    showToast('Check your email', `A one-time sign-in code was sent to ${normalizedEmail}.`, 'success');
    return true;
  };

  const signUpWithPassword = async ({ name, email, password, role }) => {
    if (!isSupabaseConfigured) return false;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
      email: normalizedEmail, name: String(name || '').trim(), role
    }));
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name: String(name || '').trim() } }
    });
    if (error) {
      showError('Could not create account', error);
      return false;
    }
    if (data?.session) setSession(data.session);
    return true;
  };

  const signInWithPassword = async ({ email, password }) => {
    if (!isSupabaseConfigured) return false;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || '').trim().toLowerCase(),
      password
    });
    if (error) {
      showError('Could not sign in', error);
      return false;
    }
    if (data?.session) setSession(data.session);
    return true;
  };

  const verifyLoginCode = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: String(email || '').trim().toLowerCase(),
      token: String(token || '').trim(),
      type: 'email'
    });
    if (error) {
      showError('Verification failed', error);
      return false;
    }
    // The Neon adapter does not always emit SIGNED_IN after OTP verification.
    if (data?.session) setSession(data.session);
    return true;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Could not sign out', error);
      return false;
    }
    setSession(null);
    setCurrentTab('home');
    setActiveModal(null);
    return true;
  };

  const updateProfile = async (updates) => {
    if (!user) return false;
    const { error } = await supabase.from('profiles').update({
      name: updates.name,
      avatar_id: updates.avatarId,
      hub_id: updates.hubId,
      bio: updates.bio ?? user.bio,
      company: updates.company ?? user.company,
      hide_from_public_board: updates.hideFromPublicBoard ?? user.hideFromPublicBoard
    }).eq('id', user.id);
    if (error) {
      showError('Profile could not be saved', error);
      return false;
    }
    await refreshData();
    showToast('Profile updated', 'Your account changes are synced.', 'success');
    return true;
  };

  const deleteMyData = async () => {
    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      showError('Account deletion failed', error);
      return false;
    }
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      showError('Account deleted, but sign-out failed', signOutError);
      return false;
    }
    setActiveModal(null);
    showToast('Account deleted', 'Your profile, connections, and score history have been removed.', 'info');
    return true;
  };

  const completeStage1Quest = async (questId, inputUrl = '') => {
    if (stage1Quests.find(quest => quest.id === questId)?.completed) return false;
    const { error } = await supabase.rpc('complete_stage_quest', {
      p_quest_id: questId,
      p_input_url: inputUrl
    });
    if (error) {
      showError('Quest could not be completed', error);
      return false;
    }
    await refreshData();
    playTone('points');
    showToast('Quest completed', 'Your points were recorded by the event server.', 'success');
    return true;
  };

  const completePartnerTask = async (partnerId, answer) => {
    const { data, error } = await supabase.rpc('complete_partner_task', {
      p_partner_id: partnerId,
      p_answer: answer
    });
    if (error) {
      showError('Challenge could not be submitted', error);
      return false;
    }
    if (!data?.correct) {
      playTone('error');
      showToast('Incorrect answer', 'Try again. The event server checks each answer.', 'warning');
      return false;
    }
    await refreshData();
    playTone('points');
    showToast('Challenge cleared', 'Your points were recorded by the event server.', 'success');
    return true;
  };

  const submitPromptBlitz = async (answers) => {
    const { data, error } = await supabase.rpc('submit_prompt_blitz', { p_answers: answers });
    if (error) {
      showError('Quiz could not be submitted', error);
      return null;
    }
    refreshData().catch(() => {});
    return data;
  };

  const fetchQuizQuestions = async () => {
    const { data, error } = await supabase.from('quiz_questions_public').select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      showError('Quiz questions could not be loaded', error);
      return [];
    }
    return data;
  };

  const setStageActive = async (stage, active) => {
    const { error } = await supabase.rpc('staff_set_stage_active', { p_stage: stage, p_active: active });
    if (error) {
      showError('Stage could not be updated', error);
      return false;
    }
    setStageSettings(previous => ({ ...previous, [stage]: active }));
    showToast(active ? `Stage ${stage} opened` : `Stage ${stage} closed`,
      active ? 'All attendees were notified.' : 'Attendees can no longer score in this stage.', 'success');
    return true;
  };

  const saveQuizQuestion = async (question) => {
    const { error } = await supabase.rpc('staff_save_quiz_question', {
      p_id: question.id || null,
      p_sort_order: Number(question.sort_order ?? question.sortOrder) || 0,
      p_topic: question.topic || '',
      p_question: question.question,
      p_options: question.options,
      p_correct_index: Number(question.correct_index ?? question.correctIndex),
      p_explanation: question.explanation || '',
      p_active: question.active !== false
    });
    if (error) {
      showError('Question could not be saved', error);
      return false;
    }
    await refreshStaffQuiz();
    showToast('Question saved', 'The quiz is updated for everyone.', 'success');
    return true;
  };

  const deleteQuizQuestion = async (id) => {
    const { error } = await supabase.rpc('staff_delete_quiz_question', { p_id: id });
    if (error) {
      showError('Question could not be deleted', error);
      return false;
    }
    await refreshStaffQuiz();
    return true;
  };

  const refreshStaffQuiz = async () => {
    const { data, error } = await supabase.from('staff_quiz_questions').select('*')
      .order('sort_order', { ascending: true });
    if (!error) setStaffQuizQuestions(data);
  };

  const handleQrScan = async (rawCode, isSyncingOffline = false) => {
    const code = String(rawCode || '').trim();
    if (!code) return { success: false, reason: 'Empty code' };
    playTone('scan');

    if (!user) {
      showToast('Sign in to scan', 'Verify your email before recording event activity.', 'warning');
      return { success: false, reason: 'Authentication required' };
    }

    if (!navigator.onLine && !isSyncingOffline) {
      const queueItem = { id: crypto.randomUUID(), code, createdAt: new Date().toISOString() };
      setOfflineQueue(previous => (
        previous.some(item => item.code === code) ? previous : [...previous, queueItem]
      ));
      showToast('Scan saved offline', 'It will be submitted when the connection returns.', 'info');
      return { success: true, offline: true };
    }

    const attendeeToken = code.match(/^JTF26-ATT-([0-9a-f-]{36})$/i);
    try {
      if (attendeeToken) {
        const { data, error } = await supabase.rpc('request_connection', {
          p_qr_token: attendeeToken[1]
        });
        if (error) throw error;
        await refreshData();
        playTone('points');
        showToast(`Connected with ${data.name}`, `+${data.points} points`, 'success');
        return { success: true, type: 'attendee', name: data.name };
      }

      const { data, error } = await supabase.rpc('claim_event_code', { p_code: code });
      if (error) {
        if (/already claimed/i.test(error.message)) {
          await refreshData();
          return { success: true, alreadyProcessed: true };
        }
        throw error;
      }
      await refreshData();
      playTone('points');
      showToast(`+${data.points} points`, data.title, 'success');
      if (data.kind === 'partner') {
        const partner = PARTNERS.find(item => item.id === data.event_id);
        if (partner) {
          setModalData(partner);
          setActiveModal('partner_detail');
        }
      }
      return { success: true, type: data.kind, ...data };
    } catch (error) {
      if (isSyncingOffline && /already exists/i.test(error.message || '')) {
        return { success: true, alreadyProcessed: true };
      }
      showError('QR scan rejected', error);
      return { success: false, reason: error.message };
    }
  };

  const syncOfflineQueue = async () => {
    if (!navigator.onLine) {
      showToast('No connection', 'Connect to the internet before syncing saved scans.', 'warning');
      return;
    }
    const failed = [];
    for (const item of offlineQueue) {
      const result = await handleQrScan(item.code, true);
      if (!result.success || result.offline) failed.push(item);
    }
    setOfflineQueue(failed);
    if (failed.length) {
      showToast('Some scans need attention', `${failed.length} scan(s) could not be synchronized.`, 'warning');
    } else {
      showToast('Scans synchronized', 'All saved scans were submitted to the event server.', 'success');
    }
  };

  const createEventCode = async ({
    kind, eventId, title, points: eventPoints, stage, description = '',
    hint = '', claimLimit = null, correctAnswer = 0, expirationMinutes = 10
  }) => {
    const { data, error } = await supabase.rpc('staff_create_event_code', {
      p_kind: kind,
      p_event_id: eventId,
      p_title: title,
      p_points: eventPoints,
      p_stage: stage,
      p_description: description,
      p_hint: hint,
      p_claim_limit: claimLimit,
      p_correct_answer: correctAnswer,
      p_expiration_minutes: expirationMinutes
    });
    if (error) {
      showError('Event QR could not be created', error);
      return null;
    }
    await refreshData();
    showToast('Event QR created', `The organizer-issued QR expires in ${expirationMinutes} minutes.`, 'success');
    return data;
  };

  const triggerNewSignalDrop = ({ title, points: dropPoints, hint }) => createEventCode({
    kind: 'signal',
    eventId: `drop-${crypto.randomUUID()}`,
    title,
    points: dropPoints,
    stage: 2,
    description: hint || '',
    hint: hint || ''
  });

  const reverseLedgerEntry = async (ledgerId, reason) => {
    const { error } = await supabase.rpc('staff_reverse_points', {
      p_ledger_id: ledgerId,
      p_reason: reason
    });
    if (error) {
      showError('Ledger reversal failed', error);
      return false;
    }
    await refreshData();
    showToast('Ledger entry reversed', 'The reversal and reason were added to the audit ledger.', 'success');
    return true;
  };

  const getStageProgress = (stageNumber) => {
    if (stageNumber === 1) {
      const value = ledger.filter(entry => entry.stage === 1 && !entry.isReversed)
        .reduce((sum, entry) => sum + entry.points, 0);
      return {
        points: Math.min(value, 40), cap: 40, threshold: 25, isCleared: value >= 25,
        progressLabel: `${Math.min(value, 40)}/40 pts (Needs 25 to clear)`
      };
    }
    if (stageNumber === 2) {
      const value = ledger.filter(entry => entry.stage === 2 && !entry.isReversed)
        .reduce((sum, entry) => sum + entry.points, 0);
      return {
        points: Math.min(value, 200), cap: 200, threshold: 5, count: connections.length,
        isCleared: connections.length >= 5,
        progressLabel: `${connections.length}/5 connections confirmed`
      };
    }
    if (stageNumber === 3) {
      return {
        points: blitzState.score, cap: 150, threshold: 5, count: blitzState.correctCount,
        isCleared: blitzState.completed && blitzState.correctCount >= 5,
        progressLabel: blitzState.completed
          ? `${blitzState.correctCount}/10 correct (${blitzState.score} pts)`
          : 'Complete the event quiz'
      };
    }
    if (stageNumber === 4) {
      const count = Object.values(partnerVisits).filter(visit => visit.scanned).length;
      const value = ledger.filter(entry => entry.stage === 4 && !entry.isReversed)
        .reduce((sum, entry) => sum + entry.points, 0);
      return {
        points: Math.min(value, 150), cap: 150, threshold: 3, count,
        isCleared: count >= 3, progressLabel: `${count}/3 partner booths visited`
      };
    }
    return { points: 0, cap: 100, threshold: 0, isCleared: false };
  };

  const getClearedStagesCount = () => [1, 2, 3, 4].filter(number => getStageProgress(number).isCleared).length;
  const currentRank = getTitleForPoints(points);
  const avatarMeta = getAvatarMeta(user?.avatarId || 'av-1');
  const roleMeta = getRoleMeta(user?.role || 'builder');

  const value = {
    user,
    setUser: updateProfile,
    updateProfile,
    points,
    ledger,
    adminLedger,
    currentRank,
    avatarMeta,
    roleMeta,
    stage1Quests,
    completeStage1Quest,
    connections,
    notifications,
    markNotificationsRead,
    blitzState,
    submitPromptBlitz,
    fetchQuizQuestions,
    stageSettings,
    staffQuizQuestions,
    setStageActive,
    saveQuizQuestion,
    deleteQuizQuestion,
    partnerVisits,
    completePartnerTask,
    capturedSessions,
    claimedDrops,
    attendees,
    leaderboard,
    signalDrops,
    staffEventCodes,
    isAdmin,
    handleQrScan,
    isOnline,
    offlineQueue,
    syncOfflineQueue,
    toastMessage,
    showToast,
    currentTab,
    setCurrentTab,
    activeModal,
    setActiveModal,
    signupMode,
    setSignupMode,
    signupInvite,
    startSignup: () => { setSignupInvite(null); setActiveModal('signup'); },
    cancelSignup: () => setActiveModal(null),
    sendLoginCode,
    signInWithPassword,
    signUpWithPassword,
    verifyLoginCode,
    signOut,
    modalData,
    setModalData,
    getStageProgress,
    getClearedStagesCount,
    deleteMyData,
    triggerNewSignalDrop,
    createEventCode,
    reverseLedgerEntry,
    playTone,
    authLoading,
    session,
    dataLoading,
    backendError,
    isSupabaseConfigured,
    refreshData,
    refreshLeaderboard
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
