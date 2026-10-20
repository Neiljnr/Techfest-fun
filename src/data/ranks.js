// Ranks, Titles & Badges for Jos TechFest 2026
// Theme: AI x Industry

export const RANKS = [
  { minPoints: 550, title: 'Oga CTO', badgeClass: 'rank-oga', color: '#00E676', description: 'Chief of Automation. You run the ecosystem.' },
  { minPoints: 400, title: 'Tech Lead', badgeClass: 'rank-lead', color: '#00B0FF', description: 'Systems architect. Leading high-impact delivery.' },
  { minPoints: 250, title: 'Senior Dev', badgeClass: 'rank-senior', color: '#FFD700', description: 'Production-ready builder with deep technical grit.' },
  { minPoints: 100, title: 'Associate', badgeClass: 'rank-associate', color: '#FF4081', description: 'Climbing fast. Pipelines and scripts are rolling.' },
  { minPoints: 0, title: 'Fresh Intern', badgeClass: 'rank-intern', color: '#9E9E9E', description: 'Booting up at Sarau Center. Ready to automate!' }
];

export const BADGES = [
  {
    id: 'badge-social',
    name: 'Social Butterfly',
    icon: 'Users',
    description: 'Connected with 10+ fellow operators via two-way QR confirmation',
    unlockedAt: { type: 'connections', count: 10 }
  },
  {
    id: 'badge-frontrow',
    name: 'Front Row',
    icon: 'Radio',
    description: 'Captured all 6 keynote & technical sessions in Sarau Hall',
    unlockedAt: { type: 'sessions', count: 6 }
  },
  {
    id: 'badge-whisperer',
    name: 'Partner Whisperer',
    icon: 'Building2',
    description: 'Completed challenges at 6+ industry partner exhibition booths',
    unlockedAt: { type: 'partners', count: 6 }
  },
  {
    id: 'badge-speedster',
    name: 'Speedster',
    icon: 'Zap',
    description: 'Aced the Prompt Blitz quiz with high lightning speed bonuses',
    unlockedAt: { type: 'blitz_score', count: 100 }
  },
  {
    id: 'badge-earlybird',
    name: 'Early Bird',
    icon: 'Sun',
    description: 'Checked into Sarau Event Center within the opening morning hour',
    unlockedAt: { type: 'early_bird', count: 1 }
  },
  {
    id: 'badge-pioneer',
    name: 'Automation Pioneer',
    icon: 'Award',
    description: 'Successfully cleared all 4 main quest stages!',
    unlockedAt: { type: 'stages_cleared', count: 4 }
  }
];

export const getTitleForPoints = (points) => {
  for (const rank of RANKS) {
    if (points >= rank.minPoints) {
      return rank;
    }
  }
  return RANKS[RANKS.length - 1];
};
