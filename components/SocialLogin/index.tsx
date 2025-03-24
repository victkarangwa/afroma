import {
    GoogleSignin,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";

// export default function App() {

if(Platform.OS === 'android'){
  GoogleSignin.configure({
    webClientId:
      "104521571553-70cj474frto1ascll6mfukhilpveqdvp.apps.googleusercontent.com",
  });
}
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

      if (!idToken) {
        // if you are using older versions of google-signin, try old style result
        idToken = signInResult.idToken;
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
          // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions([
      "public_profile",
      "email",
    ]);

    if (result.isCancelled) {
      throw "User cancelled the login process";
    }

    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();
    
    if (!data) {
      throw "Something went wrong obtaining access token";
    }
    // console.log("---FB_ACCESS_TOKEM---", data);
    return data

    } catch (error) {
      console.log("---FB_LOGIN_ERROR--", error);
    }

  }




