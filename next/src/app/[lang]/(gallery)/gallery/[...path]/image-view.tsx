import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { galleryHref, ResolvedPath } from '@/libs/strapi/get-gallery';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { getExif } from '@/libs/utils/get-exif';
import { Dictionary } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';
import React, { Suspense, ViewTransition } from 'react';
import {
  IoIosAperture,
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosCamera,
} from 'react-icons/io';
import { MdShutterSpeed } from 'react-icons/md';
import { RiCameraLensFill } from 'react-icons/ri';

interface Props {
  lang: string;
  resolved: Extract<ResolvedPath, { type: 'image' }>;
}

export default async function ImageView({ lang, resolved }: Props) {
  const dictionary = await getDictionary();
  const { gallery, chain, imageIndex } = resolved;
  const images = gallery.Images!;

  const image = images[imageIndex];
  const prev = images[imageIndex - 1];
  const next = images[imageIndex + 1];
  const base = galleryHref(
    lang,
    chain.map((g) => g.Slug),
  );
  const imageUrl = getStrapiUrl(image.url);

  return (
    <ViewTransition
      default="none"
      enter={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        default: 'none',
      }}
    >
      <div className="flex flex-col gap-6">
        <Link className="link z-20 text-sm" href={base} scroll={false}>
          ← {gallery.Title}
        </Link>

        <div className="flex justify-center rounded-lg">
          <ViewTransition
            default="none"
            name={`photo-${image.documentId}`}
            share="morph"
          >
            <Image
              alt={image.alternativeText || image.name}
              className="h-[75dvh] w-auto rounded-lg object-contain"
              height={image.height}
              sizes="100vw"
              src={imageUrl}
              width={image.width}
              priority
            />
          </ViewTransition>
        </div>

        {prev && (
          <Link
            className="group fixed inset-y-0 left-0 z-10 flex w-1/3 cursor-w-resize items-center justify-start pl-2 outline-none sm:pl-6"
            href={`${base}/${prev.documentId}`}
            transitionTypes={['nav-back']}
          >
            <span className="sr-only">{dictionary.general.previous}</span>
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white opacity-60 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-visible:ring-2 group-focus-visible:ring-white md:opacity-0"
            >
              <IoIosArrowBack size={28} />
            </span>
          </Link>
        )}

        {next && (
          <Link
            className="group fixed inset-y-0 right-0 z-10 flex w-1/3 cursor-e-resize items-center justify-end pr-2 outline-none sm:pr-6"
            href={`${base}/${next.documentId}`}
            transitionTypes={['nav-forward']}
          >
            <span className="sr-only">{dictionary.general.next}</span>
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white opacity-60 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-visible:ring-2 group-focus-visible:ring-white md:opacity-0"
            >
              <IoIosArrowForward size={28} />
            </span>
          </Link>
        )}
      </div>

      <Suspense
        fallback={<div className="skeleton hidden h-32 w-full lg:block" />}
      >
        <ExifPanel
          dictionary={dictionary}
          height={image.height!}
          lang={lang}
          url={imageUrl}
          width={image.width!}
        />
      </Suspense>
    </ViewTransition>
  );
}

async function ExifPanel({
  url,
  lang,
  width,
  height,
  dictionary,
}: {
  url: string;
  lang: string;
  width: number;
  height: number;
  dictionary: Dictionary;
}) {
  const exif = await getExif(url);

  // Don't render just the dimensions if exif does not exist
  if (exif === null) {
    return null;
  }

  const rows: [React.JSX.Element | string, string | number | undefined][] = [
    [<IoIosCamera key="Camera" aria-label="Camera" size={18} />, exif?.camera],
    [<RiCameraLensFill key="Lens" aria-label="Lens" size={18} />, exif?.lens],
    [dictionary.pages_gallery.focal_length, exif?.focalLength],
    [<IoIosAperture aria-label="Aperture" size={18} />, exif?.aperture],
    [
      <MdShutterSpeed key="Shutter" aria-label="Shutter speed" size={18} />,
      exif?.shutter,
    ],
    ['ISO', exif?.iso],
    [
      dictionary.pages_gallery.taken_at,
      exif?.takenAt
        ? new Date(exif.takenAt).toLocaleString(lang, dateFormat)
        : undefined,
    ],
    [dictionary.pages_gallery.dimensions, `${width} × ${height}`],
  ];

  return (
    <dl className="my-10 hidden grid-cols-2 gap-4 rounded-lg bg-white/5 p-4 sm:grid-cols-4 lg:grid">
      {rows
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([label, value]) => (
          <div
            key={typeof label === 'string' ? label : label.key}
            className="flex gap-2 text-sm"
          >
            <dt className="font-bold uppercase opacity-60">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );
}
