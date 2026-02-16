// Note to self: the previous migration overrides the Registration object instead of updating selected fields
// @ts-nocheck

export async function up() {
  const events = await strapi.documents("api::event.event").findMany({
    status: "published",
    limit: 9999,
    fields: ["NameEn"],
    populate: {
      Registration: true,
    },
    filters: {
      Registration: {
        $notNull: true,
      },
    },
  });

  for (const event of events) {
    if (!event.Registration) continue;

    strapi.documents("api::event.event").discardDraft({
      documentId: event.documentId,
    });
  }
}
