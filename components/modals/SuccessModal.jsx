import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedModal from './ThemedModal';
import ThemedText from '../ThemedText';
import { useTheme } from '../../context/ThemedModes';
import { Ionicons } from '@expo/vector-icons';

const SuccessModal = ({ visible, onClose, title, message }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <ThemedModal
            visible={visible}
            onClose={onClose}
            animationType="fade"
        >
            <View style={styles.modalContent}>
                <View style={[styles.modalIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name="checkmark-circle" size={36} color={theme.primary} />
                </View>
                <ThemedText title style={[styles.modalTitle, { color: theme.text }]}>
                    {title}
                </ThemedText>
                <ThemedText style={[styles.modalMessage, { color: theme.mutedText }]}>
                    {message}
                </ThemedText>
                <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary }]}
                    onPress={onClose}
                >
                    <ThemedText style={styles.modalButtonText}>OK</ThemedText>
                </TouchableOpacity>
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

export default SuccessModal;