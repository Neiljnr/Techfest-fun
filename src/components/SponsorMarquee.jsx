const sponsorBoard = '/brand-reference/techfest-2026-sponsor-marquee.webp';
const sponsorDescription = 'Sponsor logos including AUECARS, Bluehouse Technologies, Plateau State Government, PICTDA, Africa Gateway to Africa, Devkings Technologies, AXIA HUB, Beautiful, and AgriSync AI.';

export const SponsorMarquee = () => (
  <section className="sponsor-marquee" aria-label="TechFest 2026 sponsors">
    <div className="sponsor-marquee-heading">
      <span>Built with our partners</span>
      <span className="sponsor-marquee-live"><i aria-hidden="true" /> Jos TechFest 2026</span>
    </div>
    <div className="sponsor-marquee-window">
      <div className="sponsor-marquee-track">
        <img src={sponsorBoard} alt={sponsorDescription} />
        <img src={sponsorBoard} alt="" aria-hidden="true" />
      </div>
    </div>
  </section>
);
