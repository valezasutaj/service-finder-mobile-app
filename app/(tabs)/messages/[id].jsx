import { useEffect, useState } from "react";
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


export default function ChatPage() {
    const { id: receiverId } = useLocalSearchParams();
    const { theme } = useTheme();
    const s = styles(theme);

    const [user, setUser] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [text, setText] = useState("");

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
            (msgs) => setMessages(msgs)
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

    const send = async () => {
        if (!text.trim()) return;

        await messageService.sendMessage({
            senderId: user.uid,
            receiverId,
            message: text,
        });

        setText("");
        messageService.setTyping(chatId, user.uid, false);
    };

    if (!user || !otherUser) return null;

    const formatTime = (createdAt) => {
        if (!createdAt || typeof createdAt.toDate !== "function") return "";
        const d = createdAt.toDate();
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <ThemedView safe style={s.container}>
            <View style={s.header}>
                <View style={s.headerLeft}>
                    <TouchableOpacity style={s.backButton} onPress={() => safeRouter.back()}>
                        <ThemedText style={s.backArrow}>←</ThemedText>
                    </TouchableOpacity>

                    <View style={s.headerUser}>
                        <Image source={{ uri: otherUser.avatar }} style={s.headerAvatar} />
                        <View style={s.headerText}>
                            <ThemedText style={s.headerName}>{otherUser.fullName}</ThemedText>
                            <ThemedText style={s.headerStatus}>Online</ThemedText>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={s.menuButton}>
                    <ThemedText style={s.menuDots}>⋯</ThemedText>
                </TouchableOpacity>
            </View>

            <View style={s.chatArea}>
                <FlatList
                    data={messages}
                    keyExtractor={(m) => m.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 16 }}
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
        backArrow: {
            fontSize: 20,
            fontWeight: "600",
            color: theme.text,
        },
        headerUser: {
            flexDirection: "row",
            alignItems: "center",
        },
        headerAvatar: {
            width: 44,
            height: 44,
            borderRadius: 22,
            marginRight: 12,
        },
        headerText: {
            flex: 1,
        },
        headerName: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.text,
        },
        headerStatus: {
            fontSize: 14,
            color: "#19C463",
            marginTop: 2,
        },
        menuButton: {
            padding: 8,
        },
        menuDots: {
            fontSize: 20,
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
            borderBottomLeftRadius: 6,
        },
        typingText: {
            fontSize: 14,
            color: theme.mutedText,
            fontStyle: "italic",
        },
        inputContainer: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: theme.cardBackground,
        },
        inputRow: {
            flexDirection: "row",
            alignItems: "flex-end",
            backgroundColor: theme.cardBackground,
            borderRadius: 24,
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        attachmentBtn: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
        },
        attachmentIcon: {
            color: "#fff",
            fontSize: 18,
            fontWeight: "600",
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: theme.text,
            paddingHorizontal: 12,
            paddingVertical: 8,
            height: 40,
        },
        sendBtn: {
            width: 40,
            height: 40,
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