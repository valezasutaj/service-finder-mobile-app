import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedModal from './ThemedModal';
import ThemedText from '../ThemedText';
import { useTheme } from '../../context/ThemedModes';
import { Ionicons } from '@expo/vector-icons';

const ErrorModal = ({
    visible,
    title,
    message,
    onClose,
    showConfirm = false,
    confirmText = "OK",
    cancelText = "Cancel",
    onConfirm,
}) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <ThemedModal visible={visible} onClose={onClose} animationType="fade">
            <View style={styles.modalContent}>
                <View style={[styles.modalIcon, { backgroundColor: "#ff444420" }]}>
                    <Ionicons name="alert-circle" size={36} color="#ff4444" />
                </View>

                <ThemedText title style={styles.modalTitle}>
                    {title}
                </ThemedText>

                <ThemedText style={styles.modalMessage}>
                    {message}
                </ThemedText>

                {showConfirm ? (
                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.surface }]}
                            onPress={onClose}
                        >
                            <ThemedText style={{ color: theme.text }}>
                                {cancelText}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: "#ff4444" }]}
                            onPress={() => {
                                onClose();
                                onConfirm && onConfirm();
                            }}
                        >
                            <ThemedText style={styles.modalButtonText}>
                                {confirmText}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.modalButton, { backgroundColor: "#ff4444" }]}
                        onPress={onClose}
                    >
                        <ThemedText style={styles.modalButtonText}>OK</ThemedText>
                    </TouchableOpacity>
                )}
            </View>
        </ThemedModal>
    );
};


const getStyles = (theme) => StyleSheet.create({
    modalContent: {
        alignItems: 'center',
        padding: 24,
    },
    modalIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
        minWidth: 120,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ErrorModal;