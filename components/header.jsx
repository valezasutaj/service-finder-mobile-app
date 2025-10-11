import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemedModes';
import { useRouter } from 'expo-router';

const Header = ({ user }) => {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    const defaultAvatar = isDarkMode
        ? 'https://img.icons8.com/ios-filled/50/ffffff/user-male-circle.png'
        : 'https://img.icons8.com/ios-filled/50/000000/user-male-circle.png';


    return (
        <View style={[styles.headerContainer, { backgroundColor: theme.uiBackground }]}>
            <View style={styles.leftSection}>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <Image
                        source={{ uri: user?.avatar || defaultAvatar }}
                        style={[styles.avatar, { borderColor: theme.primary }]}
                    />
                </TouchableOpacity>

                <View style={styles.userInfo}>
                    <ThemedText style={[styles.userName, { color: theme.text }]}>
                        {user?.name || 'Name Surname'}
                    </ThemedText>
                    <ThemedText style={[styles.userLocation, { color: theme.mutedText || theme.text }]}>
                        {user?.location || 'Kosovë, Prishtinë'}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.rightSection}>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.primary }]}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/bell.png' }}
                        style={styles.iconImage}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.primary }]}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/search.png' }}
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        borderRadius: 16,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.5,
    },
    userInfo: {
        flexDirection: 'column',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
    },
    userLocation: {
        fontSize: 11,
        opacity: 0.7,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        width: 18,
        height: 18,
    },
});
