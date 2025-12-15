import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput
} from 'react-native';
import { useTheme } from '../../../context/ThemedModes';
import ThemedText from '../../../components/ThemedText';
import ThemedButton from '../../../components/ThemedButton';
import { X, AlertTriangle } from 'lucide-react-native';

const DeleteAccountModal = ({ visible, onClose, onConfirm }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  const canDelete = confirmationText.toLowerCase() === 'delete';

  const handleDelete = () => {
    if (!canDelete) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 1500);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <AlertTriangle size={24} color="#FF4D4F" />
            <ThemedText style={[styles.modalTitle, { color: '#FF4D4F' }]}>
              Delete Account
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.warningContainer}>
            <ThemedText style={[styles.warningText, { color: theme.text }]}>
              This action cannot be undone. All your data will be permanently deleted including:
            </ThemedText>

            <View style={styles.warningList}>
              <View style={styles.warningItem}>
                <View style={[styles.dot, { backgroundColor: '#FF4D4F' }]} />
                <ThemedText style={[styles.warningItemText, { color: theme.text }]}>
                  Your profile information
                </ThemedText>
              </View>
              <View style={styles.warningItem}>
                <View style={[styles.dot, { backgroundColor: '#FF4D4F' }]} />
                <ThemedText style={[styles.warningItemText, { color: theme.text }]}>
                  All your services and bookings
                </ThemedText>
              </View>
              <View style={styles.warningItem}>
                <View style={[styles.dot, { backgroundColor: '#FF4D4F' }]} />
                <ThemedText style={[styles.warningItemText, { color: theme.text }]}>
                  Chat history and messages
                </ThemedText>
              </View>
              <View style={styles.warningItem}>
                <View style={[styles.dot, { backgroundColor: '#FF4D4F' }]} />
                <ThemedText style={[styles.warningItemText, { color: theme.text }]}>
                  Payment information
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.confirmationContainer}>
            <ThemedText style={[styles.confirmationText, { color: theme.text }]}>
              Type "DELETE" to confirm:
            </ThemedText>
            <TextInput
              style={[styles.input, {
                color: theme.text,
                borderColor: canDelete ? '#4CAF50' : '#FF4D4F'
              }]}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="Type DELETE here"
              placeholderTextColor={theme.mutedText}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <ThemedText style={[styles.cancelButtonText, { color: theme.text }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedButton
              style={[styles.deleteButton, {
                backgroundColor: canDelete ? '#FF4D4F' : '#CCCCCC'
              }]}
              onPress={handleDelete}
              disabled={!canDelete || loading}
            >
              <ThemedText style={styles.deleteButtonText}>
                {loading ? 'Deleting...' : 'Delete Account'}
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
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  warningContainer: {
    backgroundColor: '#FF4D4F10',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  warningList: {
    marginLeft: 8,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  warningItemText: {
    fontSize: 14,
    flex: 1,
  },
  confirmationContainer: {
    marginBottom: 24,
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
  deleteButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeleteAccountModal;