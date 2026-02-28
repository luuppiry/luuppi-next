const { createStrapi } = require("@strapi/strapi");
const fs = require("node:fs");
const { execSync } = require("child_process");

const DEFAULT_ROLE_ID = 1;

async function main() {
  if (!fs.existsSync("dist")) {
    execSync("pnpm strapi import -f seed.tar.gz", { stdio: "inherit" });
    execSync("pnpm strapi build", { stdio: "inherit" });
  }

  const strapi = await createStrapi({ distDir: "./dist" }).load();

  const events = await strapi.documents("api::event.event").findMany({
    status: "published",
    fields: ["StartDate", "EndDate", "documentId"],
    populate: {
      Registration: {
        populate: {
          QuestionsText: true,
          QuestionsSelect: true,
          QuestionsCheckbox: true,
          TicketTypes: {
            populate: {
              Role: true,
            },
          },
        },
      },
    },
  });

  for (const event of events) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const { id: _rid, ...registration } = event.Registration ?? {};

    await strapi.documents("api::event.event").update({
      documentId: event.documentId,
      data: {
        StartDate: new Date().toISOString(),
        EndDate: tomorrow.toISOString(),
        Registration: event.Registration
          ? {
              ...registration,
              TicketTypes: registration.TicketTypes?.map((ticket) => {
                const { id: _tid, ...ticketData } = ticket;
                return {
                  ...ticketData,
                  RegistrationStartsAt: new Date().toISOString(),
                  RegistrationEndsAt: nextYear.toISOString(),
                  Role: DEFAULT_ROLE_ID,
                };
              }),
            }
          : null,
      },
    });

    await strapi
      .documents("api::event.event")
      .publish({ documentId: event.documentId });
  }

  await strapi.destroy();
}

main();
