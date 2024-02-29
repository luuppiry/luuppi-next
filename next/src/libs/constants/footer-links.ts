interface FooterLink {
  translation: string;
  href?: string;
  sublinks?: {
    translation: string;
    href: string;
  }[];
}

export const footerLinks: FooterLink[] = [
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
    translation: 'collaboration',
    sublinks: [
      {
        translation: 'general',
        href: '/collaboration',
      },
      {
        translation: 'companies',
        href: '/collaboration/companies',
      },
      {
        translation: 'benefits',
        href: '/collaboration/benefits',
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
    translation: 'miscellaneous',
    sublinks: [
      {
        translation: 'events',
        href: '/events',
      },
      {
        translation: 'news',
        href: '/news',
      },
      {
        translation: 'sanomat',
        href: '/luuppi-sanomat',
      },
      {
        translation: 'sports',
        href: '/sports',
      },
      {
        translation: 'contact',
        href: '/contact',
      },
      {
        translation: 'privacy_policy',
        href: '/privacy-policy',
      },
    ],
  },
];
