import React, { useState } from "react";
import { View, StyleSheet, Image, Switch, TouchableOpacity, ScrollView } from "react-native";
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import ThemedCard from "../components/ThemedCard";
import NavBar from "../components/NavBar";
import { Colors } from "../constants/Colors";
import { useColorScheme } from 'react-native';
import { ChevronRight, UserRound, Settings, LifeBuoy, LogOut } from "lucide-react-native";
import { useTheme } from '../context/ThemedModes';


const Profile = () => {
    const { theme, isDarkMode, userPreference, setLightMode, setDarkMode, setSystemMode } = useTheme();

    const themeStyle = styles(theme);

    return (
        <ThemedView safe style={[themeStyle.container, { backgroundColor: theme.profileBackground }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 10 }}>
                <View style={themeStyle.profileSection}>
                    <Image
                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png", }}
                        style={[themeStyle.profileImage, { borderColor: theme.border }]}
                    />
                    <View>
                        <ThemedText title style={[themeStyle.name, { color: theme.title }]}>Name Surname</ThemedText>
                        <ThemedText style={[themeStyle.email, { color: theme.mutedText ?? theme.text }]}>namesurname@gmail.com</ThemedText>
                    </View>
                </View>

                <ThemedCard style={[themeStyle.section, { borderColor: theme.border, backgroundColor: theme.surface ?? theme.cardBackground, shadowOpacity: 0, elevation: 0, shadowColor: 'transparent' }]}>
                    <View style={themeStyle.sectionHeader}>
                        <UserRound color={theme.profileIcon} size={26} strokeWidth={1.2} />
                        <ThemedText title style={[themeStyle.sectionTitle, { color: theme.profileIcon }]}>Account</ThemedText>
                    </View>
                    {["Edit profile", "Change password", "Recent Activity"].map((item, index) => (
                        <TouchableOpacity key={index} style={themeStyle.row}>
                            <ThemedText style={[themeStyle.rowText, { color: theme.text }]}>{item}</ThemedText>
                            <ChevronRight color={theme.profileIcon} size={22} />
                        </TouchableOpacity>
                    ))}
                </ThemedCard>

                <ThemedCard style={[themeStyle.section, { borderColor: theme.border, backgroundColor: theme.surface ?? theme.cardBackground, shadowOpacity: 0, elevation: 0, shadowColor: 'transparent' }]}>
                    <View style={themeStyle.sectionHeader}>
                        <Settings color={theme.profileIcon} size={26} strokeWidth={1.2} />
                        <ThemedText title style={[themeStyle.sectionTitle, { color: theme.profileIcon }]}>Settings</ThemedText>
                    </View>
                    <View style={themeStyle.row}>
                        <ThemedText style={[themeStyle.rowText, { color: theme.text }]}>Appearance</ThemedText>
                    </View>

                    <View style={themeStyle.modeContainer}>
                        {[
                            { label: 'System', value: null },
                            { label: 'Light', value: 'light' },
                            { label: 'Dark', value: 'dark' },
                        ].map(({ label, value }) => (
                            <TouchableOpacity key={label}
                                onPress={() => value === null ? setSystemMode() : value === 'light' ? setLightMode() : setDarkMode()}
                                style={[themeStyle.modeButton, userPreference === value || (value === null && userPreference === null) ? themeStyle.modeButtonActive : {}]}
                            >
                                <ThemedText style={[themeStyle.modeButtonText, { color: userPreference === value || (value === null && userPreference === null) ? theme.onPrimary : theme.text }]}>
                                    {label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {["Notifications", "Language and Region"].map((item, index) => (
                        <TouchableOpacity key={index} style={themeStyle.row}>
                            <ThemedText style={[themeStyle.rowText, { color: theme.text }]}>{item}</ThemedText>
                            <ChevronRight color={theme.profileIcon} size={22} />
                        </TouchableOpacity>
                    ))}
                </ThemedCard>

                <ThemedCard style={[themeStyle.section, { borderColor: theme.border, backgroundColor: theme.surface ?? theme.cardBackground, shadowOpacity: 0, elevation: 0, shadowColor: 'transparent' }]}>
                    <View style={themeStyle.sectionHeader}>
                        <LifeBuoy color={theme.profileIcon} size={26} strokeWidth={1.2} />
                        <ThemedText title style={[themeStyle.sectionTitle, { color: theme.profileIcon }]}>Support</ThemedText>
                    </View>
                    <TouchableOpacity style={themeStyle.row}>
                        <ThemedText style={[themeStyle.rowText, { color: theme.text }]}>Contact us</ThemedText>
                        <ChevronRight color={theme.profileIcon} size={22} />
                    </TouchableOpacity>
                </ThemedCard>

                {/*LOG OUTI qe s'vyn nihere*/}

                {/* <ThemedCard style={[themeStyle.logoutButton, {borderColor: theme.border, backgroundColor: theme.surface ?? theme.cardBackground, shadowOpacity: 0, elevation: 0, shadowColor: 'transparent'}]}>
                    <View style={themeStyle.logoutRow}>
                        <LogOut color={"#da0000ff"} size={20} strokeWidth={2.5}/>
                        <ThemedText style={[themeStyle.logoutText, { color: "#da0000ff" }]}>Logout</ThemedText>
                    </View>
                </ThemedCard> */}
            </ScrollView>
            <NavBar />
        </ThemedView>
    );
};

export default Profile;

const styles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            paddingTop: 16,
            paddingHorizontal: 24,
        },
        profileSection: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 10,
            marginHorizontal: 10,
            gap: 14,
        },
        profileImage: {
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 1.5,
        },
        name: {
            fontSize: 18,
            fontWeight: "700",
        },
        email: {
            fontSize: 13,
            opacity: 0.8,
        },
        section: {
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 10,
            paddingVertical: 10,
        },
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "700",
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 10,
        },
        rowText: {
            fontSize: 15,
        },
        // logoutButton: {
        //     alignItems: "center",
        //     backgroundColor: theme.surface,
        //     borderWidth: 1,
        //     borderColor: theme.border,
        // },
        // logoutRow: {
        //     flexDirection: "row",
        //     gap: 8,
        //     justifyContent: "center",
        // },
        // logoutText: {
        //     fontWeight: "600",
        //     fontSize: 16,
        // },
        modeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            marginBottom: 10,
        },
        modeButton: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            marginHorizontal: 1,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
        },
        modeButtonActive: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        modeButtonText: {
            fontWeight: '600',
        },
    });
