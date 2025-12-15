import { useState } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Modal
} from "react-native";

import {
    ChevronLeft,
    Mail,
    Globe,
    Clock,
    LifeBuoy
} from "lucide-react-native";

import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import { useTheme } from "../../../context/ThemedModes";
import { safeRouter } from "../../../utils/SafeRouter";

export default function ContactUs() {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [showComingSoon, setShowComingSoon] = useState(false);

    return (
        <ThemedView safe style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => safeRouter.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Contact Us</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ThemedText style={styles.intro}>
                Need help with bookings, services, or account-related issues?
                Our support team is here to assist you.
            </ThemedText>

            <ThemedCard style={styles.card}>
                <View style={styles.row}>
                    <Mail size={20} color={theme.primary} />
                    <ThemedText style={styles.cardTitle}>Email Support</ThemedText>
                </View>

                <ThemedText style={styles.cardText}>
                    Contact us directly for booking issues, service management,
                    or account-related questions.
                </ThemedText>

                <TouchableOpacity
                    onPress={() =>
                        Linking.openURL(
                            "mailto:erik.behrami@student.uni-pr.edu"
                        )
                    }
                >
                    <ThemedText style={styles.link}>
                        support@contact.com
                    </ThemedText>
                </TouchableOpacity>
            </ThemedCard>

            <ThemedCard style={styles.card}>
                <View style={styles.row}>
                    <Globe size={20} color={theme.primary} />
                    <ThemedText style={styles.cardTitle}>
                        Official Website
                    </ThemedText>
                </View>

                <ThemedText style={styles.cardText}>
                    Our web platform is currently under development.
                </ThemedText>

                <TouchableOpacity onPress={() => setShowComingSoon(true)}>
                    <ThemedText style={styles.link}>
                        www.yourapp.com
                    </ThemedText>
                </TouchableOpacity>
            </ThemedCard>

            <ThemedCard style={styles.card}>
                <View style={styles.row}>
                    <Clock size={20} color={theme.primary} />
                    <ThemedText style={styles.cardTitle}>
                        Response Time
                    </ThemedText>
                </View>

                <ThemedText style={styles.cardText}>
                    We typically respond to all inquiries within:
                </ThemedText>

                <ThemedText style={styles.highlight}>24 hours</ThemedText>
            </ThemedCard>

            <View style={styles.footer}>
                <LifeBuoy size={18} color={theme.mutedText} />
                <ThemedText style={styles.footerText}>
                    For faster support, please include your booking ID or service
                    name in your message.
                </ThemedText>
            </View>

            <Modal
                visible={showComingSoon}
                transparent
                animationType="fade"
                onRequestClose={() => setShowComingSoon(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <ThemedText style={styles.modalTitle}>
                            Coming Soon
                        </ThemedText>

                        <ThemedText style={styles.modalText}>
                            Our web application is currently under development.
                            Stay tuned for updates!
                        </ThemedText>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowComingSoon(false)}
                        >
                            <ThemedText style={styles.modalButtonText}>
                                Got it
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            paddingHorizontal: 16,
        },

        header: {
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
        },

        headerTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: theme.text,
        },

        intro: {
            fontSize: 14,
            color: theme.mutedText,
            marginBottom: 16,
            marginTop: 6,
            lineHeight: 20,
            marginHorizontal: 16
        },

        card: {
            padding: 16,
            marginBottom: 14,
            marginHorizontal: 16
        },

        row: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
        },

        cardTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: theme.text,
        },

        cardText: {
            fontSize: 14,
            color: theme.mutedText,
            marginBottom: 8,
            lineHeight: 20,
        },

        link: {
            fontSize: 15,
            color: theme.primary,
            fontWeight: "600",
        },

        highlight: {
            fontSize: 16,
            fontWeight: "700",
            color: theme.primary,
        },

        footer: {
            marginTop: 10,
            marginBottom: 40,
            padding: 16,
            borderRadius: 14,
            backgroundColor: theme.cardBackground,
            borderWidth: 1,
            borderColor: theme.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginHorizontal: 16
        },

        footerText: {
            fontSize: 13,
            color: theme.mutedText,
            flex: 1,
            lineHeight: 18,
        },

        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },

        modalBox: {
            width: "100%",
            borderRadius: 16,
            padding: 20,
            backgroundColor: theme.cardBackground,
            alignItems: "center",
        },

        modalTitle: {
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 8,
        },

        modalText: {
            fontSize: 14,
            color: theme.mutedText,
            textAlign: "center",
            marginBottom: 16,
            lineHeight: 20,
        },

        modalButton: {
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            backgroundColor: theme.primary,
        },

        modalButtonText: {
            color: "#fff",
            fontWeight: "600",
        },
    });
