import { Slot, Stack, usePathname } from "expo-router";
import { ThemeProvider } from "../context/ThemedModes";
import { useEffect } from "react";
import { AppState } from "react-native";
import { auth } from "../firebase";
import { messageService } from "../services/messagesService";

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    let appStateSub;

    const user = auth.currentUser;
    if (!user) return;

    messageService.setOnlineStatus(user.uid, true);

    appStateSub = AppState.addEventListener("change", (state) => {
      if (!auth.currentUser) return;

      if (state === "active") {
        messageService.setOnlineStatus(user.uid, true);
      } else {
        messageService.setOnlineStatus(user.uid, false);
      }
    });

    return () => {
      appStateSub?.remove();

      if (auth.currentUser) {
        messageService.setOnlineStatus(user.uid, false);
      }
    };
  }, []);

  if (pathname === "/" || pathname === "/home") {
    return (
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </ThemeProvider>
  );
}
