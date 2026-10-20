// Avatars and Roles for Jos TechFest 2026
// Theme: AI x Industry · Jos, Plateau State

export const ROLES = [
  {
    id: 'builder',
    name: 'Builder',
    tagline: 'Ship code, train models, deploy things',
    badge: '⚡ Dev / ML Engineer',
    color: '#00E676',
    icon: 'Terminal'
  },
  {
    id: 'founder',
    name: 'Founder',
    tagline: 'Build companies, raise capital, lead vision',
    badge: '🚀 CEO / Founder',
    color: '#00B0FF',
    icon: 'Briefcase'
  },
  {
    id: 'designer',
    name: 'Designer',
    tagline: 'Craft sleek interfaces, UX & product soul',
    badge: '🎨 Product Designer',
    color: '#FF4081',
    icon: 'Palette'
  },
  {
    id: 'operator',
    name: 'Operator',
    tagline: 'Automate workflows, drive growth & systems',
    badge: '⚙️ Systems & Growth',
    color: '#FFD700',
    icon: 'Cpu'
  },
  {
    id: 'student',
    name: 'Student',
    tagline: 'Future engineer, hungry learner, next-gen builder',
    badge: '🎓 Next-Gen Builder',
    color: '#7C4DFF',
    icon: 'GraduationCap'
  }
];

