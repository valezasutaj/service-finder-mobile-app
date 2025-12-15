import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import {
    ChevronLeft,
    CalendarCheck,
    Briefcase,
    MessageCircle,
    AlertCircle
} from "lucide-react-native";

import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import { useTheme } from "../../../context/ThemedModes";
import { safeRouter } from "../../../utils/SafeRouter";

export default function HelpCenter() {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const sections = [
        {
            icon: CalendarCheck,
            title: "Bookings & Scheduling",
            points: [
                "Customers can request a booking for a selected service.",
                "Providers can accept, decline, or propose a new date and time.",
                "All booking updates are synced in real-time.",
                "Booking status changes automatically: Pending, Accepted, Declined, or Cancelled."
            ]
        },
        {
            icon: Briefcase,
            title: "Service Providers",
            points: [
                "Providers can create and manage services from their profile.",
                "Each service includes pricing, category, and availability.",
                "Providers receive booking requests instantly.",
                "Only the provider can confirm or reschedule a booking."
            ]
        },
        {
            icon: MessageCircle,
            title: "Messaging & Communication",
            points: [
                "Users can message providers directly before or after booking.",
                "Messages are delivered instantly using real-time sync.",
                "Read receipts (Seen) are shown only if privacy settings allow it.",
                "Typing indicators appear while the other user is writing."
            ]
        },
        {
            icon: AlertCircle,
            title: "Common Issues & Solutions",
            points: [
                "If a booking is not answered, it remains Pending until the provider responds.",
                "If messages are not marked as Seen, privacy settings may be disabled.",
                "Changes in booking time must be accepted by both parties.",
                "Make sure you are logged in to manage bookings or services."
            ]
        }
    ];

    return (
        <ThemedView safe style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => safeRouter.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Help Center</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.intro}>
                    Learn how bookings, services, and communication work on our platform.
                </ThemedText>

                {sections.map((section, index) => (
                    <ThemedCard key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <section.icon size={20} color={theme.primary} />
                            <ThemedText style={styles.cardTitle}>
                                {section.title}
                            </ThemedText>
                        </View>

                        {section.points.map((p, i) => (
                            <ThemedText key={i} style={styles.point}>
                                • {p}
                            </ThemedText>
                        ))}
                    </ThemedCard>
                ))}

                <TouchableOpacity
                    style={styles.contactBox}
                    onPress={() => safeRouter.push("/help/contact-us")}
                >
                    <ThemedText style={styles.contactTitle}>
                        Need further assistance?
                    </ThemedText>
                    <ThemedText style={styles.contactText}>
                        Contact our support team for booking or service-related help.
                    </ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },

        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
            paddingHorizontal: 14
        },

        headerTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: theme.text,
        },

        intro: {
            marginHorizontal: 16,
            fontSize: 14,
            color: theme.mutedText,
            marginBottom: 16,
            marginTop: 6,
        },

        card: {
            marginHorizontal: 16,
            marginBottom: 14,
            padding: 16,
        },

        cardHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
        },

        cardTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: theme.text,
        },

        point: {
            fontSize: 14,
            color: theme.mutedText,
            lineHeight: 20,
            marginBottom: 6,
        },

        contactBox: {
            marginHorizontal: 16,
            marginTop: 10,
            marginBottom: 40,
            padding: 18,
            borderRadius: 14,
            backgroundColor: theme.cardBackground,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: "center",
        },

        contactTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: theme.primary,
            marginBottom: 4,
        },

        contactText: {
            fontSize: 13,
            color: theme.mutedText,
            textAlign: "center",
        },
    });
