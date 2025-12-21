import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal
} from 'react-native';
import { useTheme } from '../../../context/ThemedModes';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import ThemedButton from '../../../components/ThemedButton';
import LoginRequiredScreen from '../../../components/LoginRequiredScreen';
import SuccessModal from '../../../components/modals/SuccessModal';
import ErrorModal from '../../../components/modals/ErrorModal';
import { ArrowLeft, Camera, MapPin, X } from 'lucide-react-native';
import { safeRouter } from '../../../utils/SafeRouter';
import { getUser, saveUser } from '../../../services/storageService';
import { updateUserProfile } from '../../../services/userService';
import * as ImagePicker from 'expo-image-picker';
import { saveUserToFirestore } from '../../../services/updateUserProfile';
import { Ionicons } from '@expo/vector-icons';

const EditProfile = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');

  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [permissionModal, setPermissionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [permissionMessage, setPermissionMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await getUser();
      if (userData) {
        setUser(userData);
        setFullName(userData.fullName || '');
        setUsername(userData.username || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setBio(userData.bio || '');
        setProfession(userData.profession || '');
        setLocation(userData.location?.city || 'Prishtina');
        setAvatar(userData.avatar || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setErrorMessage('Failed to load profile data');
      setErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPermissionMessage('Please allow access to gallery to choose photos');
        setPermissionModal(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      const base64Avatar = `data:image/jpeg;base64,${result.assets[0].base64}`;

      if (base64Avatar.length > 700_000) {
        setErrorMessage("Photo is too large. Please choose a smaller image.");
        setErrorModal(true);
        return;
      }

      setAvatar(base64Avatar);

    } catch (error) {
      console.error('Image picker error:', error);
      setErrorMessage('Failed to pick image from gallery');
      setErrorModal(true);
    } finally {
      setImagePickerModal(false);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPermissionMessage('Please allow camera access to take photos');
        setPermissionModal(true);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      const base64Avatar = `data:image/jpeg;base64,${result.assets[0].base64}`;

      if (base64Avatar.length > 700_000) {
        setErrorMessage("Photo is too large. Please choose a smaller image.");
        setErrorModal(true);
        return;
      }

      setAvatar(base64Avatar);

    } catch (error) {
      console.error('Camera error:', error);
      setErrorMessage('Failed to take photo');
      setErrorModal(true);
    } finally {
      setImagePickerModal(false);
    }
  };


  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMessage('Full name is required');
      setErrorModal(true);
      return false;
    }

    if (!username.trim()) {
      setErrorMessage('Username is required');
      setErrorModal(true);
      return false;
    }

    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters');
      setErrorModal(true);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updates = {
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim(),
        bio: bio.trim(),
        profession: profession.trim(),
        location: {
          city: location.trim() || 'Prishtina',
          latitude: user?.location?.latitude || null,
          longitude: user?.location?.longitude || null
        }
      };

      if (avatar && avatar !== user?.avatar) {
        updates.avatar = avatar;
      }

      const result = await updateUserProfile(user.uid, updates);

      if (result.success) {
        const updatedUser = {
          ...user,
          ...updates
        };
        await saveUser(updatedUser);

        if (avatar && avatar !== user?.avatar) {
          await saveUserToFirestore(user.uid, { avatar: avatar });
        }

        setSuccessModal(true);
      }
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage(error.customMessage || 'Failed to update profile');
      setErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView safe style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: 16, color: theme.text }}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <LoginRequiredScreen
        onLogin={() => safeRouter.push("/login")}
        onSignup={() => safeRouter.push("/signup")}
        message="Please login to edit your profile."
      />
    );
  }

  return (
    <ThemedView safe style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouter.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={() => setImagePickerModal(true)}
            style={styles.avatarContainer}
          >
            {avatar ? (
              <View style={styles.avatarImageContainer}>
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
                <View style={styles.cameraOverlay}>
                  <Camera size={20} color="#fff" />
                </View>
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons
                  name="person-circle"
                  size={100}
                  color={theme.mutedText}
                  style={styles.defaultAvatarIcon}
                />
                <View style={styles.cameraIcon}>
                  <Camera size={16} color="#fff" />
                </View>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setImagePickerModal(true)}>
            <ThemedText style={styles.changePhotoText}>Change Photo</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Full Name *</ThemedText>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={theme.mutedText}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Username *</ThemedText>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={theme.mutedText}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <View style={styles.emailContainer}>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
                placeholderTextColor={theme.mutedText}
              />
              <ThemedText style={styles.note}>Email cannot be changed</ThemedText>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Phone Number</ThemedText>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+383 XX XXX XXX"
              placeholderTextColor={theme.mutedText}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>
              <MapPin size={16} color={theme.mutedText} style={{ marginRight: 4 }} />
              Location
            </ThemedText>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
              placeholderTextColor={theme.mutedText}
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.bioHeader}>
              <ThemedText style={styles.label}>Bio</ThemedText>
              <ThemedText style={styles.charCount}>{bio.length}/200</ThemedText>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.mutedText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedButton
            onPress={handleSave}
            style={styles.saveButton}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
            )}
          </ThemedButton>

          <TouchableOpacity
            onPress={() => safeRouter.back()}
            style={styles.cancelButton}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={imagePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
                Change Profile Picture
              </ThemedText>
              <TouchableOpacity
                onPress={() => setImagePickerModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: theme.border }]}
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={24} color={theme.text} />
              <ThemedText style={[styles.modalOptionText, { color: theme.text }]}>
                Take Photo
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: theme.border }]}
              onPress={pickImageFromGallery}
            >
              <Ionicons name="image-outline" size={24} color={theme.text} />
              <ThemedText style={[styles.modalOptionText, { color: theme.text }]}>
                Choose from Gallery
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setImagePickerModal(false)}
            >
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={permissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPermissionModal(false)}
      >
        <View style={styles.permissionModalOverlay}>
          <View style={[styles.permissionModalContent, { backgroundColor: theme.cardBackground }]}>
            <ThemedText style={[styles.permissionModalTitle, { color: theme.text }]}>
              Permission Required
            </ThemedText>
            <ThemedText style={[styles.permissionModalText, { color: theme.text }]}>
              {permissionMessage}
            </ThemedText>
            <TouchableOpacity
              style={styles.permissionModalButton}
              onPress={() => setPermissionModal(false)}
            >
              <ThemedText style={styles.permissionModalButtonText}>OK</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={successModal}
        title="Success"
        message="Profile updated successfully!"
        onClose={() => {
          setSuccessModal(false);
          safeRouter.back();
        }}
      />

      <ErrorModal
        visible={errorModal}
        title="Error"
        message={errorMessage}
        onClose={() => setErrorModal(false)}
      />
    </ThemedView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarImageContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.cardBackground,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.background,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  defaultAvatarIcon: {
    width: 120,
    height: 120,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.background,
  },
  changePhotoText: {
    marginTop: 16,
    color: theme.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.text,
  },
  disabledInput: {
    backgroundColor: theme.surface,
    color: theme.mutedText,
  },
  emailContainer: {
    position: 'relative',
  },
  note: {
    fontSize: 12,
    color: theme.mutedText,
    marginTop: 6,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: theme.mutedText,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.mutedText,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalCancel: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FF4D4F',
    fontWeight: '600',
  },
  permissionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionModalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  permissionModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  permissionModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionModalButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  permissionModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;