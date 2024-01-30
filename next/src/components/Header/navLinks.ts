export interface NavLink {
  translation: string;
  href?: string;
  sublinks?: {
    translation: string;
    href: string;
  }[];
}

export const navLinks: NavLink[] = [
  {
    translation: 'home',
    href: '/',
  },
  {
    translation: 'organization',
    sublinks: [
      {
        translation: 'introduction',
        href: '/organization',
      },
      {
        translation: 'rules',
        href: '/organization/rules',
      },
      {
        translation: 'board',
        href: '/organization/board',
      },
      {
        translation: 'office',
        href: '/organization/office',
      },
      {
        translation: 'tradition_guidelines',
        href: '/organization/tradition-guidelines',
      },
      {
        translation: 'honorary_members',
        href: '/organization/honorary-members',
      },
      {
        translation: 'documents',
        href: '/organization/documents',
      },
    ],
  },
  {
    translation: 'studies',
    sublinks: [
      {
        translation: 'general',
        href: '/studies',
      },
      {
        translation: 'fields_of_study',
        href: '/studies/fields-of-study',
      },
      {
        translation: 'workshops',
        href: '/studies/workshops',
      },
    ],
  },
  {
    translation: 'tutoring',
    sublinks: [
      {
        translation: 'general',
        href: '/tutoring',
      },
      {
        translation: 'larpake',
        href: '/tutoring/larpake',
      },
      {
        translation: 'faq',
        href: '/tutoring/faq',
      },
    ],
  },
  {
    translation: 'events',
    href: '/events',
  },
  {
    translation: 'blog',
    href: '/blog',
  },
  {
    translation: 'collaboration',
    href: '/collaboration',
  },
  {
    translation: 'sports',
    href: '/sports',
  },
  {
    translation: 'contact',
    href: '/contact',
  },
];
