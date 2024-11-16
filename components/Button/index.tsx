import * as React from "react";
import { Button, ButtonProps } from "react-native-paper";

interface ButtonComponentProps extends ButtonProps {
  textColor?: string;
  children: React.ReactNode;
  icon?: string;
  mode?: ButtonProps["mode"];
  onPress?: () => void;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  textColor="white",
  children,
  icon,
  mode,
  onPress,
  ...rest
}) => (
  <Button textColor={textColor} icon={icon} mode={mode} onPress={onPress} {...rest}>
    {children}
  </Button>
);

export default ButtonComponent;
