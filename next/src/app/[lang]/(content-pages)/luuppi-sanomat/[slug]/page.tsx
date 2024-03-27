import PdfViewer from '@/components/PdfViewer/PdfViewer';
import { getDictionary } from '@/dictionaries';
import { flipSanomatLocale } from '@/libs/strapi/flip-locale';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { redirect } from 'next/navigation';

const baseUrl =
  '/api/luuppi-sanomats?populate[0]=image&populate[1]=pdf&populate[2]=Seo.openGraph.openGraphImage&populate[3]=Seo.twitter.twitterImage&populate[4]=localizations&populate=localizations.Seo.twitter.twitterImage&populate=localizations.Seo.openGraph.openGraphImage&filters[id][$eq]=';

interface LuuppiSanomatProps {
  params: { slug: string; lang: SupportedLanguage };
}

export default async function LuuppiSanomatPublication({
  params,
}: LuuppiSanomatProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::luuppi-sanomat.luuppi-sanomat'>
  >('fi', `${baseUrl}${params.slug}`, ['luuppi-sanomat']);

  const sanomatLocaleFlipped = flipSanomatLocale(params.lang, pageData.data);

  if (!pageData.data.length) {
    redirect(`/${params.lang}/404`);
  }

  const selectedPublication = sanomatLocaleFlipped[0];

  return (
    <article className="relative flex flex-col gap-12">
      <h1>
        {dictionary.general.publication}{' '}
        {new Date(selectedPublication.attributes.createdAt as string)
          .toLocaleDateString(params.lang, {
            month: 'short',
            year: 'numeric',
          })
          .toLowerCase()}
      </h1>
      <div className="h-full">
        <PdfViewer
          dictionary={dictionary}
          pdfUrl={getStrapiUrl(
            selectedPublication.attributes.pdf?.data.attributes.url,
          )}
        />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </article>
  );
}
