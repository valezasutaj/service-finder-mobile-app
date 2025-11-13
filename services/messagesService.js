import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTIONS = {
    MESSAGES: 'messages',
};

export const messageService = {
    sendMessage: async (messageData) => {
        try {
            const messageDoc = {
                senderId: messageData.senderId,
                senderName: messageData.senderName,
                receiverId: messageData.receiverId,
                receiverName: messageData.receiverName,
                message: messageData.message,
                isRead: false,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), messageDoc);
            return { id: docRef.id, ...messageDoc };
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    getConversation: async (userId1, userId2) => {
        try {
            const messagesQuery = query(
                collection(db, COLLECTIONS.MESSAGES),
                where('senderId', 'in', [userId1, userId2]),
                where('receiverId', 'in', [userId1, userId2]),
                orderBy('createdAt', 'asc')
            );

            const querySnapshot = await getDocs(messagesQuery);
            const messages = [];
            querySnapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() }));
            return messages;
        } catch (error) {
            console.error('Error getting conversation:', error);
            throw error;
        }
    },

    getUserConversations: async (userId) => {
        try {
            const messagesQuery = query(
                collection(db, COLLECTIONS.MESSAGES),
                where('senderId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(messagesQuery);
            const conversations = [];
            querySnapshot.forEach((doc) => {
                const message = doc.data();
                conversations.push({
                    id: doc.id,
                    userId: message.receiverId,
                    name: message.receiverName,
                    lastMessage: message.message,
                    time: message.createdAt,
                    unread: false
                });
            });

            return conversations;
        } catch (error) {
            console.error('Error getting conversations:', error);
            throw error;
        }
    }
};
