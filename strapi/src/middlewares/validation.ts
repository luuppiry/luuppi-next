import { errors } from "@strapi/utils";

/** collection name : validator */
const validations = {
  event: (data) => {
    // https://github.com/strapi/strapi/issues/21472
    if (data.Slug === "event") {
      throw new errors.ApplicationError("Do not use the default slug 'event'");
    }

    if (
      data.Registration?.TicketTypes?.some(
        (tt) => tt.Price !== 0 && tt.Price <= 0.5,
      )
    ) {
      throw new errors.ApplicationError(
        "Paid ticket price must be at least 0.5€ (Stripe limitation)",
      );
    }

    const questions =
      (data.Registration?.QuestionsText?.length ?? 0) +
      (data.Registration?.QuestionsSelect?.length ?? 0) +
      (data.Registration?.QuestionsCheckbox?.length + 0);

    if (questions > 0 && !data.Registration.AllowQuestionEditUntil) {
      throw new errors.ApplicationError(
        "You have defined questions, but haven't set AllowQuestionEditUntil",
      );
    }
  },
};

const getCollectionName = (url) => {
  if (url.includes("::")) {
    const [, after] = url.split("::");
    if (after.includes(".")) return after.split(".")[0];
  }
};

export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.request.method === "POST") {
      if (
        ctx.request.url.includes("/content-manager/collection-types/api::") ||
        ctx.request.url.includes("/content-manager/single-types/api::")
      ) {
        const apiName = getCollectionName(ctx.request.url);

        if (!apiName) {
          return;
        }

        if (Object.keys(validations).includes(apiName)) {
          try {
            let data = ctx.request.body;
            await validations[apiName](data);
          } catch (error) {
            // Re-throw ApplicationError so Strapi handles it properly
            if (error instanceof errors.ApplicationError) {
              ctx.throw(400, error.message);
              return;
            }
            throw error;
          }
        }
      }
    }

    await next();
  };
};
