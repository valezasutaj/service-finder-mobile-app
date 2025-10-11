import { Slot, Stack, usePathname } from "expo-router";
import { ThemeProvider } from "../context/ThemedModes";

export default function RootLayout() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/index") {
    return (
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />

    </ThemeProvider>
  );
}
