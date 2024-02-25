import { SupportedLanguage } from '@/models/locale';

export const getLanguage = (req: Request): SupportedLanguage => {
  const acceptLanguage = req.headers.get('accept-language');
  if (!acceptLanguage) {
    return 'en';
  }

  if (acceptLanguage.includes('fi')) {
    return 'fi';
  }
  return 'en';
};
