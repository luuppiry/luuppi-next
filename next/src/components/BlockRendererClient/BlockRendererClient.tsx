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

const CALLOUT_CLASSES: Record<string, string> = {
  success: 'alert-success',
  warning: 'alert-warning',
  danger: 'alert-error',
};

interface CalloutProps {
  children: unknown;
  calloutVariant: string;
}

interface BlockRendererClientProps {
  content: BlocksContent;
}

const isEmptyBlock = (block: any) =>
  block.type === 'paragraph' &&
  !('isHr' in block) &&
  block.children?.length === 1 &&
  block.children?.[0]?.type === 'text' &&
  block.children?.[0]?.text === '';

/**
 * Sometimes editors make mistakes and leave empty rows at the end of the content.
 * This function trims those empty rows for a better UX.
 */
const trimEmptyBlocks = (content: BlocksContent) => {
  if (!Array.isArray(content)) return content;
  let lastIndex = content.length - 1;
  while (lastIndex >= 0 && isEmptyBlock(content[lastIndex])) {
    lastIndex--;
  }
  return content.slice(0, lastIndex + 1);
};

export default function BlockRendererClient({
  content,
}: BlockRendererClientProps) {
  if (!content) return null;

  const trimmedContent = trimEmptyBlocks(content);

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
        quote: (props) => {
          if ('calloutVariant' in props) {
            const className =
              CALLOUT_CLASSES[(props as CalloutProps).calloutVariant] ??
              'alert-info';
            return (
              <aside
                className={`alert ${className} not-prose !place-items-start border-0 !text-left !leading-5 tracking-wide`}
              >
                <p>{props.children}</p>
              </aside>
            );
          }

          return <blockquote>{props.children}</blockquote>;
        },
        paragraph: (props) => {
          const text = Array.isArray(props.children)
            ? props.children.map((child) => child?.props?.text ?? '').join('')
            : '';

          if (text === '\u200B') {
            return <hr />;
          }

          return <p>{props.children}</p>;
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
      content={trimmedContent}
    />
  );
}
