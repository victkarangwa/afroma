import * as React from "react";
import { Text, TextProps } from "react-native-paper";

interface Props extends TextProps<{}> {
  variant?: React.ComponentProps<typeof Text>["variant"];
}

const TextComponent: React.FC<Props> = ({ variant, children, ...rest }: Props) => (
  <>
    <Text variant={variant} {...rest}>
      {children}
    </Text>
  </>
);

export default TextComponent;
