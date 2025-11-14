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

    getUserMessages: async (uid) => {
        const q = query(
            collection(db, COLLECTION),
            where("participants", "array-contains", uid),
            orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const grouped = {};

        snap.forEach((d) => {
            const data = { id: d.id, ...d.data() };
            const other = data.senderId === uid ? data.receiverId : data.senderId;

            if (!grouped[other]) {
                grouped[other] = { ...data, otherUserId: other };
            }
        });

        return Object.values(grouped);
    },

    listenConversation: (user1, user2, callback) => {
        const q = query(
            collection(db, COLLECTION),
            where("participants", "array-contains", user1),
            orderBy("createdAt", "asc")
        );

        return onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(m => m.participants.includes(user2));

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
