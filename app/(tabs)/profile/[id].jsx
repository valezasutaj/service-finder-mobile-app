import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import NavBar from "../../../components/NavBar";
import {
    ChevronLeft,
    Star,
    MapPin,
    MessageCircle,
    Phone,
    Mail
} from "lucide-react-native";

import { useTheme } from '../../../context/ThemedModes';
import { safeRouter } from "../../../utils/SafeRouter";
import { userService } from '../../../services/userService';
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const { id: userId } = useLocalSearchParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);

    useEffect(() => {
        if (!userId) return;

        const loadUserProfile = async () => {
            setLoading(true);
            try {
                const userData = await userService.getUserById(userId);
                setUser(userData);

                const userServices = await userService.getUserServices(userId);
                setServices(userServices || []);
            } catch (error) {
                console.error('Error loading user profile:', error);
                Alert.alert('Error', 'Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [userId]);

    const handleContact = (type) => {
        switch (type) {
            case 'message':
                safeRouter.push(`/messages/${userId}`);
                break;
            case 'call':
                Alert.alert('Call', `Calling ${user?.phone || '+383 44 123 456'}`);
                break;
            case 'email':
                Alert.alert('Email', `Sending email to ${user?.email}`);
                break;
        }
    };

    const handleServicePress = (serviceId) => {
        safeRouter.push(`/service/${serviceId}`);
    };

    if (loading) {
        return (
            <ThemedView safe style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <ThemedText>Loading profile...</ThemedText>
                </View>
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <ThemedView safe style={styles.container}>
                <View style={styles.errorContainer}>
                    <ThemedText>User not found</ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView safe style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => safeRouter.back()}
                    style={styles.backButton}
                >
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Profile</ThemedText>
                <View style={styles.placeholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ThemedCard style={styles.profileSection}>

                    <View style={styles.avatarContainer}>
                        {user.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        ) : (
                            <Ionicons name="person-circle" size={100} color={theme.text} />
                        )}
                    </View>

                    <ThemedText style={styles.userName}>{user.fullName}</ThemedText>
                    <ThemedText style={styles.userTitle}>{user.profession || 'Service Provider'}</ThemedText>

                    <View style={styles.locationContainer}>
                        <MapPin size={16} color={theme.mutedText} />
                        <ThemedText style={styles.locationText}>
                            {user.location}
                        </ThemedText>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statNumber}>{user.totalJobs || 0}+</ThemedText>
                            <ThemedText style={styles.statLabel}>Jobs Done</ThemedText>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <ThemedText style={styles.statNumber}>{user.successRate || 0}%</ThemedText>
                            <ThemedText style={styles.statLabel}>Success Rate</ThemedText>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <ThemedText style={styles.statNumber}>{user.experience || 0}</ThemedText>
                            <ThemedText style={styles.statLabel}>Years Exp.</ThemedText>
                        </View>
                    </View>
                </ThemedCard>

                <View style={styles.contactContainer}>
                    <TouchableOpacity style={styles.contactButton} onPress={() => handleContact('message')}>
                        <MessageCircle size={20} color={theme.primary} />
                        <ThemedText style={styles.contactButtonText}>Message</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactButton} onPress={() => handleContact('call')}>
                        <Phone size={20} color={theme.primary} />
                        <ThemedText style={styles.contactButtonText}>Call</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactButton} onPress={() => handleContact('email')}>
                        <Mail size={20} color={theme.primary} />
                        <ThemedText style={styles.contactButtonText}>Email</ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedCard style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>About</ThemedText>
                    <ThemedText style={styles.aboutText}>
                        {user.bio || "Professional service provider with experience."}
                    </ThemedText>
                </ThemedCard>

                <ThemedCard style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Services</ThemedText>
                    </View>

                    {services.length > 0 ? (
                        services.map(service => (
                            <TouchableOpacity
                                key={service.id}
                                style={styles.serviceItem}
                                onPress={() => handleServicePress(service.id)}
                            >
                                <Image
                                    source={service.image ? { uri: service.image } : require('../../../assets/images/categories/default.png')}
                                    style={styles.serviceImage}
                                />
                                <View style={styles.serviceInfo}>
                                    <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
                                    <ThemedText style={styles.servicePrice}>${service.price}</ThemedText>
                                </View>
                                <View style={styles.serviceRating}>
                                    <Star size={14} color="#FFD700" fill="#FFD700" />
                                    <ThemedText style={styles.ratingText}>{service.rating}</ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <ThemedText style={styles.noServicesText}>No services available</ThemedText>
                    )}
                </ThemedCard>
            </ScrollView>

            <NavBar />
        </ThemedView>
    );
};

const getStyles = (theme) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
        errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        backButton: { padding: 4 },
        headerTitle: { fontSize: 18, fontWeight: "bold", color: theme.text },
        placeholder: { width: 32 },

        scrollContent: { paddingBottom: 20 },

        profileSection: { alignItems: "center", padding: 20, margin: 16, marginBottom: 8 },

        avatarContainer: { position: "relative", marginBottom: 16, top: 10 },

        avatar: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.cardBackground,
        },

        userName: {
            fontSize: 24,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 4,
            textAlign: "center",
        },

        userTitle: { fontSize: 16, color: theme.mutedText, marginBottom: 8 },

        locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 16 },

        locationText: { fontSize: 14, color: theme.mutedText, marginLeft: 4 },

        statsContainer: {
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: theme.border,
        },

        statItem: { alignItems: "center", flex: 1 },

        statNumber: { fontSize: 18, fontWeight: "bold", color: theme.text },

        statLabel: { fontSize: 12, color: theme.mutedText, marginTop: 2 },

        statDivider: { width: 1, backgroundColor: theme.border },

        contactContainer: {
            flexDirection: "row",
            justifyContent: "space-around",
            paddingHorizontal: 16,
            marginVertical: 8,
        },

        contactButton: {
            alignItems: "center",
            padding: 12,
            borderRadius: 12,
            backgroundColor: theme.cardBackground,
            minWidth: 80,
        },

        contactButtonText: { fontSize: 12, color: theme.primary, marginTop: 4 },

        section: { margin: 16, padding: 16 },

        sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },

        sectionTitle: { fontSize: 18, fontWeight: "bold", color: theme.text },

        aboutText: { fontSize: 14, color: theme.text, lineHeight: 20 },

        serviceItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },

        serviceImage: {
            width: 50,
            height: 50,
            borderRadius: 8,
            marginRight: 12,
            backgroundColor: theme.cardBackground,
        },

        serviceInfo: { flex: 1 },

        serviceName: { fontSize: 16, fontWeight: "500", color: theme.text },

        servicePrice: { fontSize: 14, color: theme.primary, fontWeight: "600" },

        serviceRating: { flexDirection: "row", alignItems: "center" },

        noServicesText: { textAlign: "center", color: theme.mutedText, paddingVertical: 20 },
    });

export default ProfileScreen;
