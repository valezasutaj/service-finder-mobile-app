import { useEffect, useState, useRef } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet
} from "react-native";

import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";

import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../context/ThemedModes";

import { messageService } from "../../../services/messagesService";
import { userService } from "../../../services/userService";
import { getUser } from "../../../services/storageService";
import { safeRouter } from "../../../utils/SafeRouter";
import { KeyboardAvoidingView, Platform } from "react-native";


import { ArrowLeft } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatPage() {
    const { id: receiverId } = useLocalSearchParams();
    const { theme } = useTheme();
    const s = styles(theme);

    const [user, setUser] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [text, setText] = useState("");

    const flatListRef = useRef(null);

    const chatId = user ? [user.uid, receiverId].sort().join("_") : null;

    useEffect(() => {
        const init = async () => {
            setUser(await getUser());
            setOtherUser(await userService.getUserById(receiverId));
        };
        init();
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsubMessages = messageService.listenConversation(
            user.uid,
            receiverId,
            (msgs) => {
                setMessages(msgs);
            }
        );

        const unsubTyping = messageService.listenTyping(
            chatId,
            (data) => {
                if (data.userId !== user.uid) setTyping(data.isTyping);
            }
        );

        return () => {
            unsubMessages();
            unsubTyping();
        };
    }, [user]);

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const send = async () => {
        if (!text.trim()) return;

        await messageService.sendMessage({
            senderId: user.uid,
            receiverId,
            message: text,
        });

        setText("");
        messageService.setTyping(chatId, user.uid, false);

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
    };

    if (!user || !otherUser) return null;

    const formatTime = (createdAt) => {
        if (!createdAt || typeof createdAt.toDate !== "function") return "";
        const d = createdAt.toDate();
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ThemedView safe style={s.container}>
                <View style={s.header}>
                    <View style={s.headerLeft}>
                        <TouchableOpacity style={s.backButton} onPress={() => safeRouter.back()}>
                            <ArrowLeft color={theme.text} size={22} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => safeRouter.push(`/profile/${otherUser.uid}`)}>
                            <View style={s.headerUser}>
                                {otherUser?.avatar ? (
                                    <Image
                                        source={{ uri: otherUser.avatar }}
                                        style={s.headerAvatar}
                                    />
                                ) : (
                                    <Ionicons name="person-circle" size={40} color={theme.text} style={{ marginLeft: -10, marginRight: 5 }} />
                                )}

                                <View style={s.headerText}>
                                    <ThemedText style={s.headerName}>{otherUser.fullName}</ThemedText>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={s.chatArea}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(m) => m.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 16 }}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: true })
                        }
                        onLayout={() =>
                            flatListRef.current?.scrollToEnd({ animated: false })
                        }
                        renderItem={({ item }) => {
                            const mine = item.senderId === user.uid;

                            return (
                                <View
                                    style={[
                                        s.msgWrapper,
                                        mine ? s.msgWrapperMe : s.msgWrapperThem
                                    ]}
                                >
                                    <View style={[s.bubble, mine ? s.me : s.them]}>
                                        <ThemedText style={s.bubbleText}>
                                            {item.message}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={s.timestamp}>
                                        {formatTime(item.createdAt)}
                                    </ThemedText>
                                </View>
                            );
                        }}
                    />

                    {typing && (
                        <View style={s.typingWrapper}>
                            <View style={s.typingBubble}>
                                <ThemedText style={s.typingText}>
                                    {otherUser.fullName} is typing...
                                </ThemedText>
                            </View>
                        </View>
                    )}
                </View>

                <View style={s.inputContainer}>
                    <View style={s.inputRow}>
                        <TextInput
                            value={text}
                            onChangeText={(v) => {
                                setText(v);
                                messageService.setTyping(chatId, user.uid, v.length > 0);
                            }}
                            placeholder="Message..."
                            placeholderTextColor={theme.mutedText}
                            style={s.input}
                            multiline
                        />

                        <TouchableOpacity onPress={send} style={s.sendBtn}>
                            <ThemedText style={s.sendIcon}>➤</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

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
            width: 30,
            height: 30,
            borderRadius: 22,
            marginRight: 12,
            marginLeft: -5
        },

        headerText: {
            maxWidth: 180,
        },

        headerName: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.text,
        },
        chatArea: {
            flex: 1,
            paddingHorizontal: 16,
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
        timestamp: {
            fontSize: 12,
            color: theme.mutedText,
            marginHorizontal: 8,
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
            padding: 16,
            paddingBottom: 5,
            borderTopWidth: 1,
            borderTopColor: theme.cardBackground,
        },
        inputRow: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.cardBackground,
            borderRadius: 24,
            paddingHorizontal: 12,
            height: 53,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: theme.text,
            height: 26.5,
            marginLeft: 10
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
        sendIcon: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
        },
    });
