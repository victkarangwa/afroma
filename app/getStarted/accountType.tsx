import React, { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthRequest } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    // expoClientId: 'YOUR_EXPO_CLIENT_ID',
    // iosClientId: 'YOUR_IOS_CLIENT_ID',
    // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('User authenticated:', authentication);
      // Handle the authentication response
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text>Login with Google</Text>
      <Button
        disabled={!request}
        title="Login"
        onPress={() => {
          promptAsync();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
