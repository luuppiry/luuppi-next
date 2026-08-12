import * as React from "react";
import { Transforms } from "slate";
import {
  useSlateStatic,
  useSelected,
  ReactEditor,
  type RenderElementProps,
} from "slate-react";
import { Box, SingleSelect, SingleSelectOption } from "@strapi/design-system";
import { styled } from "styled-components";

const VARIANTS = [
  { value: "info", label: "Info", accent: "#3b82f6", bg: "#eff6ff" },
  { value: "warning", label: "Warning", accent: "#f59e0b", bg: "#fffbeb" },
  { value: "success", label: "Success", accent: "#22c55e", bg: "#f0fdf4" },
  { value: "danger", label: "Danger", accent: "#ef4444", bg: "#fef2f2" },
] as const;

const StyledCallout = styled(Box)<{ $accentColor: string; $bgColor: string }>`
  border-left: 4px solid ${(props) => props.$accentColor};
  background-color: ${(props) => props.$bgColor};
`;

const Callout = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  const editor = useSlateStatic();
  const selected = useSelected();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const variant = (element as any).calloutVariant ?? "info";
  const config = VARIANTS.find((v) => v.value === variant) ?? VARIANTS[0];

  const handleVariantChange = (value: string) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { calloutVariant: value } as any, { at: path });
  };

  const showPicker = selected || menuOpen;

  return (
    <StyledCallout
      {...attributes}
      $accentColor={config.accent}
      $bgColor={config.bg}
      position="relative"
      paddingLeft={4}
      paddingTop={3}
      paddingBottom={3}
      hasRadius
    >
      {showPicker && (
        <Box
          contentEditable={false}
          position="absolute"
          top="-2.4rem"
          right={0}
          zIndex={2}
          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <SingleSelect
            size="S"
            value={variant}
            onChange={handleVariantChange}
            onOpenChange={setMenuOpen}
          >
            {VARIANTS.map((v) => (
              <SingleSelectOption key={v.value} value={v.value}>
                {v.label}
              </SingleSelectOption>
            ))}
          </SingleSelect>
        </Box>
      )}
      {children}
    </StyledCallout>
  );
};

export default Callout;
