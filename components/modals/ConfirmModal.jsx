import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import ThemedModal from "./ThemedModal";
import ThemedText from "../ThemedText";
import { useTheme } from "../../context/ThemedModes";
import { Ionicons } from "@expo/vector-icons";

const ConfirmModal = ({
    visible,
    title = "Are you sure?",
    message = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <ThemedModal visible={visible} onClose={onCancel} animationType="fade">
            <View style={styles.modalContent}>
                <View style={[styles.modalIcon, { backgroundColor: theme.primary + "20" }]}>
                    <Ionicons name="help-circle" size={40} color={theme.primary} />
                </View>

                <ThemedText title style={[styles.modalTitle, { color: theme.text }]}>
                    {title}
                </ThemedText>

                {message ? (
                    <ThemedText style={[styles.modalMessage, { color: theme.mutedText }]}>
                        {message}
                    </ThemedText>
                ) : null}

                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        onPress={onCancel}
                        style={[styles.cancelButton, { borderColor: theme.border }]}
                    >
                        <ThemedText style={[styles.cancelText, { color: theme.text }]}>
                            {cancelText}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onConfirm}
                        style={[styles.confirmButton, { backgroundColor: theme.primary }]}
                    >
                        <ThemedText style={styles.confirmText}>{confirmText}</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedModal>
    );
};

const getStyles = (theme) =>
    StyleSheet.create({
        modalContent: {
            alignItems: "center",
            padding: 24,
        },
        modalIcon: {
            width: 70,
            height: 70,
            borderRadius: 35,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 6,
        },
        modalMessage: {
            fontSize: 15,
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 22,
        },
        buttonsRow: {
            flexDirection: "row",
            width: "100%",
            marginTop: 10,
            gap: 10,
        },
        cancelButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1,
            alignItems: "center",
        },
        cancelText: {
            fontSize: 16,
            fontWeight: "500",
        },
        confirmButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
        },
        confirmText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
        },
    });

export default ConfirmModal;
