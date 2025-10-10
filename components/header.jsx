import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ThemedText from './ThemedText';
import ThemedButton from './ThemedButton';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const Header = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const ProfileIcon = () => (
        <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/user-male-circle.png' }}
            style={[styles.profileIconImage, { tintColor: theme.iconColor }]}
        />
    );

    return (
        <View style={[styles.header, { backgroundColor: theme.uiBackground, borderBottomColor: theme.border }]}>
            <View style={styles.leftSection}>
                <ThemedText title style={[styles.headerTitle, { color: theme.title }]}>
                    ServiceFinder
                </ThemedText>
                <ThemedText style={[styles.headerSubtitle, { color: theme.text }]}>
                    Find the best services near you
                </ThemedText>
            </View>

            <View style={styles.rightSection}>
                <ThemedButton
                    style={styles.signInButton}
                >
                    <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Sign In</ThemedText>
                </ThemedButton>

                <ThemedButton
                    style={styles.signUpButton}
                >
                    <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Sign Up</ThemedText>
                </ThemedButton>

                <TouchableOpacity
                    style={[styles.profileButton, { backgroundColor: 'white', borderColor: theme.border }]}
                >
                    <ProfileIcon />
                </TouchableOpacity>
            </View>
        </View >
    );
};

export default Header;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    leftSection: {
        flex: 1,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.7,
    },
    signInButton: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        minHeight: 36,
    },
    signUpButton: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        minHeight: 36,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 12,
    },
    profileButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    profileIconImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
});
