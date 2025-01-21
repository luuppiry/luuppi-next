export default ({ env }) => {
  return {
    upload: {
      config: {
        sizeLimit: 250 * 1024 * 1024, // 256mb in bytes
      },
    },
    "upload-plugin-cache": {
      enabled: true,
      config: {
        maxAge: 86_400_000,
      },
    },
    email: {
      config: {
        provider: "nodemailer",
        providerOptions: {
          host: env("SMTP_HOST", "postfix"),
          port: env("SMTP_PORT", 25),
        },
        settings: {
          defaultFrom: "cms@luuppi.fi",
          defaultReplyTo: "cms@luuppi.fi",
        },
      },
    },
  };
};
