import React, { forwardRef } from "react";
import {
    View
} from "react-native";
import PhoneInput, { PhoneInputProps } from "react-native-phone-number-input";

const PhoneNumberInput = forwardRef<PhoneInput, PhoneInputProps>(({
  defaultValue,
  defaultCode = "US",
  onChangeText,
  onChangeFormattedText,
  ...rest
}, ref) => {
  return (
    <View>
      <PhoneInput
        ref={ref}
        defaultCode={defaultCode}
        onChangeText={onChangeText}
        onChangeFormattedText={onChangeFormattedText}
        layout="first"
        {...rest}
      />
    </View>
  );
});

PhoneNumberInput.displayName = "PhoneNumberInput";

export default PhoneNumberInput;
