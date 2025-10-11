import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemedModes";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
