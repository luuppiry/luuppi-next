export default ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT"),
    },
  },
  flags: {
    nps: env.bool("FLAG_NPS", false),
    promoteEE: env.bool("FLAG_PROMOTE_EE", false),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env("CLIENT_URL"),
      async handler(uid, { documentId, locale, status }) {
        const clientUrl = env("CLIENT_URL");
        const previewSecret = env("PREVIEW_SECRET");

        const document = await strapi.documents(uid).findOne({ documentId });

        if (uid === "api::event.event") {
          const urlSearchParams = new URLSearchParams({
            url: `/${locale ?? "fi"}/events/${document.Slug}`,
            secret: previewSecret,
            status,
          });

          return `${clientUrl}/api/preview?${urlSearchParams}`;
        }

        if (uid === "api::news-single.news-single") {
          const urlSearchParams = new URLSearchParams({
            url: `/${locale ?? "fi"}/news/${document.slug}`,
            secret: previewSecret,
            status,
          });

          return `${clientUrl}/api/preview?${urlSearchParams}`;
        }

        return null;
      },
    },
  },
});
