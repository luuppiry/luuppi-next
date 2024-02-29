'use client';
import {
  BlocksRenderer,
  type BlocksContent,
} from '@strapi/blocks-react-renderer';
import Image from 'next/image';
import Link from 'next/link';

/**
 * TODO: At the time writing this, the BlockRenderer does not support SSR.
 * This is a workaround to render the blocks on the client side.
 *
 * This should be addressed in the future. #bleeding-edge
 */

interface BlockRendererClientProps {
  content: BlocksContent;
}

export default function BlockRendererClient({
  content,
}: BlockRendererClientProps) {
  if (!content) return null;
  return (
    <BlocksRenderer
      blocks={{
        heading: ({ level, children }) => {
          const uuid = (
            (children as any)?.[0]?.props.text +
            '-' +
            level
          ).replace(/[^a-zA-Z0-9]/g, '-');

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
        image: ({ image }) => (
          <Image
            alt={image.alternativeText || 'Embedded image'}
            className="rounded-lg"
            height={image.height}
            src={image.url}
            width={image.width}
          />
        ),
      }}
      content={content}
    />
  );
}
