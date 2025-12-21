import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function initNotifications() {
  if (Platform.OS === "web") return false;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function notify({ title, body }) {
  if (Platform.OS === "web") return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null,
  });
}

export async function saveNotification({
  userId,
  message,
  type,
  relatedId = null,
}) {
  if (!userId) {
    console.warn("saveNotification called without userId");
    return;
  }

  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      message,
      type,
      relatedId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to save notification:", error);
  }
}

export async function notifyAndSave({
  userId,
  title,
  body,
  type,
  relatedId = null,
}) {
  await saveNotification({
    userId,
    message: body,
    type,
    relatedId,
  });

  await notify({
    title,
    body,
  });
}
