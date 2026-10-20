// Quests and Stages for TechFest Quest: Jos TechFest 2026
// Theme: AI x Industry · Sarau Event Center, Jos

export const STAGES = [
  {
    id: 'stage-1',
    number: 1,
    title: 'Boot Up',
    subtitle: 'Socials & Warmup',
    tagline: '"Every system needs a signal."',
    flavor: 'Follow the channels, post your hype, warm up your operator engine before entering Sarau Center.',
    color: '#00E676', // TechFest Green
    bgGlow: 'rgba(0, 230, 118, 0.15)',
    cap: 40,
    clearThreshold: 25,
    status: 'unlocked', // Always unlocked before event
    icon: 'Radio'
  },
  {
    id: 'stage-2',
    number: 2,
    title: 'Plug In',
    subtitle: 'Human in the Loop',
    tagline: '"Humans in the loop."',
    flavor: 'Connect with builders across roles. Two-way QR handshake ensures real, meaningful networks.',
    color: '#00B0FF', // Electric Blue
    bgGlow: 'rgba(0, 176, 255, 0.15)',
    cap: 200,
    clearThreshold: 5, // 5 confirmed connections
    clearType: 'connections',
    status: 'unlocked', // Unlocked upon door check-in
    icon: 'Users'
  },
  {
    id: 'stage-3',
    number: 3,
    title: 'Prompt Blitz',
    subtitle: 'AI & Industry Quiz',
    tagline: '"Fast fingers, sharp minds."',
    flavor: 'A high-stakes 10-question rapid quiz on AI, African tech, and Plateau innovation. 20s per question!',
    color: '#FFD700', // Gold
    bgGlow: 'rgba(255, 215, 0, 0.15)',
    cap: 150,
    clearThreshold: 5, // at least 5 correct answers
    clearType: 'correct_answers',
    status: 'unlocked',
    icon: 'Zap'
  },
  {
    id: 'stage-4',
    number: 4,
    title: 'Industry Integration',
    subtitle: 'Partner Automations',
    tagline: '"Plug into the people building the future."',
    flavor: 'Visit 10+ partner booths at Sarau Hall. Scan rotating booth QRs and conquer 2-minute micro challenges.',
    color: '#FF4081', // Magenta / Neon Pink
    bgGlow: 'rgba(255, 64, 129, 0.15)',
    cap: 150,
    clearThreshold: 3, // 3 partners visited
    clearType: 'partners',
    status: 'unlocked',
    icon: 'Building2'
  }
];

export const INITIAL_STAGE1_QUESTS = [
  {
    id: 'q-follow-x',
    title: 'Follow TechFest on X',
    actionText: 'Follow @TechFestJos',
    targetUrl: 'https://x.com/TechFestJos',
    points: 5,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'X (Twitter)',
    completed: false
  },
  {
    id: 'q-follow-li',
    title: 'Follow TechFest on LinkedIn',
    actionText: 'Follow Jos TechFest Page',
    targetUrl: 'https://linkedin.com/company/jos-techfest',
    points: 5,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'LinkedIn',
    completed: false
  },
  {
    id: 'q-join-wa',
    title: 'Join Community WhatsApp Channel',
    actionText: 'Join WhatsApp Channel',
    targetUrl: 'https://whatsapp.com/channel/jos-techfest',
    points: 5,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'WhatsApp',
    completed: false
  },
  {
    id: 'q-post-x',
    title: 'Post about TechFest on X',
    actionText: 'Post on X with #JosTechFest2026',
    prefilledText: 'Excited to attend Jos TechFest 2026 at Sarau Event Center! Theme: AI x Industry. Automating the future of work! #JosTechFest2026 #AIxIndustry @TechFestJos',
    points: 5,
    rule: 'Paste link to your post (checked for hashtag & tag)',
    type: 'social_post',
    platform: 'X (Twitter)',
    completed: false,
    requiresUrl: true
  },
  {
    id: 'q-post-li',
    title: 'Post about TechFest on LinkedIn',
    actionText: 'Post on LinkedIn',
    prefilledText: 'Looking forward to Jos TechFest 2026 at Sarau Event Center! Connecting with builders and exploring AI x Industry. Let us automate the day! #JosTechFest2026 #PlateauInnovates',
    points: 5,
    rule: 'Paste link to your post (checked for hashtag)',
    type: 'social_post',
    platform: 'LinkedIn',
    completed: false,
    requiresUrl: true
  },
  {
    id: 'q-profile',
    title: 'Complete Operator Profile',
    actionText: 'Select role, avatar, bio & city',
    points: 5,
    rule: 'Auto-verified on onboarding',
    type: 'profile',
    completed: true // automatically given on onboarding
  },
  {
    id: 'q-newsletter',
    title: 'Subscribe to TechFest Dispatch',
    actionText: 'Join mailing list for keynotes',
    points: 5,
    rule: 'Auto-verified with your Gmail',
    type: 'newsletter',
    completed: false
  },
  {
    id: 'q-share-ref',
    title: 'Share Your Operator Referral Link',
    actionText: 'Copy or share your unique pass',
    points: 5,
    rule: 'Auto-verified when link is copied/shared',
    type: 'referral_share',
    completed: false
  }
];
