import { BlocksContent } from '@strapi/blocks-react-renderer';

export function getPlainText(block: BlocksContent): string {
  return block
    .map((node) => {
      switch (node.type) {
        case 'heading':
          return node.children.map((child) =>
            child.type === 'text' ? child.text : child.url,
          );
        case 'code':
          return node.children.map((child) =>
            child.type === 'text' ? child.text : child.url,
          );
        case 'quote':
          return node.children.map((child) =>
            child.type === 'text' ? child.text : child.url,
          );
        case 'list':
          return node.children
            .map((child) => recursiveListRenderer(child))
            .flatMap((x) => x);
        case 'paragraph': {
          return node.children.map((child) =>
            child.type === 'text' ? child.text : child.url,
          );
        }
        default:
          return [];
      }
    })
    .flatMap((x) => x)
    .join(' ');
}

function recursiveListRenderer(node: any): string[] {
  if (node.type === 'list-item') {
    return node.children.map((child: any) =>
      child.type === 'text' ? child.text : child.url,
    );
  }

  return node.children.map((child: any) => recursiveListRenderer(child));
}
