import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

import { useTheme } from "../../../context/ThemedModes";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebase";

import { ArrowLeft, Bell, CheckCircle } from "lucide-react-native";

import { safeRouter } from "../../../utils/SafeRouter";

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [notifications, setNotifications] = useState([]);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(list);
    });

    return unsubscribe;
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        isRead: true,
      });
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  if (!user) {
    return (
      <ThemedView safe style={styles.center}>
        <ThemedText>Please login to view notifications</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView safe style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouter.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>Notifications</ThemedText>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.length === 0 && (
          <ThemedCard style={styles.emptyCard}>
            <ThemedText style={styles.emptyText}>
              You have no notifications yet
            </ThemedText>
          </ThemedCard>
        )}

        {notifications.length > 0 && (
          <ThemedCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={theme.text} />
              <ThemedText style={styles.sectionTitle}>
                Recent Activity
              </ThemedText>
            </View>

            {notifications.map((n, idx) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.menuItem, !n.isRead && styles.unreadItem]}
                onPress={() => !n.isRead && markAsRead(n.id)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <CheckCircle
                    size={20}
                    color={n.isRead ? theme.mutedText : theme.primary}
                  />

                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <ThemedText
                      style={[styles.menuText, !n.isRead && styles.unreadText]}
                    >
                      {n.message}
                    </ThemedText>

                    <ThemedText style={styles.menuDesc}>
                      {n.createdAt?.toDate
                        ? n.createdAt.toDate().toLocaleString()
                        : ""}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ThemedCard>
        )}
      </ScrollView>
    </ThemedView>
  );
};

export default NotificationsScreen;

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginBottom: 15,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    sectionCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 0,
      borderRadius: 14,
      overflow: "hidden",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 10,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    unreadItem: {
      backgroundColor: "rgba(0, 122, 255, 0.06)",
    },
    menuLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    menuText: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 2,
    },
    unreadText: {
      fontWeight: "600",
    },
    menuDesc: {
      fontSize: 13,
      color: theme.mutedText,
    },
    emptyCard: {
      margin: 16,
      padding: 18,
      borderRadius: 14,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 14,
      color: theme.mutedText,
    },
  });
