import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemedModes';
import { usePathname } from 'expo-router';
import { safeRouter } from '../utils/SafeRouter';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react-native';

const NavBar = () => {
    const { theme } = useTheme();
    const themeStyles = styles(theme);
    const pathname = usePathname();

    return (
        <View style={[themeStyles.nav, { backgroundColor: theme.uiBackground, borderTopColor: theme.border }]}>
            <NavButton
                icon={Home}
                label="Home"
                active={pathname === '/' || pathname.includes('/home')}
                onPress={() => safeRouter.push('/home')}
                theme={theme}
            />
            <NavButton
                icon={Search}
                label="Browse"
                active={pathname.includes('browse')}
                onPress={() => safeRouter.push('/browse')}
                theme={theme}
            />
            <NavButton
                icon={Plus}
                label="Post"
                active={pathname.includes('/post')}
                onPress={() => safeRouter.push('/post')}
                theme={theme}
            />
            <NavButton
                icon={MessageCircle}
                label="Messages"
                active={pathname.includes('/messages')}
                onPress={() => safeRouter.push('/messages')}
                theme={theme}
            />
            <NavButton
                icon={User}
                label="Profile"
                active={pathname.includes('/myprofile')}
                onPress={() => safeRouter.push('/myprofile')}
                theme={theme}
            />
        </View>
    );
};

export default NavBar;

const NavButton = ({ icon: Icon, label, onPress, active, theme }) => (
    <TouchableOpacity
        style={[
            styles(theme).navItem,
            active && styles(theme).activeNavItem(theme),
        ]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <Icon
            size={22}
            color={active ? '#fff' : theme.iconColor}
            strokeWidth={2.2}
            fill="none"
        />

        <ThemedText style={[styles(theme).navText, { color: active ? '#fff' : theme.text, fontWeight: active ? '600' : '400' }]}>
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
        navText: { fontSize: 12, paddingTop: 1 },
    });
