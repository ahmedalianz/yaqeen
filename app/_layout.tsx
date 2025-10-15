import Splash from "@/screens/Splash";
import {
  Cairo_200ExtraLight,
  Cairo_300Light,
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/cairo";
import { SplashScreen, Stack } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  SplashScreen.preventAutoHideAsync();

  const [fontsLoaded] = useFonts({
    Cairo_200ExtraLight,
    Cairo_300Light,
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });

  const [appIsReady, setAppIsReady] = useState(false);

  const onFinishSplash = useCallback(() => {
    if (fontsLoaded) {
      setAppIsReady(true);
    }
  }, [fontsLoaded]);
  if (!appIsReady) {
    return <Splash onFinish={onFinishSplash} />;
  }
  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}

const RootLayoutNav = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};
