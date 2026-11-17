import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { getGalleries, getGallery } from '@/libs/strapi/get-gallery';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { getExif } from '@/libs/utils/get-exif';
import { Dictionary } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lang, lang as language } from 'next/root-params';
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
  params: Promise<{ documentId: string; imageDocumentId: string }>;
}

export default async function ImagePage({ params }: Props) {
  const { documentId, imageDocumentId: photoDocumentId } = await params;
  const lang = await language();
  const dictionary = await getDictionary();
  const gallery = await getGallery(lang, documentId);

  const index = gallery.Images.findIndex(
    (i) => i.documentId === photoDocumentId,
  );
  if (index === -1) notFound();

  const photo = gallery.Images[index];
  const prev = gallery.Images[index - 1];
  const next = gallery.Images[index + 1];
  const base = `/${lang}/gallery/${gallery.documentId}`;
  const photoUrl = getStrapiUrl(photo.url);

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
            name={`photo-${photo.documentId}`}
            share="morph"
          >
            <Image
              alt={photo.alternativeText || photo.name}
              className="h-[75dvh] w-auto rounded-lg object-contain"
              height={photo.height}
              sizes="100vw"
              src={photoUrl}
              width={photo.width}
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
          height={photo.height!}
          lang={lang}
          url={photoUrl}
          width={photo.width!}
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

export async function generateStaticParams(): Promise<
  Pick<
    Awaited<
      PageProps<'/[lang]/gallery/[documentId]/[imageDocumentId]'>['params']
    >,
    'imageDocumentId' | 'documentId'
  >[]
> {
  const language = await lang();
  const galleries = await getGalleries(language);

  const paths = [];

  for (const gallery of galleries) {
    for (const photo of gallery.Images) {
      paths.push({
        documentId: gallery.documentId,
        imageDocumentId: photo.documentId,
      });
    }
  }

  return paths;
}
