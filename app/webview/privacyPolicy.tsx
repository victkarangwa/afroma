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
        source={{ uri: "Cookie Policy: https://app.termly.io/policy-viewer/policy.html?policyUUID=a0256cdb-00e1-45b1-bf8a-cdc048ecb350" }}
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
