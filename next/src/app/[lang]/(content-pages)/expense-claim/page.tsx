import ExpenseClaimForm from '@/components/ExpenseClaimForm/ExpenseClaimForm';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

export default async function ExpenseClaim() {
  const lang = await language();
  const dictionary = await getDictionary();
  return (
    <div className="relative">
      <h1 className="mb-4">{dictionary.pages_expense_claim.title}</h1>
      <p className="max-w-3xl">{dictionary.pages_expense_claim.description}</p>
      <div className="mt-12">
        <ExpenseClaimForm dictionary={dictionary} lang={lang} />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return {
    title: dictionary.pages_expense_claim.seo_title,
    description: dictionary.pages_expense_claim.seo_description,
    robots: { index: false },
  };
}
