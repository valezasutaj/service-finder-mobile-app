import { View, Image, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import NavBar from '../components/NavBar';
import Spacer from '../components/Spacer';
import { useTheme } from '../context/ThemedModes';
import { useRouter } from 'expo-router';

const mockMessages = [
    {
        id: '1',
        name: 'Jane Cooper',
        message: 'Hey! Are you available tomorrow?',
        time: '10:24 AM',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        unread: true,
    },
    {
        id: '2',
        name: 'Robert Fox',
        message: 'Thanks for the service!',
        time: 'Yesterday',
        avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
        unread: false,
    },
    {
        id: '3',
        name: 'Esther Howard',
        message: 'Can we schedule for next week?',
        time: 'Mon',
        avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
        unread: false,
    },
    {
        id: '4',
        name: 'Devon Lane',
        message: 'Great experience, thank you!',
        time: 'Sun',
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
        unread: false,
    },
];

export default function Messages() {
    const { theme } = useTheme();
    const router = useRouter();
    const themeStyles = styles(theme);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/chat/${item.id}`)}
            style={[
                themeStyles.messageItem,
                {
                    backgroundColor: item.unread
                        ? theme.primary + '12'
                        : theme.cardBackground,
                    shadowOpacity: item.unread ? 0.15 : 0,
                },
            ]}
        >
            <Image source={{ uri: item.avatar }} style={themeStyles.avatar} />
            <View style={{ flex: 1 }}>
                <ThemedText style={themeStyles.name}>{item.name}</ThemedText>
                <ThemedText numberOfLines={1} style={themeStyles.message}>
                    {item.message}
                </ThemedText>
            </View>
            <View style={themeStyles.metaContainer}>
                <ThemedText style={themeStyles.time}>{item.time}</ThemedText>
                {item.unread && <View style={themeStyles.unreadDot} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView safe style={themeStyles.container}>
            <View style={themeStyles.header}>
                <ThemedText title style={themeStyles.headerText}>Messages</ThemedText>
            </View>

            <FlatList
                data={mockMessages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={false} />}
                contentContainerStyle={themeStyles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Spacer height={15} />
            <NavBar />
        </ThemedView>
    );
}

const styles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            paddingHorizontal: 16,
            paddingTop: 10,
        },
        header: {
            marginBottom: 15,
            alignItems: 'center',
        },
        headerText: {
            fontSize: 22,
            fontWeight: '700',
            color: theme.text,
        },
        listContent: {
            paddingBottom: 110,
        },
        messageItem: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 14,
            padding: 14,
            marginBottom: 12,
            gap: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 2,
        },
        avatar: {
            width: 55,
            height: 55,
            borderRadius: 28,
        },
        name: {
            fontWeight: '600',
            fontSize: 15,
            color: theme.text,
            marginBottom: 3,
        },
        message: {
            color: theme.mutedText,
            fontSize: 13,
        },
        metaContainer: {
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 45,
        },
        time: {
            fontSize: 12,
            color: theme.mutedText,
        },
        unreadDot: {
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: theme.primary,
        },
    });