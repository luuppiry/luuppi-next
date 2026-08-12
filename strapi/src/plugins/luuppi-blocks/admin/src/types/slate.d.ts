import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type CalloutVariant = "info" | "warning" | "error" | "success";

export type CalloutElement = {
  type: "callout";
  variant: CalloutVariant;
  children: CustomText[];
};

export type CustomText = { text: string; [key: string]: any };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CalloutElement | any; // union in with existing Strapi block types
    Text: CustomText;
  }
}
