import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import ThemedView from "./ThemedView";
import ThemedText from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { safeRouter } from "../utils/SafeRouter";
import { useTheme } from "../context/ThemedModes";

export default function LoginRequiredScreen({
    onLogin,
    onSignup,
    title = "Authentication Required",
    message = "Please login to continue.",
}) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <ThemedView safe style={styles.container}>
            <View style={styles.card}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.primary + "25" }]}>
                    <Ionicons name="lock-closed" size={48} color={theme.primary} />
                </View>

                <ThemedText title style={[styles.title, { color: theme.text }]}>
                    {title}
                </ThemedText>

                <ThemedText style={[styles.message, { color: theme.mutedText }]}>
                    {message}
                </ThemedText>

                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.outlineButton, { borderColor: theme.primary }]}
                        onPress={onLogin}
                    >
                        <ThemedText style={[styles.outlineButtonText, { color: theme.primary }]}>
                            Login
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton, { backgroundColor: theme.primary }]}
                        onPress={onSignup}
                    >
                        <ThemedText style={styles.buttonText}>Create Account</ThemedText>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => safeRouter.push("/")}
                >
                    <ThemedText style={[styles.skipText, { color: theme.primary }]}>
                        Continue to Home
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.background,
            paddingHorizontal: 25,
        },

        card: {
            width: "90%",
            backgroundColor: theme.cardBackground || theme.background,
            paddingVertical: 40,
            paddingHorizontal: 24,
            borderRadius: 18,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: 3,
        },

        iconWrapper: {
            width: 80,
            height: 80,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 22,
        },

        title: {
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 8,
            textAlign: "center",
            lineHeight: 30,
        },

        message: {
            fontSize: 16,
            textAlign: "center",
            marginBottom: 30,
            lineHeight: 24,
            paddingHorizontal: 10,
        },

        buttonsRow: {
            flexDirection: "row",
            width: "100%",
            gap: 14,
            marginBottom: 20,
        },

        button: {
            flex: 1,
            paddingVertical: 15,
            borderRadius: 12,
            alignItems: "center",
        },

        primaryButton: {
            shadowColor: theme.primary,
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 2,
        },

        buttonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "700",
        },

        outlineButton: {
            borderWidth: 2,
            backgroundColor: "transparent",
        },

        outlineButtonText: {
            fontSize: 16,
            fontWeight: "700",
        },

        skipButton: {
            marginTop: 5,
        },

        skipText: {
            fontSize: 14,
            textDecorationLine: "underline",
            fontWeight: "500",
        },
    });
