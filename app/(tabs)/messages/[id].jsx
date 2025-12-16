import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    AppState
} from "react-native";

import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import LoginRequiredScreen from "../../../components/LoginRequiredScreen";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../context/ThemedModes";
import { messageService } from "../../../services/messagesService";
import { userService } from "../../../services/userService";
import { getUser } from "../../../services/storageService";
import { safeRouter } from "../../../utils/SafeRouter";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default function ChatPage() {
    const { id: receiverId } = useLocalSearchParams();
    const { theme } = useTheme();
    const s = styles(theme);

    const [user, setUser] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [text, setText] = useState("");
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    const [listReady, setListReady] = useState(false);
    const [otherUserStatus, setOtherUserStatus] = useState(null);
    const [isMarkingRead, setIsMarkingRead] = useState(false);

    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const chatId =
        user && receiverId ? [user.uid, receiverId].sort().join("_") : null;

    const scrollToBottom = useCallback(() => {
        if (!flatListRef.current) return;
        requestAnimationFrame(() => {
            flatListRef.current.scrollToEnd({ animated: true });
        });
    }, []);

    const canViewProfile = useMemo(() => {
        return otherUser?.privacy?.profileVisibility !== false;
    }, [otherUser]);

    const isOtherUserVisible =
        !!otherUser && otherUser?.privacy?.profileVisibility !== false;

    const canSeeActivity = useMemo(() => {
        if (!isOtherUserVisible) return false;

        return (
            user?.privacy?.activityStatus !== false &&
            otherUser?.privacy?.activityStatus !== false
        );
    }, [user, otherUser, isOtherUserVisible]);

    const canShowReadReceipts = useMemo(() => {
        return user?.privacy?.readReceipts !== false &&
            otherUser?.privacy?.readReceipts !== false;
    }, [user, otherUser]);

    const otherUserName = useMemo(() => {
        if (!otherUser) return "Loading...";
        return canViewProfile ? otherUser.fullName : "User Not Found";
    }, [otherUser, canViewProfile]);

    const otherUserAvatar = useMemo(() => {
        if (!otherUser) return null;
        return canViewProfile ? otherUser.avatar : null;
    }, [otherUser, canViewProfile]);

    const lastChatMessage = useMemo(() => {
        if (!messages.length) return null;
        return messages[messages.length - 1];
    }, [messages]);


    const markMessagesAsRead = useCallback(async () => {
        if (!user || !receiverId || isMarkingRead) return;

        setIsMarkingRead(true);
        try {
            if (canShowReadReceipts) {
                await messageService.markAllAsRead(user.uid, receiverId);
            } else {
                const unreadMessages = messages.filter(msg =>
                    msg.receiverId === user.uid &&
                    !msg.delivered
                );

                for (const msg of unreadMessages) {
                    await messageService.markAsDelivered(msg.id, user.uid);
                }
            }
        } catch (error) {
            console.error("Error marking messages as read:", error);
        } finally {
            setIsMarkingRead(false);
        }
    }, [user, receiverId, messages, canShowReadReceipts]);

    useFocusEffect(
        useCallback(() => {
            if (chatId) {
                messageService.setActiveChat(chatId);
            }

            return () => {
                messageService.clearActiveChat();
                if (chatId && user) {
                    messageService.setTyping(chatId, user.uid, false);
                }
            };
        }, [chatId, user])
    );

    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state !== "active" && chatId && user) {
                messageService.setTyping(chatId, user.uid, false);
            }
        });

        return () => sub.remove();
    }, [chatId, user]);

    useEffect(() => {
        let unsubTyping = null;

        if (chatId && user) {
            unsubTyping = messageService.listenTyping(chatId, (data) => {
                if (data.userId !== user.uid) {
                    setTyping(data.isTyping);
                }
            });
        }

        return () => {
            unsubTyping && unsubTyping();
        };
    }, [chatId, user]);

    useEffect(() => {
        let unsubPresence = null;

        if (receiverId && canSeeActivity) {
            unsubPresence = messageService.listenUserPresence(
                receiverId,
                (status) => setOtherUserStatus(status)
            );
        } else {
            setOtherUserStatus(null);
        }

        return () => unsubPresence && unsubPresence();
    }, [receiverId, canSeeActivity]);


    useEffect(() => {
        let unsubMessages = null;

        const init = async () => {
            const currentUser = await getUser();

            if (!currentUser) {
                setHasCheckedAuth(true);
                return;
            }

            setUser(currentUser);

            let unsubUser = null;

            unsubUser = userService.listenUserById(receiverId, (freshUser) => {
                setOtherUser(freshUser);
            });

            unsubMessages = messageService.listenConversation(
                currentUser.uid,
                receiverId,
                (msgs) => {
                    setMessages(msgs);

                    msgs.forEach(msg => {
                        if (msg.receiverId === currentUser.uid && !msg.delivered) {
                            messageService.markAsDelivered(msg.id, currentUser.uid);
                        }
                    });
                }
            );

            setHasCheckedAuth(true);
        };

        init();

        return () => {
            unsubMessages && unsubMessages();
        };
    }, [receiverId]);

    useEffect(() => {
        if (!user || !receiverId) return;

        const unread = messages.some(
            m => m.receiverId === user.uid && !m.read
        );

        if (unread) markMessagesAsRead();
    }, [messages]);

    const send = async () => {
        if (!canSendMessages) return;
        if (!text.trim() || !user) return;

        await messageService.sendMessage({
            senderId: user.uid,
            receiverId,
            message: text.trim(),
        });

        setText("");

        if (chatId) {
            messageService.setTyping(chatId, user.uid, false);
        }
    };

    const handleTyping = (v) => {
        if (!canSendMessages) return;

        setText(v);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (chatId && user) {
            messageService.setTyping(chatId, user.uid, v.trim().length > 0);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (chatId && user) {
                messageService.setTyping(chatId, user.uid, false);
            }
        }, 2000);
    };

    const formatTime = (createdAt) => {
        if (!createdAt?.toDate) return "";
        const d = createdAt.toDate();
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDateSeparator = (createdAt) => {
        if (!createdAt?.toDate) return "";
        const d = createdAt.toDate();
        return d.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const canSendMessages = useMemo(() => {
        if (!user || !otherUser) return false;

        const myVisible = user?.privacy?.profileVisibility !== false;
        const otherVisible = otherUser?.privacy?.profileVisibility !== false;

        return myVisible && otherVisible;
    }, [user, otherUser]);

    const buildChatItems = (msgs) => {
        if (!Array.isArray(msgs)) return [];

        const items = [];
        let lastDateKey = null;

        const sorted = [...msgs].sort(
            (a, b) =>
                (a.createdAt?.toMillis?.() ?? 0) -
                (b.createdAt?.toMillis?.() ?? 0)
        );

        sorted.forEach((msg) => {
            const d = msg.createdAt?.toDate?.();
            const dateKey = d ? d.toISOString().split("T")[0] : "unknown";

            if (dateKey !== lastDateKey) {
                items.push({
                    id: `date-${dateKey}`,
                    type: "date",
                    label: formatDateSeparator(msg.createdAt),
                });
                lastDateKey = dateKey;
            }

            items.push({ ...msg, type: "message" });
        });

        return items;
    };

    const chatItems = useMemo(() => {
        const items = buildChatItems(messages);
        if (typing && canSeeActivity) {
            items.push({ id: "typing", type: "typing" });
        }
        return items;
    }, [messages, typing, canSeeActivity]);

    const renderStatusIndicator = () => {
        if (!canSeeActivity || !otherUserStatus) return null;

        if (otherUserStatus.isOnline) {
            return (
                <View style={s.statusContainer}>
                    <View style={[s.statusDot, { backgroundColor: "#2ecc71" }]} />
                    <ThemedText style={s.statusText}>Online</ThemedText>
                </View>
            );
        }

        if (otherUserStatus.lastSeenText) {
            return (
                <View style={s.statusContainer}>
                    <ThemedText style={s.statusText}>
                        Last seen {otherUserStatus.lastSeenText}
                    </ThemedText>
                </View>
            );
        }

        return null;
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ThemedView safe style={s.container}>
                {!user && hasCheckedAuth ? (
                    <LoginRequiredScreen
                        onLogin={() => safeRouter.push("/login")}
                        onSignup={() => safeRouter.push("/signup")}
                        message="Please login to view your messages."
                    />
                ) : !otherUser ? (
                    <View style={{ flex: 1 }} />
                ) : (
                    <>
                        <View style={s.header}>
                            <View style={s.headerLeft}>
                                <TouchableOpacity
                                    style={s.backButton}
                                    onPress={() => safeRouter.back()}
                                >
                                    <ArrowLeft color={theme.text} size={22} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        safeRouter.push(`/profile/${otherUser.uid}`);
                                    }}
                                >
                                    <View style={s.headerUser}>
                                        {otherUserAvatar ? (
                                            <Image
                                                source={{ uri: otherUserAvatar }}
                                                style={s.headerAvatar}
                                            />
                                        ) : canViewProfile ? (
                                            <View style={s.headerAvatarPlaceholder}>
                                                <Ionicons name="person" size={20} color={theme.mutedText} />
                                            </View>
                                        ) : (
                                            <View style={s.hiddenAvatar}>
                                                <EyeOff size={20} color={theme.mutedText} />
                                            </View>
                                        )}

                                        <View style={s.headerText}>
                                            <ThemedText style={s.headerName}>
                                                {otherUserName}
                                            </ThemedText>
                                            {renderStatusIndicator()}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={s.chatArea}>
                            <FlatList
                                ref={flatListRef}
                                data={chatItems}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingVertical: 16 }}
                                onLayout={() => {
                                    setListReady(true);
                                    scrollToBottom();
                                }}
                                onContentSizeChange={() => {
                                    if (listReady) scrollToBottom();
                                }}
                                renderItem={({ item }) => {
                                    if (item.type === "date") {
                                        return (
                                            <View style={s.dateSeparator}>
                                                <ThemedText style={s.dateText}>
                                                    {item.label}
                                                </ThemedText>
                                            </View>
                                        );
                                    }

                                    if (item.type === "typing") {
                                        return (
                                            <View style={s.typingWrapper}>
                                                <View style={s.typingBubble}>
                                                    <ThemedText style={s.typingText}>
                                                        {otherUserName} is typing...
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        );
                                    }

                                    const mine = item.senderId === user.uid;

                                    return (
                                        <View
                                            style={[
                                                s.msgWrapper,
                                                mine
                                                    ? s.msgWrapperMe
                                                    : s.msgWrapperThem,
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    s.bubble,
                                                    mine ? s.me : s.them,
                                                ]}
                                            >
                                                <ThemedText style={s.bubbleText}>
                                                    {item.message}
                                                </ThemedText>
                                            </View>

                                            <View style={s.messageMeta}>
                                                <ThemedText style={s.timestamp}>
                                                    {formatTime(item.createdAt)}
                                                </ThemedText>

                                                {canShowReadReceipts &&
                                                    item.read &&
                                                    item.senderId === user.uid &&
                                                    lastChatMessage?.id === item.id && (
                                                        <ThemedText style={s.seenText}>
                                                            Seen
                                                        </ThemedText>
                                                    )}


                                                {item.senderId === user.uid &&
                                                    !item.read &&
                                                    canShowReadReceipts && (
                                                        <ThemedText style={s.sentText}>
                                                            ✔
                                                        </ThemedText>)}
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        </View>

                        {!canSendMessages && (
                            <View style={{ paddingVertical: 8 }}>
                                <ThemedText
                                    style={{
                                        textAlign: "center",
                                        fontSize: 13,
                                        color: theme.mutedText
                                    }}
                                >
                                    Messaging is disabled because one of the profiles is hidden.
                                </ThemedText>
                            </View>
                        )}


                        <View style={s.inputContainer}>
                            <View style={s.inputRow}>
                                <TextInput
                                    value={text}
                                    onChangeText={handleTyping}
                                    placeholder={
                                        canSendMessages
                                            ? "Message..."
                                            : ""
                                    }
                                    editable={canSendMessages}
                                    placeholderTextColor={theme.mutedText}
                                    style={s.input}
                                    multiline
                                />

                                <TouchableOpacity
                                    onPress={send}
                                    style={[
                                        s.sendBtn,
                                        (!text.trim() || !canSendMessages) && s.sendBtnDisabled
                                    ]}
                                    disabled={!text.trim() || !canSendMessages}
                                >
                                    <ThemedText style={s.sendIcon}>➤</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </ThemedView>
        </KeyboardAvoidingView>
    );
}

const styles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.cardBackground,
        },
        headerLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        backButton: {
            padding: 8,
            marginRight: 8,
        },
        headerUser: {
            flexDirection: "row",
            alignItems: "center",
        },
        headerAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
        },
        hiddenAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
            backgroundColor: theme.cardBackground,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerAvatarPlaceholder: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
            backgroundColor: theme.cardBackground,
            alignItems: "center",
            justifyContent: "center",
        },

        headerText: {
            flex: 1,
        },
        headerName: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.text,
        },
        statusContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 2,
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 6,
        },
        statusText: {
            fontSize: 12,
            color: theme.mutedText,
        },
        chatArea: {
            flex: 1,
            paddingHorizontal: 16,
        },
        dateSeparator: {
            alignItems: "center",
            marginVertical: 12,
        },
        dateText: {
            fontSize: 12,
            color: theme.mutedText,
            paddingVertical: 4,
            paddingHorizontal: 10,
            backgroundColor: theme.cardBackground,
            borderRadius: 10,
        },
        msgWrapper: {
            marginVertical: 6,
        },
        msgWrapperMe: {
            alignItems: "flex-end",
        },
        msgWrapperThem: {
            alignItems: "flex-start",
        },
        bubble: {
            maxWidth: "80%",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 20,
            marginBottom: 4,
        },
        me: {
            backgroundColor: theme.primary,
            borderBottomRightRadius: 6,
        },
        them: {
            backgroundColor: theme.cardBackground,
            borderBottomLeftRadius: 6,
        },
        bubbleText: {
            fontSize: 16,
            color: theme.text,
        },
        messageMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 8,
            gap: 8,
        },
        timestamp: {
            fontSize: 12,
            color: theme.mutedText,
        },
        statusIcon: {
            fontSize: 12,
            fontWeight: '600',
        },
        typingWrapper: {
            alignItems: "flex-start",
            marginVertical: 6,
        },
        typingBubble: {
            backgroundColor: theme.cardBackground,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
        },
        typingText: {
            fontSize: 14,
            color: theme.mutedText,
            fontStyle: "italic",
        },
        inputContainer: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: theme.cardBackground,
            backgroundColor: theme.background,
        },

        inputRow: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.cardBackground,
            borderRadius: 24,
            paddingHorizontal: 15,
            height: 50,
        },

        input: {
            flex: 1,
            fontSize: 16,
            color: theme.text,
            height: "100%",
            textAlignVertical: "center",
            paddingVertical: 0,
            paddingTop: 15,
            paddingBottom: 0,
            includeFontPadding: false,
        },

        sendBtn: {
            width: 35,
            height: 35,
            borderRadius: 20,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
        },

        sendBtnDisabled: {
            backgroundColor: theme.mutedText,
            opacity: 0.5,
        },
        sendIcon: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
        },
        seenText: {
            fontSize: 12,
            color: "#3498db",
            fontWeight: "500",
        },

        sentText: {
            fontSize: 12,
            color: "#9aa0a6",
            fontWeight: "500",
        },


    });