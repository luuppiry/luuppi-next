export const getStrapiUrl = (path = '') =>
  `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${path}`;
