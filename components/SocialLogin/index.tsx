import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import {
  AccessToken,
  AuthenticationToken,
  LoginManager,
} from "react-native-fbsdk-next";
import { socialLoginConfig } from "@/configs/socialLoginConfig";

// Configure Google Sign-In
if (Platform.OS === "android") {
  GoogleSignin.configure({
    webClientId: socialLoginConfig.google.webClientId,
    offlineAccess: true,
  });
} else if (Platform.OS === "ios") {
  GoogleSignin.configure({
    webClientId: socialLoginConfig.google.webClientId,
    iosClientId: socialLoginConfig.google.iosClientId,
    offlineAccess: true,
  });
}
export async function onGoogleButtonPress() {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    
    // Check if user is already signed in
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      await GoogleSignin.signOut();
    }
    
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();

    // Try the new style of google-sign in result, from v13+ of that module
    let idToken = signInResult.data?.idToken;

    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      idToken = signInResult.idToken;
    }
    if (!idToken) {
      throw new Error("No ID token found");
    }

    console.log("Google login successful, ID token obtained");
    return idToken;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
}

export async function onFacebookButtonPress() {
  try {
    const nonce = Math.random().toString(36).substring(2);
    
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(
      ["public_profile", "email"],
      "limited",
      nonce
    );
    
    if (result.isCancelled) {
      throw new Error("User cancelled the login process");
    }
    
    // Once signed in, get the users AccessToken
    let data;
    if (Platform.OS === "ios") {
      data = await AuthenticationToken.getAuthenticationTokenIOS();
      console.log("Facebook login result (iOS):", data);
    } else {
      data = await AccessToken.getCurrentAccessToken();
      console.log("Facebook login result (Android):", data);
    }

    if (!data) {
      throw new Error("Something went wrong obtaining access token");
    }
    
    console.log("Facebook login successful, access token obtained");
    return data;
  } catch (error) {
    console.error("Facebook login error:", error);
    throw error;
  }
}
