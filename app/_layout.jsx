import { Slot, Stack, usePathname } from "expo-router";
import { ThemeProvider } from "../context/ThemedModes";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { getUser } from "../services/storageService";
import { messageService } from "../services/messagesService";

export default function RootLayout() {
  const pathname = usePathname();
  const appState = useRef(AppState.currentState);
  const currentUserRef = useRef(null);

  useEffect(() => {
    let appStateListener;

    const initPresence = async () => {
      const user = await getUser();
      if (!user) return;

      currentUserRef.current = user;

      await messageService.setOnlineStatus(user.uid, true);

      appStateListener = AppState.addEventListener("change", async (nextState) => {
        if (!currentUserRef.current) return;

        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          await messageService.setOnlineStatus(currentUserRef.current.uid, true);
        }

        if (
          appState.current === "active" &&
          nextState.match(/inactive|background/)
        ) {
          await messageService.setOnlineStatus(currentUserRef.current.uid, false);
        }

        appState.current = nextState;
      });
    };

    initPresence();

    return () => {
      if (appStateListener) appStateListener.remove();

      if (currentUserRef.current) {
        messageService.setOnlineStatus(currentUserRef.current.uid, false);
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
