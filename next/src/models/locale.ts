import { getDictionary } from '@/dictionaries';

export type SupportedLanguage = string;

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
