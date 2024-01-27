import { Metadata } from 'next';

export default function formatMetadata(content: any, url: string): Metadata {
  const seo = content.data.attributes.Seo;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    authors: seo.metaAuthor,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.openGraph.openGraphTitle,
      description: seo.openGraph.openGraphDescription,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}${url}`,
      images: [
        `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${seo.openGraph.openGraphImage.data.attributes.url}`,
      ],
    },
    twitter: {
      title: seo.twitter.twitterTitle,
      description: seo.twitter.twitterDescription,
      card: 'summary_large_image',
      images: [
        `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${seo.twitter.twitterImage.data.attributes.url}`,
      ],
    },
  };
}
