import { Information } from "@strapi/icons";
import { ComponentType, SVGProps } from "react";
import {
  BaseElement,
  Editor,
  Element as SlateElement,
  Transforms,
  Path,
} from "slate";

const safetyLink = (lang: string) =>
  `https://luuppi.fi/${lang}/organization/documents`;

const SAFETY_NOTICE_FI = {
  before:
    "Tapahtumassa noudatetaan Luupin yhdenvertaisuussuunnitelmaa ja turvallisemman tilan periaatteita, jotka löytyvät ",
  linkText: "täältä",
  after:
    ". Häirintätilanteessa ota yhteyttä tapahtuman pääjärjestäjään tai Luupin yhdenvertaisuusvastaavaan.",
};

const SAFETY_NOTICE_EN = {
  before:
    "The event follows Luuppi’s equality plan and principles for a safer space, which can be found ",
  linkText: "here",
  after:
    ". In case of harassment, please contact the main organizer or Luuppi’s equality representative.",
};

function buildSafetyChildren(notice: typeof SAFETY_NOTICE_FI, lang: string) {
  return [
    { type: "text", text: notice.before, italic: true },
    {
      type: "link",
      url: safetyLink(lang),
      children: [{ type: "text", text: notice.linkText, italic: true }],
    },
    { type: "text", text: notice.after, italic: true },
  ];
}

interface SafetyNoticeBlock {
  renderElement: (props: any) => JSX.Element;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: { id: string; defaultMessage: string };
  matchNode: () => boolean;
  isInBlocksSelector: boolean;
  handleConvert: (editor: Editor) => void;
  snippets: string[];
}

export function makeSafetyNotice(lang: "fi" | "en"): SafetyNoticeBlock {
  const notice = lang === "fi" ? SAFETY_NOTICE_FI : SAFETY_NOTICE_EN;
  return {
    renderElement: (props: any) => (
      <p {...props.attributes}>{props.children}</p>
    ),
    icon: Information,
    label: {
      id: `luuppi-blocks.blocks.safetyNotice.${lang}`,
      defaultMessage:
        lang === "fi" ? "Turvallisemman tilan ohje" : "Safer space notice",
    },
    matchNode: () => false,
    isInBlocksSelector: true,
    handleConvert(editor: Editor) {
      const { selection } = editor;
      if (!selection) return;

      const entry = Editor.above(editor, {
        match: (n) =>
          Editor.isBlock(editor, n as BaseElement) && SlateElement.isElement(n),
      });
      if (!entry) return;
      const [, path] = entry;

      Transforms.select(editor, Editor.range(editor, path));
      Transforms.delete(editor);

      Transforms.setNodes(editor, { type: "paragraph" } as any, {
        at: path,
        match: (n) =>
          Editor.isBlock(editor, n as BaseElement) && SlateElement.isElement(n),
      });

      Transforms.insertNodes(editor, buildSafetyChildren(notice, lang) as any, {
        at: Editor.start(editor, path),
      });

      const nextPath = Path.next(path);
      Transforms.insertNodes(
        editor,
        { type: "paragraph", children: [{ text: "" }] } as any,
        { at: nextPath },
      );
      Transforms.select(editor, Editor.start(editor, nextPath));
    },
    snippets: [lang === "fi" ? "::turva" : "::safety"],
  };
}
