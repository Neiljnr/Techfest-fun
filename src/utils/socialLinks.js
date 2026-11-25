const PLATFORM_HOSTS = {
  x: ['x.com', 'twitter.com'],
  facebook: ['facebook.com', 'fb.com'],
  linkedin: ['linkedin.com']
};

export const SOCIAL_PLATFORMS = [
  { key: 'x', label: 'X', placeholder: 'https://x.com/yourhandle' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourprofile' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile' }
];

export const normalizeSocialUrl = (platform, value) => {
  const input = String(value || '').trim();
  if (!input) return '';
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const isAllowedHost = PLATFORM_HOSTS[platform]?.some(host => hostname === host || hostname.endsWith(`.${host}`));
    if (url.protocol !== 'https:' || !isAllowedHost || url.username || url.password || url.pathname === '/') return null;
    return url.toString();
  } catch {
    return null;
  }
};

export const cleanSocialLinks = (links = {}) => Object.fromEntries(
  SOCIAL_PLATFORMS.map(({ key }) => [key, normalizeSocialUrl(key, links[key]) || ''])
);
