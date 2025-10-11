import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemedModes';
import { useRouter, usePathname } from 'expo-router';

const NavBar = () => {
    const { theme } = useTheme();
    const themeStyles = styles(theme);
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={[themeStyles.nav, { backgroundColor: theme.uiBackground, borderTopColor: theme.border }]}>
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/home.png"
                label="Home"
                active={pathname === '/' || pathname.includes('/home')}
                onPress={() => router.push('/')}
                theme={theme}
            />
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/search.png"
                label="Browse"
                active={pathname.includes('/browse')}
                onPress={() => router.push('/browse')}
                theme={theme}
            />
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/plus-math.png"
                label="Post"
                active={pathname.includes('/post')}
                onPress={() => router.push('/post')}
                theme={theme}
            />
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/chat.png"
                label="Messages"
                active={pathname.includes('/messages')}
                onPress={() => router.push('/messages')}
                theme={theme}
            />
            <NavButton
                icon="https://img.icons8.com/ios-filled/50/user.png"
                label="Profile"
                active={pathname.includes('/profile')}
                onPress={() => router.push('/profile')}
                theme={theme}
            />
        </View>
    );
};

export default NavBar;

const NavButton = ({ icon, label, onPress, active, theme }) => (
    <TouchableOpacity
        style={[
            styles(theme).navItem,
            active && styles(theme).activeNavItem(theme),
        ]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <Image
            source={{ uri: icon }}
            style={[
                styles(theme).navIcon,
                { tintColor: active ? '#fff' : theme.iconColor },
            ]}
        />
        <ThemedText
            style={[
                styles(theme).navText,
                { color: active ? '#fff' : theme.text, fontWeight: active ? '600' : '400' },
            ]}
        >
            {label}
        </ThemedText>
    </TouchableOpacity>
);

const styles = (theme) =>
    StyleSheet.create({
        nav: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 10,
            borderTopWidth: 1,
            paddingHorizontal: 10,
            paddingBottom: 30,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.uiBackground,
            borderTopColor: theme.border,
            zIndex: 10,
        },
        navItem: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 25,
        },
        activeNavItem: (theme) => ({
            backgroundColor: theme.primary,
            flexDirection: 'row',
            gap: 6,
            paddingHorizontal: 18,
            paddingVertical: 8,
        }),
        navIcon: { width: 22, height: 22 },
        navText: { fontSize: 12, paddingTop: 1 },
    });
