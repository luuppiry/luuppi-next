export default ({ env }) => ({
  future: {
    experimental_firstPublishedAt: env.bool(
      "STRAPI_FUTURE_EXPERIMENTAL_FIRST_PUBLISHED_AT",
      true,
    ),
  },
});
