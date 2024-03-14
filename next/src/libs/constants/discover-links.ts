import collaborationImg from '../../../public/images/collaboration.jpg';
import contactImg from '../../../public/images/contact.jpg';
import eventsImg from '../../../public/images/events.jpg';
import newStudentsImg from '../../../public/images/new_students.jpg';
import newsImg from '../../../public/images/news.jpg';
import organizationImg from '../../../public/images/organization.jpg';

export const discoverLinks = [
  {
    translation: 'organization',
    href: '/organization',
    image: organizationImg,
  },
  {
    translation: 'events',
    href: '/events',
    image: eventsImg,
  },
  {
    translation: 'new_students',
    href: '/tutoring',
    image: newStudentsImg,
  },
  {
    translation: 'news',
    href: '/news',
    image: newsImg,
  },
  {
    translation: 'collaboration',
    href: '/collaboration',
    image: collaborationImg,
  },
  {
    translation: 'contact',
    href: '/contact',
    image: contactImg,
  },
] as const;
