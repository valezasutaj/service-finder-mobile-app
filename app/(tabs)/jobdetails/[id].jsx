import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { ArrowLeft, MoreVertical, MessageCircle } from "lucide-react-native";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import ThemedButton from "../../../components/ThemedButton";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../context/ThemedModes";
import { jobService } from "../../../services/jobsService";
import { getCategoryIcon } from "../../../services/imagesMap";
import { safeRouter } from "../../../utils/SafeRouter";


export default function ServiceDetailsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { id, image } = useLocalSearchParams();
    const selectedImage = image ? JSON.parse(image) : null;
    const [activeTab, setActiveTab] = useState("About");
    const [job, setJob] = useState(null);
    const styles = getStyles(theme);

    useEffect(() => {
        const load = async () => {
            const jobs = await jobService.getJobs();
            const found = jobs.find(j => String(j.id) === String(id));
            setJob(found);
        };
        load();
    }, [id]);

    if (!job) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <ArrowLeft color={theme.text} size={22} />
                        </TouchableOpacity>

                        <ThemedText title style={styles.headerText}>Details</ThemedText>

                        <TouchableOpacity style={{ color: theme.background, padding: 10 }}>
                            <MoreVertical color={theme.background} size={22} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.imageWrapper}>
                    <Image
                        source={selectedImage || getCategoryIcon(job.categories?.[0]?.icon)}
                        style={styles.headerImage}
                    />
                </View>

                <View style={styles.bodyContainer}>
                    <ThemedText style={styles.category}>{job.categories?.[0]?.label}</ThemedText>

                    <ThemedText title style={styles.title}>{job.name}</ThemedText>

                    <ThemedText title style={styles.price}>
                        ${job.price} <ThemedText style={styles.priceUnit}>(Per Hour)</ThemedText>
                    </ThemedText>

                    <View style={styles.tabs}>
                        {["About", "Gallery", "Review", "Services"].map((tab) => (
                            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                                <ThemedText
                                    style={[
                                        styles.tabText,
                                        activeTab === tab && { color: theme.primary, fontWeight: "700" }
                                    ]}
                                >
                                    {tab}
                                </ThemedText>

                                {activeTab === tab && (
                                    <View style={[styles.activeUnderline, { backgroundColor: theme.primary }]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {activeTab === "About" && (
                        <View style={{ marginTop: 10 }}>
                            <ThemedText style={styles.aboutTitle}>About Service</ThemedText>
                            <ThemedText style={styles.aboutText}>{job.description}</ThemedText>
                        </View>
                    )}

                    {activeTab === "Gallery" && (
                        <View style={{ marginTop: 10 }}>
                            <ThemedText style={styles.aboutText}>No photos yet.</ThemedText>

                        </View>
                    )}

                    {activeTab === "Review" && (
                        <View style={{ marginTop: 10 }}>
                            <ThemedText style={styles.aboutText}>No reviews yet.</ThemedText>

                        </View>
                    )}

                    {activeTab === "Services" && (
                        <View style={{ marginTop: 10 }}>
                            <ThemedText style={styles.aboutText}>No other services yet.</ThemedText>

                        </View>
                    )}

                    <ThemedCard style={styles.providerCard}>

                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={() => safeRouter.push(`/profile/${job.provider.uid}`)}
                        >
                            <Image source={{ uri: job.provider?.avatar }} style={styles.providerImage} />
                            <View style={{ marginLeft: 10 }}>
                                <ThemedText title style={{ fontSize: 15 }}>
                                    {job.provider?.fullName}
                                </ThemedText>
                                <ThemedText>Service Provider</ThemedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.callButton, { backgroundColor: theme.primary }]}
                            onPress={() => safeRouter.push(`/messages/${job.provider.uid}`)}
                        >
                            <MessageCircle size={20} color="#fff" strokeWidth={2} />
                        </TouchableOpacity>

                    </ThemedCard>

                </View>
            </ScrollView>

            <View style={styles.bottomFixed}>
                <ThemedButton>
                    <ThemedText style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                        Book Service Now
                    </ThemedText>
                </ThemedButton>
            </View>
        </ThemedView>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        headerContainer: {
            paddingHorizontal: 16,
            height: 70,
            justifyContent: "center",
            backgroundColor: theme.background,
        },
        headerButtons: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        headerText: {
            fontSize: 22,
            fontWeight: "700",
            color: theme.text,
        },
        iconButton: {
            backgroundColor: theme.cardBackground,
            padding: 10,
            borderRadius: 40,
        },
        imageWrapper: {
            alignItems: "center",
        },
        headerImage: {
            width: "90%",
            height: 260,
            borderRadius: 20,
        },
        bodyContainer: {
            paddingHorizontal: 18,
            marginTop: 15,
        },
        category: {
            color: theme.primary,
            fontWeight: "600",
            marginBottom: 4,
        },
        title: {
            fontSize: 26,
            fontWeight: "700",
            color: theme.text,
            marginBottom: 8,
        },
        price: {
            fontSize: 24,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 12,
        },
        priceUnit: {
            fontSize: 14,
            color: theme.mutedText,
        },
        tabs: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
            marginTop: 20
        },
        tabText: {
            fontSize: 15,
            color: theme.text,
        },
        activeUnderline: {
            height: 2,
            marginTop: 6,
        },
        aboutTitle: {
            fontSize: 15,
            fontWeight: "700",
            color: theme.text,
            marginBottom: 6,
        },
        aboutText: {
            fontSize: 14,
            color: theme.mutedText,
            lineHeight: 20,
        },
        providerCard: {
            marginTop: 30,
            flexDirection: "row",
            paddingVertical: 14,
            paddingHorizontal: 12,
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theme.cardBackground,
        },
        providerImage: {
            width: 50,
            height: 50,
            borderRadius: 50,
        },
        callButton: {
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 23,
        },
        bottomFixed: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
        },
    });
