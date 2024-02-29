import { getDictionary } from '@/dictionaries';

export type SupportedLanguage = 'en' | 'fi';

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
