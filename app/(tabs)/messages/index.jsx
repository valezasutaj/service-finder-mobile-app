import { useEffect, useState } from "react";
import {
    View,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    StyleSheet
} from "react-native";

import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import NavBar from "../../../components/NavBar";

import { useTheme } from "../../../context/ThemedModes";
import { safeRouter } from "../../../utils/SafeRouter";

import { messageService } from "../../../services/messagesService";
import { userService } from "../../../services/userService";
import { getUser } from "../../../services/storageService";
import { Ionicons } from "@expo/vector-icons";

export default function Messages() {
    const { theme } = useTheme();
    const s = styles(theme);

    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let unsubscribe = null;

        const init = async () => {
            const u = await getUser();
            if (!u) return;

            setUser(u);

            unsubscribe = messageService.listenForUserMessages(
                u.uid,
                async (rawMessages) => {
                    const lastByUser = {};

                    rawMessages.forEach((m) => {
                        const other = m.senderId === u.uid ? m.receiverId : m.senderId;

                        if (!lastByUser[other]) {
                            lastByUser[other] = { ...m, otherUserId: other };
                        } else if (m.createdAt?.seconds > lastByUser[other]?.createdAt?.seconds) {
                            lastByUser[other] = { ...m, otherUserId: other };
                        }
                    });

                    const arr = Object.values(lastByUser);

                    const enriched = await Promise.all(
                        arr.map(async (m) => {
                            const otherUser = await userService.getUserById(m.otherUserId);

                            return {
                                ...m,
                                name: otherUser?.fullName || "Unknown User",
                                username: otherUser?.username || "",
                                avatar: otherUser?.avatar || null,
                            };
                        })
                    );

                    enriched.sort((a, b) => b?.createdAt?.seconds - a?.createdAt?.seconds);

                    setMessages(enriched);
                }
            );
        };

        init();
        return () => unsubscribe && unsubscribe();
    }, []);

    if (!user) return null;

    const filtered = messages.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.username.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (createdAt) => {
        if (!createdAt || typeof createdAt.toDate !== "function") return "";
        return createdAt.toDate().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatus = (item) => {
        if (item.read) return "☑☑";
        if (item.delivered) return "☑";
        return "✔";
    };

    return (
        <ThemedView safe style={s.container}>
            <View style={s.headerContainer}>
                <ThemedText title style={s.header}>Chats</ThemedText>
                <View style={s.headerSpacer} />
            </View>

            <View style={s.searchContainer}>
                <View style={s.searchInner}>
                    <TextInput
                        placeholder="Search..."
                        placeholderTextColor={theme.mutedText}
                        value={search}
                        onChangeText={setSearch}
                        style={s.searchInput}
                    />
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(i) => i.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => safeRouter.push(`/messages/${item.otherUserId}`)}
                        style={s.row}
                        activeOpacity={0.8}
                    >
                        <View style={s.avatarWrapper}>
                            {item.avatar ? (
                                <Image source={{ uri: item.avatar }} style={s.avatar} />
                            ) : (
                                <Ionicons
                                    name="person-circle"
                                    size={60}
                                    color={'black'}
                                />
                            )}
                        </View>

                        <View style={s.content}>
                            <View style={s.nameRow}>
                                <ThemedText style={s.name}>{item.name}</ThemedText>

                                <View style={s.metaRight}>
                                    <ThemedText style={s.timeText}>
                                        {formatTime(item.createdAt)}
                                    </ThemedText>
                                    <ThemedText style={s.statusIcon}>
                                        {getStatus(item)}
                                    </ThemedText>
                                </View>
                            </View>

                            <ThemedText numberOfLines={1} style={s.msg}>
                                {item.message}
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <NavBar />
        </ThemedView>
    );
}

const styles = (theme) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background, paddingTop: 8 },
        headerContainer: {
            flexDirection: "row",
            alignContent: "center",
            paddingHorizontal: 16,
            marginBottom: 20,
        },
        header: {
            marginTop: 10,
            fontSize: 22,
            fontWeight: "700",
            color: theme.text,
        },
        headerSpacer: { width: 40 },
        searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
        searchInner: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.cardBackground,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: theme.text,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 16,
            marginBottom: 2,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: theme.background,
        },
        avatarWrapper: {
            width: 60,
            height: 60,
            borderRadius: 30,
            overflow: "hidden",
            marginRight: 12,
            backgroundColor: "#e6e6e6",
            alignItems: "center",
            justifyContent: "center",
        },
        avatar: {
            width: "100%",
            height: "100%",
            resizeMode: "cover",
        },
        content: {
            flex: 1,
            borderBottomWidth: 1,
            borderBottomColor: theme.cardBackground,
            paddingBottom: 12,
        },
        nameRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
        },
        name: { fontSize: 17, fontWeight: "600", color: theme.text },
        metaRight: { alignItems: "flex-end" },
        timeText: { fontSize: 13, color: theme.mutedText, marginBottom: 2 },
        statusIcon: { fontSize: 12, color: theme.primary },
        msg: { fontSize: 15, color: theme.mutedText },
    });
