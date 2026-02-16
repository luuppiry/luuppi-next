// Updates all events with registration to set Registration.JointQuota = false and Registration.TicketsTotal = 1
// @ts-nocheck

export async function up() {
  const events = await strapi.documents("api::event.event").findMany({
    status: "published",
    limit: 9999,
    fields: ["NameEn"],
    populate: ["Registration"],
    filters: {
      Registration: {
        $notNull: true,
      },
    },
  });

  for (const event of events) {
    if (!event.Registration) continue;

    await strapi.documents("api::event.event").update({
      documentId: event.documentId,
      data: {
        Registration: {
          JointQuota: false,
          TicketsTotal: 1,
        },
      },
    });
  }
}
