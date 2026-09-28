'use client';
import {
  BlocksRenderer,
  type BlocksContent,
} from '@strapi/blocks-react-renderer';
import Image from 'next/image';
import Link from 'next/link';

type Blocks = Parameters<typeof BlocksRenderer>[0]['blocks'];

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

const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF]/g;

const isHrBlock = (block: any) =>
  block?.type === 'paragraph' &&
  (block.isHr === true ||
    (Array.isArray(block.children) &&
      block.children.length > 0 &&
      block.children.every(
        (c: any) =>
          c?.type === 'text' &&
          c.text.length > 0 &&
          c.text.replace(ZERO_WIDTH, '') === '',
      )));

type Segment = { kind: 'hr' } | { kind: 'blocks'; blocks: BlocksContent };

const splitAtHr = (content: BlocksContent): Segment[] => {
  const segments: Segment[] = [];
  let current: any[] = [];

  for (const block of content) {
    if (isHrBlock(block)) {
      if (current.length) {
        segments.push({ kind: 'blocks', blocks: current as BlocksContent });
        current = [];
      }
      segments.push({ kind: 'hr' });
    } else {
      current.push(block);
    }
  }
  if (current.length) {
    segments.push({ kind: 'blocks', blocks: current as BlocksContent });
  }
  return segments;
};

const isEmptyBlock = (block: any) =>
  block.type === 'paragraph' &&
  !('isHr' in block) &&
  block.children?.length === 1 &&
  block.children?.[0]?.type === 'text' &&
  block.children?.[0]?.text === '';

const blocks: Partial<Blocks> = {
  heading: ({ level, children }) => {
    const uuid = ((children as any)?.[0]?.props.text + '-' + level).replace(
      /[^a-zA-Z0-9]/g,
      '-',
    );

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
        CALLOUT_CLASSES[(props as CalloutProps).calloutVariant] ?? 'alert-info';
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

    const isHr =
      'isHr' in props ||
      (text.length > 0 && text.replace(ZERO_WIDTH, '') === '');

    if (isHr) return <hr />;

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
};

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

  const segments = splitAtHr(trimEmptyBlocks(content));

  return (
    <>
      {segments.map((segment, i) =>
        segment.kind === 'hr' ? (
          <hr key={i} />
        ) : (
          <BlocksRenderer key={i} blocks={blocks} content={segment.blocks} />
        ),
      )}
    </>
  );
}
