import { View, Image, Pressable, Keyboard } from "react-native";
import { tw } from "react-native-tailwindcss";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Spinner from "../Spinner";

import AppText from "@/components/Text";

interface AuthScreenLayoutProps {
  children?: React.ReactNode;
  loading?: boolean;
}

export default function AuthScreenLayout({
  children,
  loading,
}: AuthScreenLayoutProps) {
  return (
    <SafeAreaView style={[tw.flex1]}>
      {loading && <Spinner />}
      <KeyboardAwareScrollView
        contentContainerStyle={[tw.flexGrow, { paddingBottom: 50 }]}
        enableOnAndroid={true}
        enableResetScrollToCoords={false}
        scrollEnabled={true}
        extraScrollHeight={100}
        enableAutomaticScroll={true}
        style={[tw.flex1]}
      >
        <Pressable
          style={[tw.flex1]}
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <View>{children}</View>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
