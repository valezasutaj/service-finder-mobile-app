import {
    collection,
    addDoc,
    getDocs,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    setDoc
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "messages";
const TYPING_COLLECTION = "typing";

export const messageService = {

    listenForUserMessages: (uid, callback) => {
        const q = query(
            collection(db, COLLECTION),
            where("participants", "array-contains", uid),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));

            callback(list);
        });
    },

    listenConversation: (user1, user2, callback) => {
        const q = query(
            collection(db, COLLECTION),
            where("participants", "array-contains", user1),
            orderBy("createdAt", "asc")
        );

        return onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .filter((m) => m.participants.includes(user2));

            callback(msgs);
        });
    },

    sendMessage: async (payload) => {
        const data = {
            ...payload,
            participants: [payload.senderId, payload.receiverId],
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, COLLECTION), data);
    },

    setTyping: async (chatId, userId, isTyping) => {
        await setDoc(
            doc(db, TYPING_COLLECTION, chatId),
            {
                userId,
                isTyping,
                updatedAt: serverTimestamp()
            },
            { merge: true }
        );
    },

    listenTyping: (chatId, callback) => {
        return onSnapshot(doc(db, TYPING_COLLECTION, chatId), (snap) => {
            callback(snap.exists() ? snap.data() : { isTyping: false });
        });
    }
};
