import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const { user, loading, loadSession } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  // Wait one tick after loading to make sure the router is mounted
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setAppReady(true), 50);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)/dashboard");
    }
  }, [user, appReady, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
