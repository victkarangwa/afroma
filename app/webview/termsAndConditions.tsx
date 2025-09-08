import React, { useState } from "react";
import { WebView } from "react-native-webview";
import { View, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import Spinner from "@/components/Spinner";

interface WebViewScreenProps {
  url: string;
}

const WebViewScreen: React.FC<WebViewScreenProps> = () => {
  const [loading, setLoading] = useState(true);
  return (
    <View style={styles.container}>
      {loading && <Spinner />}
      <WebView
        source={{ uri: "https://app.termly.io/policy-viewer/policy.html?policyUUID=a7e9779b-8064-4c17-b0b9-e268c200f6e8" }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebViewScreen;
