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
  };
};
