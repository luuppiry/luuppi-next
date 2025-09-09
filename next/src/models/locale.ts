import { getDictionary } from '@/dictionaries';

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
