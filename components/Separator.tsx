import { View } from "react-native";
import TextComponent from "./Text";
import { tw } from "react-native-tailwindcss";

interface SeparatorProps {
  text: string;
}
const Separator = ({ text }: SeparatorProps) => {
  return (
    <View style={[tw.flexRow, tw.itemsCenter, tw.mX8]}>
      <View style={[tw.flex1, tw.bgGray100, tw.hPx, tw.opacity25]} />
      <TextComponent style={[tw.mX2, tw.mY2, tw.textCenter, tw.textWhite]}>
        {text}
      </TextComponent>
      <View style={[tw.flex1, tw.bgGray100, tw.hPx, tw.opacity25]} />
    </View>
  );
};

export default Separator;
