// Quests and Stages for TechFest Quest: Jos TechFest 2026
// Theme: AI x Industry · Sarau Event Center, Jos

export const STAGES = [
  {
    id: 'stage-1',
    number: 1,
    title: 'Boot Up',
    subtitle: 'Socials & Warmup',
    tagline: '"Catch the signal. Rally your crew. Boot up."',
    flavor: 'Kick off the quest by finding TechFest and its community across seven social channels. Stack points, share the hype, and unlock the event floor.',
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
    flavor: 'A high-stakes 15-question rapid quiz on AI, African tech, and Plateau innovation. 20s per question!',
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
    flavor: 'Visit partner booths, scan active organizer-issued QRs, and complete server-scored challenges.',
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
    actionText: 'Follow @jostechfest',
    targetUrl: 'https://x.com/jostechfest',
    points: 5,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'X (Twitter)',
    completed: false
  },
  {
    id: 'q-follow-li',
    title: 'Follow Jos TechFest on LinkedIn',
    actionText: 'Open the Jos TechFest showcase',
    targetUrl: 'https://www.linkedin.com/showcase/jos-techfest/',
    points: 5,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'LinkedIn',
    completed: false
  },
  {
    id: 'q-follow-fb-techfest',
    title: 'Find TechFest on Facebook',
    actionText: 'Follow TechFest Jos',
    targetUrl: 'https://web.facebook.com/techfestjos',
    points: 3,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'Facebook',
    completed: false
  },
  {
    id: 'q-follow-fb-community',
    title: 'Unlock the Facebook community signal',
    actionText: 'Open the TechFest community page',
    targetUrl: 'https://web.facebook.com/profile.php?id=61583286609274',
    points: 3,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'Facebook',
    completed: false
  },
  {
    id: 'q-follow-axiahub',
    title: 'Connect with AxiaHub',
    actionText: 'Follow AxiaHub',
    targetUrl: 'https://web.facebook.com/axiahub',
    points: 3,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'Facebook',
    completed: false
  },
  {
    id: 'q-follow-bluehouse',
    title: 'Connect with Bluehouse Technologies',
    actionText: 'Follow Bluehouse Technologies',
    targetUrl: 'https://web.facebook.com/BluehouseTechnologies',
    points: 3,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'Facebook',
    completed: false
  },
  {
    id: 'q-follow-nhub',
    title: 'Connect with nHub Nigeria',
    actionText: 'Follow nHub Nigeria',
    targetUrl: 'https://web.facebook.com/nHubNigeria',
    points: 3,
    rule: 'Self-declared with spot checks',
    type: 'social_follow',
    platform: 'Facebook',
    completed: false
  },
  {
    id: 'q-post-x',
    title: 'Post about TechFest on X',
    actionText: 'Post on X with #JosTechFest2026',
    prefilledText: 'Excited to attend Jos TechFest 2026 at Sarau Event Center! Theme: AI x Industry. Automating the future of work! #JosTechFest2026 #AIxIndustry @TechFestJos',
    points: 5,
    rule: 'Self-reported post URL; organizers can review the linked post.',
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
    rule: 'Self-reported post URL; organizers can review the linked post.',
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
  }
];
