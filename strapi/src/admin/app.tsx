// @ts-ignore - Ignore import errors
import favicon from "./extensions/favicon.ico";

export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
    head: {
      favicon: favicon,
    },
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Content Management",
        "app.components.LeftMenu.navbrand.workplace": "Luuppi ry",
        "app.components.HomePage.welcome": "Luuppi CMS 👷",
        "app.components.HomePage.welcome.again": "Luuppi CMS 👷",
        "app.components.HomePage.welcomeBlock.content.again":
          "Luuppi ry utilizes Strapi as its headless content management system. This serves as the admin panel for overseeing the content of the luuppi.fi website. If you have any questions or encounter any issues, kindly reach out to our WWW/IT representatives at webmaster@luuppi.fi or through Telegram. Please refrain from operating this panel unless you are fully familiar with its functionality.",
        "app.components.HomePage.button.blog": "Check Strapi blog",
        "content-type-builder.notification.info.autoreaload-disable":
          "The content builder is unavailable in this environment due to our production mode. Editing should be carried out on our GitHub repository. If you have any suggestions for modifying content types, please don't hesitate to reach out to Luuppi ry's WWW/IT representatives at webmaster@luuppi.fi or via Telegram.",
      },
    },
  },
  bootstrap(app) {
    console.log(app);
  },
};
