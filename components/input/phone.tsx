import React from "react";
import {
    View
} from "react-native";
import PhoneInput, { PhoneInputProps } from "react-native-phone-number-input";

const PhoneNumberInput: React.FC<PhoneInputProps> = ({
  defaultValue,
  defaultCode = "RW",
  onChangeText,
  ...rest
}) => {
  return (
    <View>
      <PhoneInput
        defaultCode={defaultCode}
        onChangeText={onChangeText}
        {...rest}
      />
    </View>
  );
};

export default PhoneNumberInput;
