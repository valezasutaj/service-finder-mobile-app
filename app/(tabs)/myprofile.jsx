import { useCallback } from 'react'
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";

import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedCard from "../../components/ThemedCard";
import NavBar from "../../components/NavBar";
import SuccessModal from "../../components/modals/SuccessModal";
import ErrorModal from "../../components/modals/ErrorModal";
import { messageService } from "../../services/messagesService";
import {
  ChevronRight,
  UserRound,
  Settings,
  LifeBuoy,
  LogOut,
  Edit3,
  Calendar,
  Bell,
  Shield,
  HelpCircle,
  MapPin
} from "lucide-react-native";

import { useTheme } from '../../context/ThemedModes';
import { Ionicons } from '@expo/vector-icons';
import { safeRouter } from "../../utils/SafeRouter";
import { removeUser, getUser, saveUser } from '../../services/storageService';
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import * as ImagePicker from "expo-image-picker";
import { saveUserToFirestore } from "../../services/updateUserProfile";
import { userService } from "../../services/userService";

const MyProfile = () => {
  const { theme, userPreference, setLightMode, setDarkMode, setSystemMode } = useTheme();
  const styles = getStyles(theme);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModal, setImageModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    let unsubUser;

    const init = async () => {
      const localUser = await getUser();
      if (!localUser?.uid) {
        setLoading(false);
        return;
      }

      unsubUser = userService.listenUserById(localUser.uid, async (freshUser) => {
        const merged = { ...localUser, ...freshUser };
        setUser(merged);
        await saveUser(merged);
        setLoading(false);
      });
    };

    init();

    return () => {
      if (unsubUser) unsubUser();
    };
  }, []);

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


  const pickImage = async (source) => {
    try {
      let result;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: true,
          aspect: [1, 1],
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsEditing: true,
          aspect: [1, 1],
        });
      }

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const updatedUser = { ...user, avatar: uri };

        setUser(updatedUser);
        await saveUser(updatedUser);

        if (user?.uid) {
          await saveUserToFirestore(user.uid, { avatar: uri });
        }
      }
    } catch (error) {
      console.error('Image error:', error);
    } finally {
      setImageModal(false);
    }
  };

  const menuItems = user
    ? [
      {
        title: "Account",
        icon: UserRound,
        items: [
          { label: "Edit Profile", icon: Edit3, route: "/myprofile/editprofile" },
          { label: "My Services", icon: Settings, route: "/myservices" },
          { label: "My Bookings", icon: Calendar, route: "/booking" },
        ]
      },
      {
        title: "Settings",
        icon: Settings,
        items: [
          { label: "Notifications", icon: Bell, route: "/myprofile/notifications" },
          { label: "Privacy", icon: Shield, route: "/myprofile/privacy" },
        ]
      },
      {
        title: "Help",
        icon: LifeBuoy,
        items: [
          { label: "Help Center", icon: HelpCircle, route: "/help/help-center" },
          { label: "Contact Us", icon: LifeBuoy, route: "/help/contact-us" },
        ]
      }
    ]
    : [
      {
        title: "Help",
        icon: LifeBuoy,
        items: [
          { label: "Help Center", icon: HelpCircle, route: "/help/help-center" },
          { label: "Contact Us", icon: LifeBuoy, route: "/help/contact-us" },
        ]
      }
    ];

  if (loading) {
    return (
      <ThemedView safe style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView safe style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.header}>
          <TouchableOpacity onPress={() => { if (user) setImageModal(true) }} style={styles.avatarButton}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={theme.mutedText} />
              </View>
            )}
            {user && (
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            )}

          </TouchableOpacity>

          <View style={styles.userInfo}>
            <ThemedText style={styles.name}>
              {user?.fullName || "User"}
            </ThemedText>
            <ThemedText style={styles.email}>
              {user?.email || "user@example.com"}
            </ThemedText>
            <ThemedText style={styles.location}>
              <MapPin size={16} color={theme.mutedText} style={{ marginRight: 4 }} />
              {user?.location?.city || "Prishtina"}
            </ThemedText>
          </View>
        </View>

        <ThemedCard style={[styles.card, { marginTop: 20 }]}>
          <View style={styles.cardHeader}>
            <Settings size={20} color={theme.text} />
            <ThemedText style={styles.cardTitle}>Appearance</ThemedText>
          </View>

          <View style={styles.themeButtons}>
            {[
              { label: "System", value: null },
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" }
            ].map(({ label, value }) => (
              <TouchableOpacity
                key={label}
                onPress={() => value === null ? setSystemMode() : value === "light" ? setLightMode() : setDarkMode()}
                style={[
                  styles.themeButton,
                  userPreference === value || (value === null && userPreference === null) ?
                    styles.themeButtonActive : {}
                ]}
              >
                <ThemedText style={[
                  styles.themeButtonText,
                  userPreference === value || (value === null && userPreference === null) ?
                    styles.themeButtonTextActive : {}
                ]}>
                  {label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedCard>


        {menuItems.map((section, idx) => (
          <ThemedCard key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <section.icon size={20} color={theme.text} />
              <ThemedText style={styles.cardTitle}>{section.title}</ThemedText>
            </View>

            {section.items.map((item, itemIdx) => (
              <TouchableOpacity
                key={itemIdx}
                style={[
                  styles.menuItem,
                  itemIdx === section.items.length - 1 && styles.lastMenuItem
                ]}
                onPress={() => safeRouter.push(item.route)}
              >
                <View style={styles.menuItemLeft}>
                  <item.icon size={18} color={theme.mutedText} />
                  <ThemedText style={styles.menuItemText}>{item.label}</ThemedText>
                </View>
                <ChevronRight size={18} color={theme.mutedText} />
              </TouchableOpacity>
            ))}
          </ThemedCard>
        ))}

        {user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FF4D4F" />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => safeRouter.push("/login")}
          >
            <UserRound size={20} color={theme.primary} />
            <ThemedText
              style={[styles.logoutText, { color: theme.primary }]}
            >
              Log In
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={imageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setImageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickImage('camera')}
            >
              <Ionicons name="camera-outline" size={24} color={theme.text} />
              <ThemedText style={styles.modalOptionText}>Take Photo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickImage('gallery')}
            >
              <Ionicons name="image-outline" size={24} color={theme.text} />
              <ThemedText style={styles.modalOptionText}>Choose from Gallery</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setImageModal(false)}
            >
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <NavBar />

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

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatarButton: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.cardBackground,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: theme.mutedText,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: theme.mutedText,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.mutedText,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.border,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 10,
  },
  themeButtons: {
    flexDirection: 'row',
    padding: 16,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  themeButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: theme.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4D4F',
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: theme.mutedText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalOptionText: {
    fontSize: 16,
    color: theme.text,
  },
  modalCancel: {
    padding: 20,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FF4D4F',
    fontWeight: '600',
  },
});

export default MyProfile;