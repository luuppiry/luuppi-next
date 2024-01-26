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
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Content Management",
        "app.components.LeftMenu.navbrand.workplace": "Luuppi ry",
        "app.components.HomePage.welcome": "Luuppi CMS 👷",
        "app.components.HomePage.welcome.again": "Luuppi CMS 👷",
        "app.components.HomePage.welcomeBlock.content.again":
          "Luuppi ry utilizes Strapi as its headless content management system. This serves as the admin panel for overseeing the content of the luuppi.fi website. If you have any questions or encounter any issues, kindly reach out to our WWW/IT representatives at webmaster@luuppi.fi or through Telegram. Please refrain from operating this panel unless you are fully familiar with its functionality.",
        "app.components.HomePage.button.blog": "Check Strapi blog",
      },
    },
  },
  bootstrap(app) {
    console.log(app);
  },
};
