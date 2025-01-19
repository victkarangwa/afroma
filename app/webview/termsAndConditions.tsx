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
        source={{ uri: "https://app.getterms.io/view/okmBu/tos/en-us" }}
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
