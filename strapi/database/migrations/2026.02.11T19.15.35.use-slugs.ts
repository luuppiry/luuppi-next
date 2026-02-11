import slugify from "@sindresorhus/slugify";
import fs from "node:fs/promises";

// Updates all published events' slug from NameEn + optional running number when needed
// Creates a public/strapi4-redirects.json file that must be used to 308 redirect old urls to their new URLs
//
// IMPORTANT! Document API does not trigger webhooks, so every event needs to be republished via the admin panel to sync database ids

const redirects = {};

export async function up() {
  throw new TypeError(
    `Needs to have slug field -- Strapi runs migrations before contentType changes 
     (which for reasons is also not configurable?) so this would fail and prevent the contentType change`,
  );

  const events = await strapi.documents("api::event.event").findMany({
    status: "published",
    limit: 9999,
    fields: ["NameEn", "ShowInCalendar", "StartDate"],
  });

  for (const event of events) {
    let slug = slugify(event.NameEn, {
      customReplacements: [
        ["ä", "a"],
        ["ö", "o"],
        ["å", "o"],
        ["@", "a"],
      ],
    });
    let i = 1;
    const baseSlug = slug;
    while (Object.values(redirects).includes(slug)) {
      slug = `${baseSlug}-${i++}`;
    }

    await strapi.documents("api::event.event").update({
      documentId: event.documentId,
      data: {
        Slug: slug,
        // This was never properly migrated, do it now to avoid validation errors
        ShowInCalendar: event.ShowInCalendar ?? true,
      },
    });

    await strapi
      .documents("api::event.event")
      .publish({ documentId: event.documentId });

    redirects[event.id] = slug;
  }

  await fs.writeFile(
    "./public/uploads/strapi4-redirects.json",
    JSON.stringify(redirects, null, 2),
  );
}
