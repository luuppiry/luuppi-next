import exifr from 'exifr';
import { cacheLife } from 'next/cache';

export interface PhotoExif {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  takenAt?: string;
}

export async function getExif(url: string): Promise<PhotoExif | null> {
  'use cache';
  cacheLife('max');

  try {
    const raw = await exifr.parse(url, {
      pick: [
        'Make',
        'Model',
        'LensModel',
        'FocalLength',
        'FNumber',
        'ExposureTime',
        'ISO',
        'DateTimeOriginal',
      ],
    });
    if (!raw) return null;

    const camera = [raw.Make, raw.Model]
      .filter(Boolean)
      // Avoid "Canon Canon EOS R6"
      .filter((v, i, arr) => i === 0 || !v.startsWith(arr[0]))
      .join(' ');

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
