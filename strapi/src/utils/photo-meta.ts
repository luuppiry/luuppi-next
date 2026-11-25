import exifr from "exifr";
import sharp from "sharp";

export interface PhotoExif {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  takenAt?: string;
}

async function parseExif(buf: Buffer): Promise<PhotoExif | null> {
  try {
    const raw = await exifr.parse(buf, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
      ],
    });
    if (!raw) return null;

    const camera = [raw.Make, raw.Model]
      .filter(Boolean)
      .filter((v, i, arr) => i === 0 || !v.startsWith(arr[0]))
      .join(" ");

    return {
      camera: camera || undefined,
      lens: raw.LensModel,
      focalLength: raw.FocalLength
        ? `${Math.round(raw.FocalLength)} mm`
        : undefined,
      aperture: raw.FNumber ? `f/${raw.FNumber}` : undefined,
      shutter: raw.ExposureTime
        ? raw.ExposureTime < 1
          ? `1/${Math.round(1 / raw.ExposureTime)} s`
          : `${raw.ExposureTime} s`
        : undefined,
      iso: raw.ISO,
      takenAt: raw.DateTimeOriginal
        ? new Date(raw.DateTimeOriginal).toISOString()
        : undefined,
    };
  } catch {
    return null;
  }
}

async function makeBlurDataUrl(buf: Buffer): Promise<string> {
  const out = await sharp(buf)
    .rotate()
    .resize(22)
    .blur(2.9)
    .webp({ quality: 100 })
    .toBuffer();

  return `data:image/webp;base64,${out.toString("base64")}`;
}

export async function extractPhotoMeta(buf: Buffer) {
  const [exif, blurDataUrl] = await Promise.all([
    parseExif(buf),
    makeBlurDataUrl(buf),
  ]);
  return { exif, blurDataUrl };
}
