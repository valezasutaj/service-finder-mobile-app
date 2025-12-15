import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";

import { useTheme } from "../../../context/ThemedModes";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import { messageService } from "../../../services/messagesService";
import {
  ArrowLeft,
  Shield,
  Eye,
  Bell,
  Trash2,
  Key,
  LogOut,
  User,
  AlertCircle,
} from "lucide-react-native";

import { safeRouter } from "../../../utils/SafeRouter";
import { getUser, removeUser, saveUser } from "../../../services/storageService";
import { auth } from "../../../firebase";
import { signOut } from "firebase/auth";

import { updateUserPrivacy } from "../../../services/userService";

import ChangePasswordModal from "../../../components/modals/privacyModals/ChangePasswordModal";
import DeleteAccountModal from "../../../components/modals/privacyModals/DeleteAccountModal";
import SuccessModal from "../../../components/modals/SuccessModal";
import ErrorModal from "../../../components/modals/ErrorModal";

const PrivacyScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [user, setUser] = useState(null);

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    activityStatus: true,
    readReceipts: true,
  });

  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getUser().then((u) => {
      if (!u) return;
      setUser(u);

      setPrivacy({
        profileVisibility: u.privacy?.profileVisibility ?? true,
        activityStatus: u.privacy?.activityStatus ?? true,
        readReceipts: u.privacy?.readReceipts ?? true,
      });
    });
  }, []);

  const updatePrivacy = useCallback(
    async (key, value) => {
      if (!user || isUpdating) return;

      setIsUpdating(true);
      try {
        setPrivacy(prev => {
          const updatedPrivacy = { ...prev, [key]: value };

          updateUserPrivacy(user.uid, updatedPrivacy)
            .then(() => {
              getUser().then(localUser => {
                if (localUser?.uid === user.uid) {
                  saveUser({
                    ...localUser,
                    privacy: updatedPrivacy,
                    updatedAt: Date.now(),
                  });
                }
              });
            })
            .catch(error => {
              console.error("Failed to update privacy:", error);
              setPrivacy(prev);
              setModalMessage("Failed to update privacy settings");
              setErrorModal(true);
            })
            .finally(() => {
              setIsUpdating(false);
            });

          return updatedPrivacy;
        });

      } catch (error) {
        setIsUpdating(false);
        setModalMessage("An error occurred");
        setErrorModal(true);
      }
    },
    [user, isUpdating]
  );

  const handleLogout = useCallback(() => {
    setModalMessage("Are you sure you want to logout?");
    setErrorModal(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    try {
      const storedUser = await getUser();

      if (storedUser?.uid) {
        await messageService.setOnlineStatus(storedUser.uid, false);
      }

      await signOut(auth);
      await removeUser();

      safeRouter.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const privacySections = useMemo(
    () => [
      {
        title: "Account Security",
        icon: Shield,
        items: [
          {
            icon: Key,
            label: "Change Password",
            description: "Update your account password",
            action: () => setChangePasswordModal(true),
          },
        ],
      },
      {
        title: "Privacy Settings",
        icon: Eye,
        items: [
          {
            icon: User,
            label: "Profile Visibility",
            description: "Who can see your profile",
            rightComponent: (
              <Switch
                value={privacy.profileVisibility}
                onValueChange={(v) => updatePrivacy("profileVisibility", v)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
                disabled={isUpdating}
              />
            ),
          },
          {
            icon: Bell,
            label: "Activity Status",
            description: "Show when you're online",
            rightComponent: (
              <Switch
                value={privacy.activityStatus}
                onValueChange={(v) => updatePrivacy("activityStatus", v)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
                disabled={isUpdating}
              />
            ),
          },
          {
            icon: Eye,
            label: "Read Receipts",
            description: "Show read status in chat",
            rightComponent: (
              <Switch
                value={privacy.readReceipts}
                onValueChange={(v) => updatePrivacy("readReceipts", v)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
                disabled={isUpdating}
              />
            ),
          },
        ],
      },
      {
        title: "Account Actions",
        icon: User,
        items: [
          {
            icon: LogOut,
            label: "Logout",
            description: "Sign out from this device",
            action: handleLogout,
            isDestructive: true,
          },
          {
            icon: Trash2,
            label: "Delete Account",
            description: "Permanently delete your account",
            action: () => setDeleteAccountModal(true),
            isDestructive: true,
          },
        ],
      },
    ],
    [privacy, handleLogout, theme, isUpdating]
  );

  if (!user) {
    return (
      <ThemedView safe style={styles.center}>
        <ThemedText>Please login to view privacy settings</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView safe style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouter.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          Privacy & Security
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isUpdating && (
          <ThemedCard style={[styles.securityCard, { backgroundColor: theme.surface }]}>
            <ThemedText style={{ color: theme.primary, textAlign: 'center' }}>
              Updating settings...
            </ThemedText>
          </ThemedCard>
        )}

        <ThemedCard style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Shield size={22} color={theme.primary} />
            <ThemedText style={styles.securityTitle}>
              Security Tips
            </ThemedText>
          </View>

          <View style={styles.tipRow}>
            <AlertCircle size={16} color={theme.primary} />
            <ThemedText style={styles.tipText}>
              Use a strong and unique password
            </ThemedText>
          </View>

          <View style={styles.tipRow}>
            <AlertCircle size={16} color={theme.primary} />
            <ThemedText style={styles.tipText}>
              Review your privacy settings regularly
            </ThemedText>
          </View>
        </ThemedCard>

        {privacySections.map((section, idx) => (
          <ThemedCard key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <section.icon size={20} color={theme.text} />
              <ThemedText style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
            </View>

            {section.items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.menuItem,
                  item.isDestructive && styles.destructiveItem,
                ]}
                onPress={item.action}
                disabled={(!item.action) || isUpdating}
              >
                <View style={styles.menuLeft}>
                  <item.icon
                    size={20}
                    color={
                      item.isDestructive
                        ? "#FF4D4F"
                        : theme.mutedText
                    }
                  />
                  <View style={{ marginLeft: 12 }}>
                    <ThemedText
                      style={[
                        styles.menuText,
                        item.isDestructive && { color: "#FF4D4F" },
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                    <ThemedText style={styles.menuDesc}>
                      {item.description}
                    </ThemedText>
                  </View>
                </View>
                {item.rightComponent}
              </TouchableOpacity>
            ))}
          </ThemedCard>
        ))}
      </ScrollView>

      <ChangePasswordModal
        visible={changePasswordModal}
        onClose={() => setChangePasswordModal(false)}
        onSuccess={() => {
          setChangePasswordModal(false);
          setModalMessage("Password updated successfully");
          setSuccessModal(true);
        }}
        onError={(msg) => {
          setModalMessage(msg);
          setErrorModal(true);
        }}
      />

      <DeleteAccountModal
        visible={deleteAccountModal}
        onClose={() => setDeleteAccountModal(false)}
        onConfirm={() => {
          setDeleteAccountModal(false);
          setModalMessage("Account deletion requested");
          setSuccessModal(true);
        }}
      />

      <SuccessModal
        visible={successModal}
        title="Success"
        message={modalMessage}
        onClose={() => setSuccessModal(false)}
      />

      <ErrorModal
        visible={errorModal}
        title="Logout"
        message={modalMessage}
        onClose={() => setErrorModal(false)}
        showConfirm
        confirmText="Logout"
        onConfirm={confirmLogout}
        cancelText="Cancel"
      />
    </ThemedView>
  );
};

export default PrivacyScreen;

const getStyles = (theme) => StyleSheet.create({
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
    marginBottom: 15
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  securityCard: {
    margin: 16,
    padding: 18,
    borderRadius: 14,
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginLeft: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  tipText: {
    fontSize: 14,
    color: theme.text,
    marginLeft: 10,
    lineHeight: 20,
    flex: 1,
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
  menuDesc: {
    fontSize: 13,
    color: theme.mutedText,
  },
  destructiveItem: {
    backgroundColor: "rgba(255, 77, 79, 0.08)",
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});