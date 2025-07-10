import * as React from "react";
import { Button, ButtonProps } from "react-native-paper";
import { tw } from "react-native-tailwindcss";

interface ButtonComponentProps extends ButtonProps {
  textColor?: string;
  children: React.ReactNode;
  icon?: string;
  mode?: ButtonProps["mode"];
  onPress?: () => void;
  style?: any;
  labelStyle?: any;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  textColor = "white",
  children,
  icon,
  mode = "contained",
  onPress,
  style,
  labelStyle,
  ...rest
}) => {
  const defaultStyle =
    mode === "contained"
      ? [tw.bgPink700,
        tw.roundedFull,
        tw.pY0,
        tw.itemsCenter, style]
      : [style];
  const defaultLabelStyle =
    mode === "contained"
      ? [tw.textWhite, tw.textLg, tw.fontBold, labelStyle]
      : [labelStyle];
  return (
    <Button
      textColor={textColor}
      icon={icon}
      mode={mode}
      onPress={onPress}
      style={defaultStyle}
      labelStyle={defaultLabelStyle}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ButtonComponent;
