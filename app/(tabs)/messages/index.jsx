import { useEffect, useState, useRef } from "react";
import {
    View,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    StyleSheet,
} from "react-native";

import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import NavBar from "../../../components/NavBar";
import LoginRequiredScreen from "../../../components/LoginRequiredScreen";

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
    const [userPresence, setUserPresence] = useState({});
    const [usersMap, setUsersMap] = useState({});
    const userListenersRef = useRef({});
    const [loading, setLoading] = useState(true);

    const canSeeActivity = (currentPrivacy, otherPrivacy) => {
        return (
            currentPrivacy?.activityStatus !== false &&
            otherPrivacy?.activityStatus !== false
        );
    };

    const attachUserListener = (uid) => {
        if (userListenersRef.current[uid]) return;

        userListenersRef.current[uid] =
            userService.listenUserById(uid, (freshUser) => {
                setUsersMap(prev => ({
                    ...prev,
                    [uid]: freshUser
                }));
            });
    };

    const attachPresenceListener = (uid) => {
        if (userListenersRef.current[`presence_${uid}`]) return;

        userListenersRef.current[`presence_${uid}`] =
            messageService.listenUserPresence(uid, (presence) => {
                setUserPresence(prev => ({
                    ...prev,
                    [uid]: presence
                }));
            });
    };

    useEffect(() => {
        let unsubMessages;

        const init = async () => {
            try {
                const u = await getUser();
                if (!u) {
                    setLoading(false);
                    return;
                }

                setUser(u);

                unsubMessages = messageService.listenForUserMessages(
                    u.uid,
                    (rawMessages) => {
                        const lastByUser = {};

                        rawMessages.forEach(m => {
                            const other =
                                m.senderId === u.uid ? m.receiverId : m.senderId;

                            if (
                                !lastByUser[other] ||
                                m.createdAt?.seconds >
                                lastByUser[other]?.createdAt?.seconds
                            ) {
                                lastByUser[other] = { ...m, otherUserId: other };
                            }

                            attachUserListener(other);
                            attachPresenceListener(other);
                        });

                        setMessages(Object.values(lastByUser));

                        setLoading(false);
                    }
                );
            } catch (e) {
                console.error("Messages load error:", e);
                setLoading(false);
            }
        };

        init();

        return () => {
            if (unsubMessages) unsubMessages();

            Object.values(userListenersRef.current).forEach(
                unsub => unsub && unsub()
            );
            userListenersRef.current = {};
        };
    }, []);


    if (!user) {
        return (
            <LoginRequiredScreen
                onLogin={() => safeRouter.push("/login")}
                onSignup={() => safeRouter.push("/signup")}
                message="Please login to view your messages."
            />
        );
    }

    const filtered = messages.filter((m) => {
        const otherUser = usersMap[m.otherUserId];
        const name = otherUser?.fullName || "User Not Found";
        const username = otherUser?.username || "";

        return (
            name.toLowerCase().includes(search.toLowerCase()) ||
            username.toLowerCase().includes(search.toLowerCase())
        );
    });


    const formatTime = (createdAt) => {
        if (!createdAt?.toDate) return "";
        return createdAt.toDate().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const shouldShowReadReceipts = (item) => {
        return (
            user.privacy?.readReceipts !== false &&
            item.privacy?.readReceipts !== false
        );
    };

    const getOnlineStatusText = (item) => {
        const otherUser = usersMap[item.otherUserId];
        if (!otherUser) return null;

        const privacy = otherUser.privacy;
        if (privacy?.profileVisibility === false) return null;
        if (!canSeeActivity(user.privacy, privacy)) return null;

        const presence = userPresence[item.otherUserId];
        if (!presence) return null;

        if (presence.isOnline) return null;
        if (presence.lastSeenText) return `Last seen ${presence.lastSeenText}`;

        return null;
    };

    const renderItem = ({ item }) => {
        const otherUser = usersMap[item.otherUserId];
        const privacy = otherUser?.privacy;
        const isHidden = privacy?.profileVisibility === false;

        const presence = userPresence[item.otherUserId];
        const isOnline = presence?.isOnline === true;
        const onlineText = getOnlineStatusText(item);

        return (
            <TouchableOpacity
                onPress={() => safeRouter.push(`/messages/${item.otherUserId}`)}
                style={s.row}
                activeOpacity={0.8}
            >
                <View style={s.avatarWrapper}>
                    {!isHidden ? (
                        otherUser?.avatar ? (
                            <Image source={{ uri: otherUser.avatar }} style={s.avatar} />
                        ) : (
                            <View style={s.avatarPlaceholder}>
                                <Ionicons name="person" size={32} color={theme.mutedText} />
                            </View>
                        )
                    ) : (
                        <View style={s.avatarPlaceholder}>
                            <Ionicons name="eye-off" size={24} color={theme.mutedText} />
                        </View>
                    )}

                    {!isHidden &&
                        canSeeActivity(user.privacy, privacy) &&
                        isOnline && (
                            <View
                                style={[
                                    s.onlineIndicator,
                                    { backgroundColor: "#2ecc71", borderColor: theme.background }
                                ]}
                            />
                        )}
                </View>

                <View style={s.content}>
                    <View style={s.nameRow}>
                        <View style={s.nameContainer}>
                            <ThemedText style={s.name}>
                                {isHidden
                                    ? "User Not Found"
                                    : otherUser?.fullName || "Loading..."}
                            </ThemedText>

                            {onlineText && (
                                <ThemedText style={s.onlineStatus}>
                                    {onlineText}
                                </ThemedText>
                            )}
                        </View>

                        <View style={s.metaRight}>
                            <ThemedText style={s.timeText}>
                                {formatTime(item.createdAt)}
                            </ThemedText>

                            {shouldShowReadReceipts(item) &&
                                item.senderId === user.uid && (
                                    <ThemedText style={s.statusIcon}>
                                        {item.read ? "✔✔" : "✔"}
                                    </ThemedText>
                                )}
                        </View>
                    </View>

                    <ThemedText numberOfLines={1} style={s.msg}>
                        {item.message}
                    </ThemedText>
                </View>
            </TouchableOpacity>
        );
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
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <ThemedText style={s.emptyText}>
                            No messages yet
                        </ThemedText>
                    </View>
                }
            />

            <NavBar />
        </ThemedView>
    );
}

