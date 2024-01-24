export const navLinks = [
  {
    translation: 'home',
    href: '/',
    sublinks: [],
  },
  {
    translation: 'organization',
    href: '/organization',
    sublinks: [
      {
        name: 'general',
        href: '/',
      },
      {
        name: 'rules',
        href: '/',
      },
      {
        name: 'board',
        href: '/',
      },
      {
        name: 'office',
        href: '/',
      },
      {
        name: 'honorary_members',
        href: '/',
      },
      {
        name: 'documents',
        href: '/',
      },
    ],
  },
  {
    translation: 'studies',
    href: '/studies',
    sublinks: [
      {
        name: 'general',
        href: '/',
      },
      {
        name: 'fields_of_study',
        href: '/',
      },
      {
        name: 'workshops',
        href: '/',
      },
    ],
  },
  {
    translation: 'tutoring',
    href: '/services',
    sublinks: [
      {
        name: 'general',
        href: '/',
      },
      {
        name: 'larpake',
        href: '/',
      },
      {
        name: 'faq',
        href: '/',
      },
    ],
  },
  {
    translation: 'events',
    href: '/events',
    sublinks: [],
  },
  {
    translation: 'blog',
    href: '/blog',
    sublinks: [],
  },
  {
    translation: 'collaboration',
    href: '/collaboration',
    sublinks: [],
  },
  {
    translation: 'sports',
    href: '/sports',
    sublinks: [],
  },
  {
    translation: 'contact',
    href: '/contact',
    sublinks: [],
  },
] as const;
