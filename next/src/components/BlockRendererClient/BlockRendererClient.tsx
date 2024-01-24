/**
 * TODO: At the time writing this, the BlockRenderer does not support SSR.
 * This is a workaround to render the blocks on the client side.
 *
 * This should be addressed in the future. #bleeding-edge
 */
'use client';
import Image from 'next/image';

import {
  BlocksRenderer,
  type BlocksContent,
} from '@strapi/blocks-react-renderer';
import Link from 'next/link';

export default function BlockRendererClient({
  content,
}: {
  readonly content: BlocksContent;
}) {
  if (!content) return null;
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        heading: ({ level, children }) => {
          //TODO: Should be changed to something more reliable?
          const uuid = Math.random().toString(36).substring(7);
          switch (level) {
            case 1:
              return <h1 id={uuid}>{children}</h1>;
            case 2:
              return <h2 id={uuid}>{children}</h2>;
            case 3:
              return <h3 id={uuid}>{children}</h3>;
            case 4:
              return <h4 id={uuid}>{children}</h4>;
            case 5:
              return <h5 id={uuid}>{children}</h5>;
            case 6:
              return <h6 id={uuid}>{children}</h6>;
          }
        },
        link: (props) => <Link href={props.url}>{props.children}</Link>,
        image: ({ image }) => {
          return (
            <Image
              src={image.url}
              width={image.width}
              height={image.height}
              alt={image.alternativeText || ''}
              className="rounded-lg"
            />
          );
        },
      }}
    />
  );
}
