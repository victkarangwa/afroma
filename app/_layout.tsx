import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { ApiProvider, UserProvider } from "@/context";
import LocalStorage from "@/utils/storage";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "starters/indexr",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (loaded) {
        try {
          await SplashScreen.hideAsync();

          if (await LocalStorage.getItem("token")) {
            router.replace({ pathname: "/(tabs)" });
            return;
          }
          // if (router.canDismiss()) router.dismissAll();
          router.replace({ pathname: "/starters" });
        } catch (error) {
          console.error("Initialization Error:", error);
        }
      }
    };
    fetchData();
  }, [loaded]);

  // modify default theme
  const theme = {
    ...DefaultTheme,
    colors: {
      primary: "#eca899",
      outline: "#eca899",
      link: "#eca899",
    },
  };

  return (
    <ApiProvider>
      <UserProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <PaperProvider theme={colorScheme === "dark" ? DarkTheme : theme}>
            <Toast topOffset={80} />
            <StatusBar style="auto" />
            <Stack>
              <Stack.Screen
                name="starters/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getStarted/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getStarted/login"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getStarted/otp"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </PaperProvider>
        </ThemeProvider>
      </UserProvider>
    </ApiProvider>
  );
}