export const AVATARS = [
  {
    id: 'av-1',
    name: 'Keziah',
    role: 'builder',
    gender: 'f',
    bg: '#0F2F1C',
    border: '#00E676',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#13241B" stroke="#00E676" stroke-width="3"/>
      <circle cx="50" cy="40" r="20" fill="#8D5524"/>
      <path d="M30 40 Q50 15 70 40 Q50 25 30 40" fill="#1A1A1A"/>
      <circle cx="43" cy="40" r="3" fill="#1A1A1A"/>
      <circle cx="57" cy="40" r="3" fill="#1A1A1A"/>
      <path d="M45 48 Q50 53 55 48" stroke="#1A1A1A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M25 88 Q50 68 75 88" fill="#00E676"/>
      <circle cx="36" cy="38" r="8" fill="none" stroke="#00E676" stroke-width="2"/>
      <circle cx="64" cy="38" r="8" fill="none" stroke="#00E676" stroke-width="2"/>
      <line x1="44" y1="38" x2="56" y2="38" stroke="#00E676" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'av-2',
    name: 'Gyang',
    role: 'builder',
    gender: 'm',
    bg: '#0A2617',
    border: '#00E676',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#122619" stroke="#00E676" stroke-width="3"/>
      <circle cx="50" cy="42" r="21" fill="#5C3818"/>
      <path d="M30 32 C30 20 70 20 70 32 Z" fill="#111111"/>
      <circle cx="43" cy="42" r="3" fill="#111111"/>
      <circle cx="57" cy="42" r="3" fill="#111111"/>
      <path d="M44 50 Q50 54 56 50" stroke="#111111" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 88 Q50 66 78 88" fill="#1B4D2E"/>
      <rect x="42" y="70" width="16" height="12" rx="3" fill="#00E676"/>
    </svg>`
  },
  {
    id: 'av-3',
    name: 'Nanret',
    role: 'founder',
    gender: 'f',
    bg: '#092138',
    border: '#00B0FF',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#0B233A" stroke="#00B0FF" stroke-width="3"/>
      <circle cx="50" cy="42" r="20" fill="#75471D"/>
      <path d="M28 35 C28 15 72 15 72 35 C72 25 60 20 50 20 C40 20 28 25 28 35" fill="#1E1E1E"/>
      <circle cx="43" cy="43" r="3" fill="#111111"/>
      <circle cx="57" cy="43" r="3" fill="#111111"/>
      <path d="M45 51 Q50 55 55 51" stroke="#FF4081" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M24 90 Q50 68 76 90" fill="#005088"/>
      <polygon points="50,66 54,76 64,76 56,82 59,92 50,86 41,92 44,82 36,76 46,76" fill="#00B0FF"/>
    </svg>`
  },
  {
    id: 'av-4',
    name: 'Pam',
    role: 'founder',
    gender: 'm',
    bg: '#081D33',
    border: '#00B0FF',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#091F35" stroke="#00B0FF" stroke-width="3"/>
      <circle cx="50" cy="42" r="21" fill="#4A2D13"/>
      <path d="M29 32 Q50 24 71 32" stroke="#111" stroke-width="6" stroke-linecap="round"/>
      <circle cx="43" cy="43" r="3" fill="#111"/>
      <circle cx="57" cy="43" r="3" fill="#111"/>
      <path d="M45 52 Q50 56 55 52" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 88 Q50 66 78 88" fill="#0E3D66"/>
      <polygon points="46,72 54,72 50,86" fill="#00B0FF"/>
    </svg>`
  },
  {
    id: 'av-5',
    name: 'Zainab',
    role: 'designer',
    gender: 'f',
    bg: '#330A24',
    border: '#FF4081',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#2E0A20" stroke="#FF4081" stroke-width="3"/>
      <circle cx="50" cy="42" r="20" fill="#693F19"/>
      <path d="M30 38 Q50 14 70 38 Q65 18 50 18 Q35 18 30 38" fill="#222"/>
      <circle cx="43" cy="43" r="3" fill="#111"/>
      <circle cx="57" cy="43" r="3" fill="#111"/>
      <path d="M45 51 Q50 55 55 51" stroke="#FF4081" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M24 90 Q50 68 76 90" fill="#66103D"/>
      <circle cx="34" cy="45" r="4" fill="#FF4081"/>
    </svg>`
  },
  {
    id: 'av-6',
    name: 'Musa',
    role: 'designer',
    gender: 'm',
    bg: '#2F0821',
    border: '#FF4081',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#2A081D" stroke="#FF4081" stroke-width="3"/>
      <circle cx="50" cy="42" r="21" fill="#543314"/>
      <path d="M30 30 Q50 18 70 30" stroke="#111" stroke-width="8" stroke-linecap="round"/>
      <circle cx="43" cy="43" r="3" fill="#111"/>
      <circle cx="57" cy="43" r="3" fill="#111"/>
      <path d="M44 51 Q50 56 56 51" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 88 Q50 66 78 88" fill="#5C0D37"/>
      <rect x="42" y="72" width="16" height="14" rx="4" fill="#FF4081"/>
    </svg>`
  },
  {
    id: 'av-7',
    name: 'Bulus',
    role: 'operator',
    gender: 'm',
    bg: '#332905',
    border: '#FFD700',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#2E2405" stroke="#FFD700" stroke-width="3"/>
      <circle cx="50" cy="42" r="21" fill="#75471D"/>
      <path d="M32 30 C32 16 68 16 68 30 Z" fill="#1F1A12"/>
      <circle cx="43" cy="43" r="3" fill="#111"/>
      <circle cx="57" cy="43" r="3" fill="#111"/>
      <path d="M44 51 Q50 55 56 51" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 88 Q50 66 78 88" fill="#6B540A"/>
      <circle cx="50" cy="76" r="6" fill="#FFD700"/>
    </svg>`
  },
  {
    id: 'av-8',
    name: 'Chidimma',
    role: 'operator',
    gender: 'f',
    bg: '#302604',
    border: '#FFD700',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#2B2104" stroke="#FFD700" stroke-width="3"/>
      <circle cx="50" cy="42" r="20" fill="#693F19"/>
      <circle cx="50" cy="35" r="18" fill="#16120D"/>
      <circle cx="43" cy="44" r="3" fill="#FFF"/>
      <circle cx="57" cy="44" r="3" fill="#FFF"/>
      <path d="M45 52 Q50 56 55 52" stroke="#FFD700" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M24 90 Q50 68 76 90" fill="#574306"/>
      <line x1="38" y1="74" x2="62" y2="74" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'av-9',
    name: 'Simi',
    role: 'student',
    gender: 'f',
    bg: '#1D0F38',
    border: '#7C4DFF',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#190D30" stroke="#7C4DFF" stroke-width="3"/>
      <circle cx="50" cy="43" r="20" fill="#75471D"/>
      <path d="M30 36 Q50 18 70 36" fill="#111"/>
      <circle cx="43" cy="43" r="3" fill="#111"/>
      <circle cx="57" cy="43" r="3" fill="#111"/>
      <path d="M44 51 Q50 56 56 51" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M24 90 Q50 68 76 90" fill="#4527A0"/>
      <path d="M50 20 L30 28 L50 36 L70 28 Z" fill="#7C4DFF"/>
      <line x1="68" y1="29" x2="68" y2="42" stroke="#FFD700" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'av-10',
    name: 'Terna',
    role: 'student',
    gender: 'm',
    bg: '#190C33',
    border: '#7C4DFF',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#160A2E" stroke="#7C4DFF" stroke-width="3"/>
      <circle cx="50" cy="42" r="21" fill="#543314"/>
      <path d="M30 32 Q50 22 70 32" stroke="#1A1A1A" stroke-width="7" stroke-linecap="round"/>
      <circle cx="43" cy="43" r="3" fill="#111"/>
      <circle cx="57" cy="43" r="3" fill="#111"/>
      <path d="M44 51 Q50 55 56 51" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 88 Q50 66 78 88" fill="#311B92"/>
      <polygon points="50,68 54,76 46,76" fill="#7C4DFF"/>
    </svg>`
  },
  {
    id: 'av-11',
    name: 'Hadiza',
    role: 'builder',
    gender: 'f',
    bg: '#0F2F1C',
    border: '#00E676',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#102617" stroke="#00E676" stroke-width="3"/>
      <circle cx="50" cy="42" r="20" fill="#613B17"/>
      <path d="M26 38 C26 18 74 18 74 38 Z" fill="#00E676" opacity="0.3"/>
      <circle cx="43" cy="43" r="3" fill="#111"/>
      <circle cx="57" cy="43" r="3" fill="#111"/>
      <path d="M44 51 Q50 56 56 51" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M24 90 Q50 68 76 90" fill="#143D24"/>
      <circle cx="50" cy="76" r="5" fill="#00E676"/>
    </svg>`
  },
  {
    id: 'av-12',
    name: 'Danjuma',
    role: 'founder',
    gender: 'm',
    bg: '#0B233A',
    border: '#00B0FF',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#091E33" stroke="#00B0FF" stroke-width="3"/>
      <circle cx="50" cy="42" r="21" fill="#42250C"/>
      <path d="M30 28 Q50 16 70 28" stroke="#111" stroke-width="8" stroke-linecap="round"/>
      <circle cx="43" cy="43" r="3" fill="#111"/>
      <circle cx="57" cy="43" r="3" fill="#111"/>
      <path d="M44 52 Q50 57 56 52" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 88 Q50 66 78 88" fill="#0A3152"/>
      <circle cx="50" cy="74" r="6" fill="#00B0FF"/>
    </svg>`
  }
];

export const getRoleMeta = (roleId) => {
  return ROLES.find(r => r.id === roleId) || ROLES[0];
};

export const getAvatarMeta = (avatarId) => {
  return AVATARS.find(a => a.id === avatarId) || AVATARS[0];
};
