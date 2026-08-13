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
  { value: "info", label: "Info", token: "primary" },
  { value: "warning", label: "Warning", token: "warning" },
  { value: "success", label: "Success", token: "success" },
  { value: "danger", label: "Danger", token: "danger" },
] as const;

const StyledCallout = styled(Box)<{ $token: string }>`
  border-left: 4px solid
    ${({ theme, $token }) => (theme.colors as any)[`${$token}600`]};
  background-color: ${({ theme, $token }) =>
    (theme.colors as any)[`${$token}100`]};
  color: ${({ theme, $token }) =>
    (theme.colors as any)[`${$token}700`] ?? theme.colors.neutral800};
`;

const Callout = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  const editor = useSlateStatic();
  const selected = useSelected();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const variant = (element as any).calloutVariant ?? "info";
  const config = VARIANTS.find((v) => v.value === variant) ?? VARIANTS[0];

  const handleVariantChange = (value: string | number) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { calloutVariant: value } as any, { at: path });
  };

  const showPicker = selected || menuOpen;

  return (
    <StyledCallout
      {...attributes}
      $token={config.token}
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
