import { ParticleBackground } from "@/components/particle-background";
import { SocialIcon } from "@/components/social-icons";
import { getLinks } from "@/lib/blob-links";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getLinks();

  return (
    <main className="lun-shell">
      <ParticleBackground />
      <div className="lun-glow" />

      <div className="lun-container">
        <div className="lun-logo-wrap">
          <div className="lun-logo-ring" />
          <div className="lun-logo-ring-2" />
          <div className="lun-logo-fallback">LN</div>
        </div>

        <div className="lun-profile-name">{data.profileName}</div>

        <div className="lun-divider">
          <div className="lun-divider-line" />
          <div className="lun-divider-diamond" />
          <div className="lun-divider-line" />
        </div>

        <p
          className="lun-bio"
          dangerouslySetInnerHTML={{ __html: data.bioHtml }}
        />

        <div className="lun-socials">
          {data.socials.map((social) => (
            <a
              key={social.id}
              href={social.href}
              className="lun-social-btn"
              title={social.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SocialIcon icon={social.icon} />
            </a>
          ))}
        </div>

        <div className="lun-section-label">— {data.sectionLabel} —</div>

        <div className="lun-links">
          {data.links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`lun-link-btn${link.featured ? " featured" : ""}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.featured && link.badge ? (
                <div className="lun-featured-badge">{link.badge}</div>
              ) : null}
              <div className="lun-link-icon">{link.icon}</div>
              <div className="lun-link-text">
                <span className="lun-link-title">{link.title}</span>
                <span className="lun-link-sub">{link.subtitle}</span>
              </div>
              <span className="lun-link-arrow">→</span>
            </a>
          ))}
        </div>

        <div className="lun-footer">
          <p className="lun-footer-verse">{data.footerVerse}</p>
        </div>
      </div>
    </main>
  );
}
