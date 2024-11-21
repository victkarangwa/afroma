import * as React from "react";
import { TextInput, TextInputProps } from "react-native-paper";
import { View } from "react-native";
import { tw } from "react-native-tailwindcss";

interface Props extends TextInputProps {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  icon?: string;
  containerStyles?: any;
  theme?: any;
}

const Input = ({
  label,
  value,
  placeholder,
  icon,
  onChangeText,
  containerStyles,
  theme,
  ...rest
}: Props) => {
  return (
    <View
      style={[
        tw.border,
        tw.borderPink700,
        tw.rounded,
        tw.mY2,
        ...(containerStyles || []),
      ]}
    >
      <TextInput
        style={[tw.wFull, tw.mXAuto, tw.textWhite]}
        placeholderTextColor={"white"}
        textColor="white"
        theme={{
          colors: {
            primary: "white",
            placeholder: "gray",
            onSurfaceVariant: "gray",
          },
          ...theme,
        }}
        label={label}
        secureTextEntry={label === "Password"}
        right={icon ? <TextInput.Icon icon={icon} color="white" /> : null}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        {...rest}
      />
    </View>
  );
};

export default Input;
