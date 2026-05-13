export type SocialLink = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

export type MainLink = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  featured?: boolean;
  badge?: string;
};

export type LinkData = {
  profileName: string;
  bioHtml: string;
  sectionLabel: string;
  footerVerse: string;
  logoUpdatedAt?: string;
  theme: {
    background: string;
    backgroundSecondary: string;
    foreground: string;
    foregroundDim: string;
    accent: string;
    accentLight: string;
    accentDark: string;
  };
  socials: SocialLink[];
  links: MainLink[];
};
