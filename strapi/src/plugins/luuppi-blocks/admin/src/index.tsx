import type {
  ContentManagerPlugin,
  SelectorBlock,
} from "@strapi/content-manager/strapi-admin";
import { Information, Minus, Quotes } from "@strapi/icons";
import {
  BaseElement,
  Editor,
  Path,
  Element as SlateElement,
  Node as SlateNode,
  Transforms,
} from "slate";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { styled } from "styled-components";
import Callout from "./components/Callout";
import { makeSafetyNotice } from "./components/SafetyNotice";
import { pressEnterTwiceToExit } from "./utils/enter-key";
import { withHr, Hr, HR_MARKER } from "./components/Hr";

const Blockquote = styled.blockquote.attrs({ role: "blockquote" })`
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  border-left: ${({ theme }) =>
    `${theme.spaces[1]} solid ${theme.colors.neutral200}`};
  padding: ${({ theme }) => theme.spaces[2]} ${({ theme }) => theme.spaces[4]};
  color: ${({ theme }) => theme.colors.neutral600};
`;

const HrElement = (props: any) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...props.attributes} contentEditable={false}>
      <Hr $selected={selected && focused} />
      <span style={{ display: "none" }}>{props.children}</span>
    </div>
  );
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
          renderElement: (props: any) => {
            if (!(props.element as any).isHr) {
              return paragraph!.renderElement(props);
            }

            return (
              <div {...props.attributes} contentEditable={false}>
                <HrElement />
                <span style={{ display: "none" }}>{props.children}</span>
              </div>
            );
          },
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
        renderElement: (props) => <HrElement {...props} />,
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
