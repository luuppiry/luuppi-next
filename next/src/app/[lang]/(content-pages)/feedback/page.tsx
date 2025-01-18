import FeedbackForm from '@/components/FeedbackForm/FeedbackForm';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';

interface FeedbackProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function Feedback(props: FeedbackProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  return (
    <div className="relative">
      <h1 className="mb-4">{dictionary.pages_feedback.title}</h1>
      <p className="max-w-3xl">{dictionary.pages_feedback.description}</p>
      <div className="mt-12">
        <FeedbackForm dictionary={dictionary} lang={params.lang} />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(
  props: FeedbackProps,
): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.pages_feedback.seo_title,
    description: dictionary.pages_feedback.seo_description,
  };
}
