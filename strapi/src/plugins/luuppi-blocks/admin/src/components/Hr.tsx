import {
  Editor,
  Path,
  Range,
  Element as SlateElement,
  Node as SlateNode,
  Transforms,
} from "slate";
import { styled } from "styled-components";

export const Hr = styled.hr<{ $selected?: boolean }>`
  border: none;
  border-top: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.neutral500 : theme.colors.neutral200};
  margin: ${({ theme }) => theme.spaces[2]} 0;
  border-radius: 2px;
  transition:
    background-color 120ms ease,
    box-shadow 120ms ease;
`;

// Zero-width space: non-empty (so the frontend renderer's line-break split
// doesn't fire, and Strapi doesn't prune the node as an empty paragraph)
export const HR_MARKER = "\u200B";

export const withHr = (editor: Editor): Editor => {
  const { normalizeNode, insertText, deleteBackward, deleteForward, isVoid } =
    editor;

  editor.isVoid = (element) => {
    if (SlateElement.isElement(element) && (element as any).isHr === true) {
      return true;
    }
    return isVoid(element);
  };

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

      const nextPath = Path.next(path);
      const nextNode = Editor.hasPath(editor, nextPath)
        ? SlateNode.get(editor, nextPath)
        : null;
      const nextInvalid =
        !nextNode ||
        !SlateElement.isElement(nextNode) ||
        (nextNode as any).isHr === true;

      if (nextInvalid) {
        Transforms.insertNodes(
          editor,
          { type: "paragraph", children: [{ text: "" }] } as any,
          { at: nextPath },
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
    if (!selection) {
      deleteBackward(unit);
      return;
    }

    const [highestHr] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && (n as any).isHr === true,
      mode: "highest",
    });
    if (highestHr) {
      const [, hrPath] = highestHr;
      const hrRange = Editor.range(editor, hrPath);
      if (Range.equals(selection, hrRange)) {
        Transforms.removeNodes(editor, { at: hrPath });
        return;
      }
    }

    if (Range.isCollapsed(selection)) {
      const [insideEntry] = Editor.nodes(editor, {
        match: (n) => SlateElement.isElement(n) && (n as any).isHr === true,
      });
      if (insideEntry) return;

      const [start] = Editor.edges(editor, selection);
      const before = Editor.before(editor, start);
      if (before) {
        const beforePath = before.path.slice(0, -1);
        const beforeNode = SlateNode.get(editor, beforePath);
        if (
          SlateElement.isElement(beforeNode) &&
          (beforeNode as any).isHr === true &&
          Editor.string(editor, start.path) === ""
        ) {
          Transforms.select(editor, beforePath);
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
