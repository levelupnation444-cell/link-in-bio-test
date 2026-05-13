import type { CSSProperties } from "react";
import { ParticleBackground } from "@/components/particle-background";
import { SocialIcon } from "@/components/social-icons";
import { getLinks } from "@/lib/blob-links";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getLinks();

  return (
    <main
      className="lun-shell"
      style={
        {
          "--background": data.theme.background,
          "--black": data.theme.background,
          "--black-2": data.theme.backgroundSecondary,
          "--foreground": data.theme.foreground,
          "--white": data.theme.foreground,
          "--white-dim": data.theme.foregroundDim,
          "--gold": data.theme.accent,
          "--gold-light": data.theme.accentLight,
          "--gold-dark": data.theme.accentDark,
        } as CSSProperties
      }
    >
      <ParticleBackground />
      <div className="lun-glow" />

      <div className="lun-container">
        <div className="lun-logo-wrap">
          <div className="lun-logo-ring" />
          <div className="lun-logo-ring-2" />
          {data.logoUpdatedAt ? (
            <img
              className="lun-logo-img"
              src={`/api/logo?v=${encodeURIComponent(data.logoUpdatedAt)}`}
              alt={`${data.profileName} logo`}
            />
          ) : (
            <div className="lun-logo-fallback">LN</div>
          )}
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
            link.featured ? (
              <a
                key={link.id}
                href={link.href}
                className="lun-hero-banner"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="lun-hero-rays" />
                <div className="lun-hero-cross" />
                <div className="lun-hero-overlay" />
                <div className="lun-hero-content">
                  <span className="lun-hero-kicker">7-DAY BLUEPRINT</span>
                  <h2 className="lun-hero-title">
                    Find Your God-Given Purpose in 7 Days
                  </h2>
                  <p className="lun-hero-subtitle">
                    Build faith, discipline, and direction with a practical
                    biblical game plan.
                  </p>
                  <span className="lun-hero-cta">
                    START FREE <span aria-hidden>→</span>
                  </span>
                </div>
              </a>
            ) : (
              <a
                key={link.id}
                href={link.href}
                className="lun-link-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="lun-link-icon">{link.icon}</div>
                <div className="lun-link-text">
                  <span className="lun-link-title">{link.title}</span>
                  <span className="lun-link-sub">{link.subtitle}</span>
                </div>
                <span className="lun-link-arrow">→</span>
              </a>
            )
          ))}
        </div>

        <div className="lun-footer">
          <p className="lun-footer-verse">{data.footerVerse}</p>
        </div>
      </div>
    </main>
  );
}
