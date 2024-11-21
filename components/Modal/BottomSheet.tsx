import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { tw } from "react-native-tailwindcss";

import { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";

const BottomModal = ({ children }: { children: ReactNode }) => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // renders
  return (
    <View
      style={[tw.absolute, tw.z100, tw.inset0]}
    >
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={["50%", "100%"]}
        backdropComponent={({ animatedIndex }) => (
          <View
            style={[
              tw.flex1,
              tw.bgBlack,
              tw.opacity50,
              tw.absolute,
              tw.inset0,
            ]}
          />
        )}
      >
        <BottomSheetView style={[tw.mX4]} >
          {children}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};


export default BottomModal;
