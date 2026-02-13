import { errors } from "@strapi/utils";
type Rule = {
  throwIf: () => boolean;
  message: string;
};

/** collection / single name -> validations */
const validations = {
  event: (data) => {
    const rules = [
      {
        throwIf: () => data.Slug === "event",
        message: "Do not use the default slug 'event'",
      },
      {
        throwIf: () =>
          data.Registration?.TicketTypes?.some(
            (tt) => tt.Price !== 0 && tt.Price <= 0.5,
          ),
        message: "Paid ticket price must be at least 0.5€ (Stripe limitation)",
      },
      {
        throwIf: () => Date.parse(data.StartDate) > Date.parse(data.EndDate),
        message: "StartDate is after EndDate",
      },
      {
        throwIf: () =>
          data.Registration?.TicketTypes?.some(
            (tt) =>
              Date.parse(tt.RegistrationStartsAt) >
              Date.parse(tt.RegistrationEndsAt),
          ),
        message:
          "At least one ticket type's registration ends before it starts",
      },
      {
        throwIf: () =>
          data.Registration?.QuestionsSelect?.some(
            (q) =>
              !/^[^,\s]+(,[^,\s]+)*$/.test(q.ChoicesFi) ||
              !/^[^,\s]+(,[^,\s]+)*$/.test(q.ChoicesEn),
          ),
        message:
          "Separate all questions with a comma, with no leading or trailing spaces, eg. one,two,three",
      },
      {
        throwIf: () => {
          const questions =
            (data.Registration?.QuestionsText?.length ?? 0) +
            (data.Registration?.QuestionsSelect?.length ?? 0) +
            (data.Registration?.QuestionsCheckbox?.length ?? 0);
          return questions > 0 && !data.Registration.AllowQuestionEditUntil;
        },
        message:
          "You have defined questions, but haven't set AllowQuestionEditUntil",
      },
      {
        throwIf: () => {
          const weights =
            data.Registration?.TicketTypes?.map((tt) => tt.Weight) ?? [];
          const uniqueWeights = new Set(weights);
          return weights.length > 0 && weights.length !== uniqueWeights.size;
        },
        message:
          "All ticket types must have unique weights, see the 'Weight' field decsription",
      },
    ] as const satisfies Rule[];

    for (const rule of rules) {
      if (rule.throwIf()) {
        console.log("validation error");

        throw new errors.ApplicationError(rule.message);
      }
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
