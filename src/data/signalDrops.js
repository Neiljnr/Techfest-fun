// Signal Drops: Surprise Quests announced on stage & via in-app alert
// Jos TechFest 2026 · Sarau Event Center, Jos

export const INITIAL_SIGNAL_DROPS = [
  {
    id: 'drop-coffee-gold',
    title: 'Golden QR at the Coffee Station',
    badge: '⚡ FLASH DROP',
    points: 25,
    code: 'JTF26-SIGNAL-GOLDEN-COFFEE',
    description: 'A physical golden QR sticker is hidden right near the Sarau barista counter! First operators to scan claim 25 bonus automation points.',
    hint: 'Near the cold brew dispenser in the lobby',
    active: true,
    claimedCount: 18,
    limit: 50,
    expiresIn: 'Active Now'
  },
  {
    id: 'drop-speaker-selfie',
    title: 'Spot the Keynote Speaker & Say Hi',
    badge: '📸 NETWORKING DROP',
    points: 20,
    code: 'JTF26-SIGNAL-SPEAKER-TALK',
    description: 'Connect with any of today’s main stage speakers in the networking lounge, exchange ideas on AI x Industry, and scan their Speaker Badge.',
    hint: 'VIP lounge & Speaker Pavilion',
    active: true,
    claimedCount: 29,
    limit: 100,
    expiresIn: 'Active Now'
  },
  {
    id: 'drop-iot-demo',
    title: 'Inspect the Live IoT Agro-Sorter',
    badge: '🤖 DEMO DROP',
    points: 15,
    code: 'JTF26-SIGNAL-AGRO-IOT',
    description: 'Visit the live sorting conveyor belt at the Hardware Corner. Witness real-time machine vision sorting produce and scan the test terminal.',
    hint: 'Hardware Corner · Booth 11',
    active: true,
    claimedCount: 34,
    limit: 75,
    expiresIn: 'Active Now'
  },
  {
    id: 'drop-early-bird',
    title: 'Sarau Early Bird Check-In',
    badge: '🌅 TIMED BONUS',
    points: 15,
    code: 'JTF26-SIGNAL-EARLY-SARAU',
    description: 'Awarded to dedicated operators who arrived at Sarau Event Center in the first hour of registration.',
    hint: 'Main Registration Desk',
    active: false, // Expired or claimed
    claimedCount: 50,
    limit: 50,
    expiresIn: 'Closed (10:00 AM cutoff)'
  }
];
