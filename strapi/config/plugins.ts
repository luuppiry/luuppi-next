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
    "luuppi-blocks": {
      enabled: true,
      resolve: `./src/plugins/luuppi-blocks`,
    },
    email: {
      config: {
        provider: "nodemailer",
        providerOptions: {
          host: "postfix",
          port: 25,
          secure: false,
          ignoreTLS: true,
        },
        settings: {
          defaultFrom: "cms@luuppi.fi",
          defaultReplyTo: "cms@luuppi.fi",
        },
      },
    },
  };
};
