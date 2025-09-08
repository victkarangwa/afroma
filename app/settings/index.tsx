import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const SettingsScreen = () => {
  const router = useRouter();
  const settingsList = [
    {
      title: "Terms and Conditions",
      onPress: () => {
        router.navigate("/webview/termsAndConditions");
      },
    },
    {
      title: "Privacy Policy",
      onPress: () => {
        router.navigate("/webview/privacyPolicy");
      },
    },
    // {
    //   title: "FAQs",
    //   onPress: () => {
    //     router.navigate("/faq");
    //   },
    // },
    // {
    //   title: "Payments",
    //   onPress: () => {
    //     router.navigate("/payment");
    //   },
    // },
  ];

  return (
    <View style={styles.container}>
      {settingsList.map((setting, index) => (
        <TouchableOpacity
          key={index}
          style={styles.settingItem}
          onPress={setting.onPress}
        >
          <Text style={styles.settingText}>{setting.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  settingItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  settingText: {
    fontSize: 18,
  },
});

export default SettingsScreen;
