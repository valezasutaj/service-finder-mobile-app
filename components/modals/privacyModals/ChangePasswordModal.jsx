import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { useTheme } from '../../../context/ThemedModes';
import ThemedText from '../../../components/ThemedText';
import ThemedButton from '../../../components/ThemedButton';
import { X, Eye, EyeOff } from 'lucide-react-native';
import { updateUserPassword } from '../../../services/userService';

const ChangePasswordModal = ({ visible, onClose, onSuccess, onError }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword) {
      onError('Please enter your current password');
      return;
    }

    if (!newPassword) {
      onError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      onError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      onError('Passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      onError('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      resetForm();
      onSuccess();
    } catch (error) {
      onError(error.customMessage || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
              Change Password
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>
              Current Password
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.mutedText}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color={theme.mutedText} />
                ) : (
                  <Eye size={20} color={theme.mutedText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>
              New Password
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={theme.mutedText}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color={theme.mutedText} />
                ) : (
                  <Eye size={20} color={theme.mutedText} />
                )}
              </TouchableOpacity>
            </View>
            <ThemedText style={[styles.hint, { color: theme.mutedText }]}>
              Must be at least 6 characters
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>
              Confirm New Password
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.mutedText}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={theme.mutedText} />
                ) : (
                  <Eye size={20} color={theme.mutedText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.requirements}>
            <ThemedText style={[styles.requirementsTitle, { color: theme.text }]}>
              Password Requirements:
            </ThemedText>
            <View style={styles.requirementItem}>
              <View style={[
                styles.requirementDot,
                { backgroundColor: newPassword.length >= 6 ? '#4CAF50' : theme.mutedText }
              ]} />
              <ThemedText style={[
                styles.requirementText,
                { color: newPassword.length >= 6 ? '#4CAF50' : theme.mutedText }
              ]}>
                At least 6 characters
              </ThemedText>
            </View>
            <View style={styles.requirementItem}>
              <View style={[
                styles.requirementDot,
                { backgroundColor: newPassword !== currentPassword ? '#4CAF50' : theme.mutedText }
              ]} />
              <ThemedText style={[
                styles.requirementText,
                { color: newPassword !== currentPassword ? '#4CAF50' : theme.mutedText }
              ]}>
                Different from current password
              </ThemedText>
            </View>
            <View style={styles.requirementItem}>
              <View style={[
                styles.requirementDot,
                { backgroundColor: newPassword === confirmPassword && newPassword ? '#4CAF50' : theme.mutedText }
              ]} />
              <ThemedText style={[
                styles.requirementText,
                { color: newPassword === confirmPassword && newPassword ? '#4CAF50' : theme.mutedText }
              ]}>
                Passwords match
              </ThemedText>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleClose}
              disabled={loading}
            >
              <ThemedText style={[styles.cancelButtonText, { color: theme.text }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedButton
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <ThemedText style={styles.saveButtonText}>
                {loading ? 'Changing...' : 'Change Password'}
              </ThemedText>
            </ThemedButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  requirements: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  requirementText: {
    fontSize: 13,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePasswordModal;