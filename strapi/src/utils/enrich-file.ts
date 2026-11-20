import type { Core } from "@strapi/strapi";
import fs from "node:fs/promises";
import path from "node:path";
import { extractPhotoMeta } from "./photo-meta";

async function readFileBuffer(strapi: Core.Strapi, url: string) {
  // Local provider: read from disk. Cloud provider: absolute URL.
  if (url.startsWith("/")) {
    return fs.readFile(path.join(strapi.dirs.static.public, url));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function enrichFile(strapi: Core.Strapi, file: any) {
  if (!file?.id || !file.mime?.startsWith("image/")) return;
  // Already enriched. This also stops the update -> afterUpdate loop.
  if (file.blurDataUrl) return;

  try {
    const { exif, blurDataUrl } = await extractPhotoMeta(
      await readFileBuffer(strapi, file.url),
    );
    await strapi.db.query("plugin::upload.file").update({
      where: { id: file.id },
      data: { exif, blurDataUrl },
    });
  } catch (err) {
    // Never break an upload because of a placeholder
    strapi.log.warn(`Photo meta failed for file ${file.id}: ${err}`);
  }
}
