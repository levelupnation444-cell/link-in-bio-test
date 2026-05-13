export type SocialLink = {
  id: string;
  label: string;
  href: string;
  icon: "instagram" | "tiktok" | "discord" | "youtube";
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
  socials: SocialLink[];
  links: MainLink[];
};
