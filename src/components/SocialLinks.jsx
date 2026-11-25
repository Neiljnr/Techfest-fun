import React from 'react';
import { ExternalLink } from 'lucide-react';
import { normalizeSocialUrl, SOCIAL_PLATFORMS } from '../utils/socialLinks';

export const SocialLinks = ({ links, name = 'attendee' }) => {
  const safeLinks = SOCIAL_PLATFORMS
    .map(platform => ({ ...platform, href: normalizeSocialUrl(platform.key, links?.[platform.key]) }))
    .filter(platform => platform.href);

  if (!safeLinks.length) return null;

  return (
    <div className="social-links-list" aria-label={`${name}'s social links`}>
      {safeLinks.map(platform => (
        <a
          key={platform.key}
          className="social-link-chip"
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${name}'s ${platform.label} profile in a new tab`}
        >
          {platform.label}<ExternalLink size={12} />
        </a>
      ))}
    </div>
  );
};
