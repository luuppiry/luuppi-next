import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const instant = false;

export default async function NotFound() {
  notFound();
}

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return {
    title: dictionary.pages_404.seo_title,
    description: dictionary.pages_404.seo_description,
  };
}