const styles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            paddingTop: 8
        },
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
        searchContainer: {
            paddingHorizontal: 16,
            marginBottom: 12
        },
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
            color: theme.text
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 16,
            paddingVertical: 12,
        },
        avatarWrapper: {
            width: 60,
            height: 60,
            borderRadius: 30,
            marginRight: 12,
            backgroundColor: theme.cardBackground,
            alignItems: "center",
            justifyContent: "center",
            position: 'relative',
        },
        avatar: {
            width: "100%",
            height: "100%",
            borderRadius: 30
        },
        onlineIndicator: {
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: 2,
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
        },
        nameContainer: {
            flex: 1,
            marginRight: 8,
        },
        avatarPlaceholder: {
            width: "100%",
            height: "100%",
            borderRadius: 30,
            backgroundColor: theme.surface,
            alignItems: "center",
            justifyContent: "center",
        },
        name: {
            fontSize: 17,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 2
        },
        onlineStatus: {
            fontSize: 12,
            color: theme.mutedText,
        },
        metaRight: {
            alignItems: "flex-end",
            minWidth: 60
        },
        timeText: {
            fontSize: 13,
            color: theme.mutedText,
            marginBottom: 2
        },
        statusIcon: {
            fontSize: 12,
            color: "#3498db",
        },
        msg: {
            fontSize: 15,
            color: theme.mutedText
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 100,
        },
        emptyText: {
            fontSize: 16,
            color: theme.mutedText,
        }
    });