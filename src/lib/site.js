export const SITE = 'https://kerim.im';

export const PROFILE = {
  name: 'Kerim Kara',
  role: 'Backend Developer',
  tagline: 'Backend systems in Go, from API to infrastructure.',
  bio: "I'm Kerim, a software developer based in Turkiye. I specialize in backend systems and enjoy building APIs, data models and the infrastructure they run on.",
  description: 'Kerim Kara, backend developer based in Turkiye. Building APIs and infrastructure with Go and Terraform.',
  location: 'Turkiye',
  timeZone: 'Europe/Istanbul',
  email: 'ben@kerim.im',
  github: 'merloss',
  x: 'merl0ss',
  linkedin: 'kerimkara0',
  repo: 'https://github.com/Merloss/website',
};

export const CAREER = [
  { company: 'Clemta', role: 'Backend Developer', dates: '2023 - Present', url: 'https://clemta.com', logo: { src: '/logos/clemta.svg', width: 28, height: 28 } },
  { company: 'Voco', role: 'Backend Developer', dates: '2023', logo: { src: '/logos/voco.png', width: 33, height: 22 } },
];

export const STACK = ['Go', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Docker', 'Terraform', 'AWS', 'Cloudflare'];

export const CONNECT = [
  { href: `https://x.com/${PROFILE.x}`, label: 'X / Twitter' },
  { href: `https://www.linkedin.com/in/${PROFILE.linkedin}/`, label: 'LinkedIn' },
  { href: `https://github.com/${PROFILE.github}`, label: 'GitHub' },
];

export const HOST = new URL(SITE).host;

export const UMAMI_HOST = 'https://u.kerim.im';
