import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import {
  AccessToken,
  AuthenticationToken,
  LoginManager,
} from "react-native-fbsdk-next";
import * as AppleAuthentication from 'expo-apple-authentication';

// export default function App() {

GoogleSignin.configure({
  webClientId: "264350061976-qe2m1m1gc5cs8a0mh1hhq3i64j8s1n5i.apps.googleusercontent.com",
  iosClientId: "264350061976-tsqp24rnknu5915rb7spu7gh13mce25m.apps.googleusercontent.com",
  offlineAccess: true,
});
export async function onGoogleButtonPress() {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();

    // Try the new style of google-sign in result, from v13+ of that module
    let idToken = signInResult.data?.idToken;

    console.log("signInResult----->", idToken);

    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      idToken = (signInResult as any).idToken;
    }
    if (!idToken) {
      throw new Error("No ID token found");
    }

    //   console.log("---GOOGLE_ID_TOKEM---", idToken);
    return idToken;
  } catch (error) {
    console.log("---GOOGLE_LOGIN_ERROR--", JSON.stringify(error));
  }
}

export async function onFacebookButtonPress() {
  try {
    const nonce = Math.random().toString(36).substring(2);
    // const nonceSha256 = await sha256(nonce);
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(
      ["public_profile", "email"],
      "limited",
      nonce
    );
    if (result.isCancelled) {
      throw "User cancelled the login process";
    }
    
    // Once signed in, get the users AccessToken
    let data;
    if (Platform.OS === "ios") {
      data = await AuthenticationToken.getAuthenticationTokenIOS();
      console.log("----FB_LOGIN_RESULT---", data);
    } else {
      data = await AccessToken.getCurrentAccessToken();
    }

    if (!data) {
      throw "Something went wrong obtaining access token";
    }
    // console.log("---FB_ACCESS_TOKEM---", data);
    return data;
  } catch (error) {
    console.log("---FB_LOGIN_ERROR--", error);
  }
}

export async function onAppleButtonPress() {
  try {
    // Start the sign-in request
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Ensure Apple returned a user identityToken
    if (!credential.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }

    // Return the full credential object for use with your backend API
    console.log("----APPLE_LOGIN_RESULT---", credential);
    return credential;
  } catch (error) {
    console.log("---APPLE_LOGIN_ERROR--", error);
    throw error;
  }
}
