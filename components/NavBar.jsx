import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemedModes';
import { useRouter } from 'expo-router'; 

const NavBar = () => {
    const { theme } = useTheme();
    const themeStyles = styles(theme);
    const router = useRouter();
    return (
        <View style={[themeStyles.nav, { backgroundColor: theme.uiBackground, borderTopColor: theme.border }]}>
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/home.png"
                label="Home"
                onPress={() => router.push('/')}
                theme={theme}
            />
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/search.png"
                label="Browse"
                theme={theme}
            />
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/plus-math.png"
                label="Post"
                theme={theme}
            />
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/chat.png"
                label="Messages"
                theme={theme}
            />
        </View>
    );
};

export default NavBar;

const NavButton = ({ icon, label, onPress, theme }) => (
    <TouchableOpacity style={styles(theme).navItem} onPress={onPress}>
        <Image source={{ uri: icon }} style={[styles(theme).navIcon, { tintColor: theme.iconColor }]} />
        <ThemedText style={styles(theme).navText}>{label}</ThemedText>
    </TouchableOpacity>
);

const styles = (theme) =>
    StyleSheet.create({
        nav: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 10,
            borderTopWidth: 1,
            paddingBottom: 30,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.uiBackground,
            borderTopColor: theme.border,
            zIndex: 10,
        },
        navItem: { alignItems: 'center', paddingVertical: 0, paddingHorizontal: 10 },
        navIcon: { width: 24, height: 24 },
        navText: { fontSize: 12, paddingTop: 2 },
    });
