// Community Hubs for Hub Wars (Jos TechFest 2026)
// Score is normalized (Total points / Active members) so all hubs compete fairly!

export const COMMUNITY_HUBS = [
  {
    id: 'hub-jos-innovators',
    name: 'Jos Innovators Hub',
    location: 'Jos North · Plateau State',
    members: 42,
    totalPoints: 12180,
    color: '#00E676',
    tagline: 'Building the next wave of open-source AI tooling in Jos'
  },
  {
    id: 'hub-bukuru-builders',
    name: 'Bukuru Builders Guild',
    location: 'Jos South (Bukuru) · Plateau State',
    members: 31,
    totalPoints: 9450,
    color: '#00B0FF',
    tagline: 'Hardware hackers, embedded systems & industrial IoT'
  },
  {
    id: 'hub-rayfield-techies',
    name: 'Rayfield Tech Collective',
    location: 'Rayfield, Jos · Plateau State',
    members: 28,
    totalPoints: 8680,
    color: '#FFD700',
    tagline: 'SaaS founders, product designers & venture builders'
  },
  {
    id: 'hub-terminus-hackers',
    name: 'Terminus Hackers',
    location: 'Terminus Commercial Hub · Jos',
    members: 35,
    totalPoints: 10150,
    color: '#FF4081',
    tagline: 'Retail automation, FinTech rails & commerce APIs'
  },
  {
    id: 'hub-unijos-ai',
    name: 'UNIJOS AI & Robotics Guild',
    location: 'University of Jos Campus',
    members: 58,
    totalPoints: 16240,
    color: '#7C4DFF',
    tagline: 'Research scholars, computer vision & low-resource NLP'
  },
  {
    id: 'hub-plateau-wit',
    name: 'Plateau Women In Tech',
    location: 'Statewide · Jos & Environs',
    members: 38,
    totalPoints: 11400,
    color: '#00E5FF',
    tagline: 'Empowering women technologists, data scientists & designers'
  }
];

export const getNormalizedHubScore = (hub) => {
  if (!hub.members || hub.members === 0) return 0;
  return Math.round(hub.totalPoints / hub.members);
};
