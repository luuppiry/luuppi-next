import type {
  ContentManagerPlugin,
  SelectorBlock,
} from "@strapi/content-manager/strapi-admin";
import { Information, Quotes, Minus } from "@strapi/icons";
import {
  BaseElement,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
  Transforms,
  Range,
  Path,
} from "slate";
import { styled } from "styled-components";
import Callout from "./components/Callout";
import { pressEnterTwiceToExit } from "./utils/enter-key";
import { makeSafetyNotice } from "./components/SafetyNotice";
import { ReactEditor } from "slate-react";

const Blockquote = styled.blockquote.attrs({ role: "blockquote" })`
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  border-left: ${({ theme }) =>
    `${theme.spaces[1]} solid ${theme.colors.neutral200}`};
  padding: ${({ theme }) => theme.spaces[2]} ${({ theme }) => theme.spaces[4]};
  color: ${({ theme }) => theme.colors.neutral600};
`;

const Hr = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral200};
  margin: ${({ theme }) => theme.spaces[2]} 0;
`;

// Zero-width space: non-empty (so the frontend renderer's line-break split
// doesn't fire, and Strapi doesn't prune the node as an empty paragraph)
// but invisible, and trivial to strip from plain-text conversions since it
// never occurs in real authored content.
export const HR_MARKER = "\u200B";

const withHr = (editor: Editor): Editor => {
  const { normalizeNode, insertText, deleteBackward, deleteForward } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (SlateElement.isElement(node) && (node as any).isHr === true) {
      const text = SlateNode.string(node);
      if (text !== HR_MARKER) {
        Transforms.insertText(editor, HR_MARKER, {
          at: {
            anchor: Editor.start(editor, path),
            focus: Editor.end(editor, path),
          },
        });
        return;
      }

      const index = path[path.length - 1];
      const prevPath = index > 0 ? Path.previous(path) : null;
      const prevNode = prevPath ? SlateNode.get(editor, prevPath) : null;
      const needsBefore =
        !prevNode ||
        !SlateElement.isElement(prevNode) ||
        (prevNode as any).isHr === true;

      if (needsBefore) {
        Transforms.insertNodes(
          editor,
          { type: "paragraph", children: [{ text: "" }] } as any,
          { at: path },
        );
        return;
      }

      const nextPath = Path.next(path);
      const nextNode = Editor.hasPath(editor, nextPath)
        ? SlateNode.get(editor, nextPath)
        : null;
      const needsAfter =
        !nextNode ||
        !SlateElement.isElement(nextNode) ||
        (nextNode as any).isHr === true;

      if (needsAfter) {
        Transforms.insertNodes(
          editor,
          { type: "paragraph", children: [{ text: "" }] } as any,
          { at: Path.next(path) },
        );
        return;
      }
    }

    normalizeNode([node, path]);
  };

  editor.insertText = (text, options) => {
    const { selection } = editor;
    if (selection) {
      const [entry] = Editor.nodes(editor, {
        match: (n) => SlateElement.isElement(n) && (n as any).isHr === true,
      });
      if (entry) return;
    }
    insertText(text, options);
  };

  editor.deleteBackward = (unit) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [start] = Editor.edges(editor, selection);

      const [insideEntry] = Editor.nodes(editor, {
        match: (n) => SlateElement.isElement(n) && (n as any).isHr === true,
      });
      if (insideEntry) return;

      const before = Editor.before(editor, start);
      if (before) {
        const beforePath = before.path.slice(0, -1);
        const beforeNode = SlateNode.get(editor, beforePath);
        if (
          SlateElement.isElement(beforeNode) &&
          (beforeNode as any).isHr === true &&
          Editor.string(editor, start.path) === ""
        ) {
          Transforms.removeNodes(editor, { at: beforePath });
          return;
        }
      }
    }
    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [entry] = Editor.nodes(editor, {
        match: (n) => SlateElement.isElement(n) && (n as any).isHr === true,
      });
      if (entry) return;
    }
    deleteForward(unit);
  };

  return editor;
};

export default {
  register(app: any) {
    const cms = app.getPlugin("content-manager")
      .apis as ContentManagerPlugin["config"]["apis"];

    cms.addRichTextBlocks((currentBlocks) => {
      const paragraph = currentBlocks.paragraph as SelectorBlock;

      return {
        ...currentBlocks,
        paragraph: {
          ...paragraph,
          renderElement: (props: any) =>
            (props.element as any).isHr ? (
              <div {...props.attributes}>
                <Hr />
                <span style={{ display: "none" }}>{props.children}</span>
              </div>
            ) : (
              paragraph!.renderElement(props)
            ),
        },
      };
    });

    cms.addRichTextBlocks({
      quote: {
        renderElement: (props: any) =>
          (props.element as any).calloutVariant != null ? (
            <Callout {...props}>{props.children}</Callout>
          ) : (
            <div>
              <Blockquote {...props.attributes}>{props.children}</Blockquote>
            </div>
          ),
        icon: Quotes,
        label: { id: "luuppi-blocks.blocks.quote", defaultMessage: "Quote" },
        matchNode: (node) =>
          SlateElement.isElement(node) && node.type === "quote",
        isInBlocksSelector: true,
        handleConvert(editor) {
          const { selection } = editor;
          if (!selection) return;
          Transforms.setNodes(editor, { type: "quote" } as any, {
            match: (n) =>
              Editor.isBlock(editor, n as BaseElement) &&
              SlateElement.isElement(n),
            mode: "lowest",
          });
        },
        handleEnterKey(editor) {
          pressEnterTwiceToExit(editor);
        },
        snippets: [">"],
      },
      callout: {
        renderElement: (props: any) => (
          <Callout {...props}>{props.children}</Callout>
        ),
        icon: Information,
        label: {
          id: "luuppi-blocks.blocks.callout",
          defaultMessage: "Callout",
        },
        matchNode: (node) =>
          SlateElement.isElement(node) &&
          node.type === "quote" &&
          (node as any).calloutVariant != null,
        isInBlocksSelector: true,
        handleConvert(editor) {
          const { selection } = editor;
          if (!selection) return;
          Transforms.setNodes(
            editor,
            { type: "quote", calloutVariant: "info" } as any,
            {
              match: (n) =>
                Editor.isBlock(editor, n as BaseElement) &&
                SlateElement.isElement(n),
              mode: "lowest",
            },
          );
        },
        snippets: ["!!"],
      },
      hr: {
        icon: Minus,
        renderElement: (props) => <Hr {...props} />,
        label: { id: "luuppi-blocks.blocks.hr", defaultMessage: "Divider" },
        matchNode: (node) =>
          SlateElement.isElement(node) &&
          node.type === "paragraph" &&
          (node as any).isHr === true,
        isInBlocksSelector: true,
        handleConvert(editor) {
          const { selection } = editor;
          if (!selection) return;

          const [entry] = Editor.nodes(editor, {
            match: (n) =>
              Editor.isBlock(editor, n as BaseElement) &&
              SlateElement.isElement(n),
            mode: "lowest",
          });
          if (!entry) return;
          const [, path] = entry;

          Transforms.setNodes(
            editor,
            { type: "paragraph", isHr: true } as any,
            { at: path },
          );

          Transforms.select(editor, Editor.range(editor, path));
          Transforms.insertText(editor, HR_MARKER);

          const nextPath = Path.next(path);
          const nextNode = Editor.hasPath(editor, nextPath)
            ? SlateNode.get(editor, nextPath)
            : null;

          if (
            !nextNode ||
            !SlateElement.isElement(nextNode) ||
            (nextNode as any).isHr === true
          ) {
            Transforms.insertNodes(
              editor,
              { type: "paragraph", children: [{ text: "" }] } as any,
              { at: nextPath },
            );
          }

          Transforms.select(editor, Editor.start(editor, nextPath));
          ReactEditor.focus(editor);
        },
        snippets: ["---"],
        plugin: withHr,
      },
    });

    cms.addRichTextBlocks({
      safetyNoticeFi: makeSafetyNotice("fi"),
      safetyNoticeEn: makeSafetyNotice("en"),
    });
  },
};
