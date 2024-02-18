export default ({ env }) => {
  return {
    upload: {
      config: {
        sizeLimit: 250 * 1024 * 1024, // 256mb in bytes
      },
    },
    email: {
      config: {
        provider: "nodemailer",
        providerOptions: {
          host: env("SMTP_HOST"),
          port: env("SMTP_PORT", 587),
          auth: {
            user: env("SMTP_USERNAME"),
            pass: env("SMTP_PASSWORD"),
          },
        },
        settings: {
          defaultFrom: env("SMTP_FROM"),
          defaultReplyTo: env("SMTP_FROM"),
        },
      },
    },
  };
};
