import React, { useState } from "react";
import { View, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { ArrowLeft, MoreVertical, MapPin, Star, MessageCircle } from "lucide-react-native";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import ThemedButton from "../../../components/ThemedButton";
import { useRouter } from "expo-router";
import { useTheme } from "../../../context/ThemedModes";

export default function ServiceDetailsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState("About");
    const styles = getStyles(theme);

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <ArrowLeft color={theme.text} size={22} />
                        </TouchableOpacity>
                        <ThemedText title style={styles.headerText}>Details</ThemedText>
                        <TouchableOpacity style={styles.iconButton}>
                            <MoreVertical color={theme.text} size={22} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.imageWrapper}>
                    <Image source={require("../../../assets/images/services/electrician.jpg")} style={styles.headerImage} />
                </View>

                <View style={styles.bodyContainer}>
                    <ThemedText style={styles.category}>Best Service</ThemedText>
                    <ThemedText title style={styles.title}>Service Name</ThemedText>

                    <View style={styles.row}>
                        <MapPin size={17} color={theme.text} />
                        <ThemedText style={styles.mutedText}>1.2 km</ThemedText>
                        <Star size={17} color="#FFD700" fill="#FFD700" style={{ marginLeft: 15 }} />
                        <ThemedText style={styles.mutedText}>5.0 (1.5k Reviews)</ThemedText>
                    </View>

                    <ThemedText title style={styles.price}>
                        $50 <ThemedText style={styles.priceUnit}>(Per Hours)</ThemedText>
                    </ThemedText>

                    <View style={styles.tabs}>
                        {["About", "Gallery", "Review", "Services"].map((tab) => (
                            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                                <ThemedText style={[styles.tabText, activeTab === tab && { color: theme.primary, fontWeight: "700" }]}>{tab}</ThemedText>
                                {activeTab === tab && (<View style={[styles.activeUnderline, { backgroundColor: theme.primary }]} />)}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {activeTab === "About" && (
                        <View style={{ marginTop: 10 }}>
                            <ThemedText style={styles.aboutTitle}>About Services</ThemedText>

                            <ThemedText style={styles.aboutText}>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem, dolorem accusamus rerum perspiciatis, pariatur unde enim, vel libero veritatis velit quasi rem. Ab ad ex ipsam?
                            </ThemedText>
                        </View>
                    )}

                    <ThemedCard style={styles.providerCard}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image source={require("../../../assets/images/services/working.png")} style={styles.providerImage} />
                            <View style={{ marginLeft: 10 }}>
                                <ThemedText title style={{ fontSize: 15 }}>Name Surname</ThemedText>
                                <ThemedText>Service Provider</ThemedText>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callButton}>
                            <MessageCircle size={20} color="#fff" strokeWidth={2} />
                        </TouchableOpacity>
                    </ThemedCard>
                </View>
            </ScrollView>

            <View style={styles.bottomFixed}>
                <ThemedButton>
                    <ThemedText style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Book Service Now</ThemedText>
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
            elevation: 4,
        },

        imageWrapper: {
            marginTop: 0,
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
            fontSize: 22,
            fontWeight: "700",
            color: theme.text,
            marginBottom: 8,
        },

        row: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
        },

        mutedText: {
            marginLeft: 4,
            color: theme.mutedText,
            fontSize: 13.5,
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
            marginTop: 20,
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