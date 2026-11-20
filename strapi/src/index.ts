import type { Core } from "@strapi/strapi";
import { enrichFile } from "./utils/enrich-file";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::upload.file"],

      // "Replace media" swaps the file (new hash) but keeps the row, so
      // clear the old values and let afterUpdate recompute them.
      beforeUpdate(event) {
        const data = event.params?.data;
        if (data?.hash) {
          data.blurDataURL = null;
          data.exif = null;
        }
      },

      afterCreate: (event) => enrichFile(strapi, event.result),
      afterUpdate: (event) => enrichFile(strapi, event.result),
    });
  },
};
