import {
  collection,
  addDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  getDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "messages";
const TYPING_COLLECTION = "typing";
const STATUS_COLLECTION = "userStatus";
const PRESENCE_COLLECTION = "presence";

let ACTIVE_CHAT_ID = null;

export const messageService = {

  listenForUserMessages: (uid, callback) => {
    const q = query(
      collection(db, COLLECTION),
      where("participants", "array-contains", uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  listenConversation: (user1, user2, callback) => {

    const q = query(
      collection(db, COLLECTION),
      where("participants", "array-contains", user1),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.participants.includes(user2));

      callback(messages);
    });
  },

  sendMessage: async ({ senderId, receiverId, message, type = 'text' }) => {
    const messageData = {
      senderId,
      receiverId,
      message,
      type,
      participants: [senderId, receiverId],
      createdAt: serverTimestamp(),
      status: 'sent',
      delivered: false,
      read: false,
      deliveredAt: null,
      readAt: null
    };

    const docRef = await addDoc(collection(db, COLLECTION), messageData);

    await updateDoc(docRef, {
      id: docRef.id,
      status: 'sent'
    });

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        if (data.delivered) {
          updateDoc(docRef, {
            status: 'delivered',
            deliveredAt: serverTimestamp()
          });
          unsub();
        }
      }
    });

    return docRef.id;
  },

  markAsDelivered: async (messageId, receiverId) => {
    const messageRef = doc(db, COLLECTION, messageId);
    const messageSnap = await getDoc(messageRef);

    if (messageSnap.exists()) {
      const message = messageSnap.data();

      if (message.receiverId === receiverId && !message.delivered) {
        await updateDoc(messageRef, {
          delivered: true,
          status: 'delivered',
          deliveredAt: serverTimestamp()
        });
      }
    }
  },

  markAsRead: async (messageId, readerId) => {
    const messageRef = doc(db, COLLECTION, messageId);
    const messageSnap = await getDoc(messageRef);

    if (messageSnap.exists()) {
      const message = messageSnap.data();

      if (message.receiverId === readerId && !message.read) {
        await updateDoc(messageRef, {
          read: true,
          status: 'read',
          readAt: serverTimestamp()
        });
      }
    }
  },

  markAllAsRead: async (currentUserId, otherUserId) => {
    const q = query(
      collection(db, COLLECTION),
      where("participants", "array-contains", currentUserId),
      where("receiverId", "==", currentUserId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnap) => {
      const message = docSnap.data();
      if (message.senderId === otherUserId) {
        const messageRef = doc(db, COLLECTION, docSnap.id);
        batch.update(messageRef, {
          read: true,
          status: 'read',
          readAt: serverTimestamp()
        });
      }
    });

    await batch.commit();
  },

  setOnlineStatus: async (uid, isOnline) => {
    const statusRef = doc(db, STATUS_COLLECTION, uid);
    const presenceRef = doc(db, PRESENCE_COLLECTION, uid);

    const statusData = {
      isOnline,
      lastSeen: serverTimestamp(),
      lastActive: serverTimestamp(),
      platform: 'mobile'
    };

    await setDoc(statusRef, statusData, { merge: true });
    await setDoc(presenceRef, {
      isOnline,
      lastSeen: serverTimestamp(),
      uid
    }, { merge: true });
  },

  listenUserStatus: (uid, callback) => {
    return onSnapshot(doc(db, STATUS_COLLECTION, uid), (snap) => {
      callback(snap.exists() ? snap.data() : null);
    });
  },

  listenUserPresence: (uid, callback) => {
    return onSnapshot(doc(db, PRESENCE_COLLECTION, uid), (snap) => {
      const data = snap.exists() ? snap.data() : { isOnline: false };

      if (data.lastSeen) {
        const lastSeen = data.lastSeen.toDate();
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));

        data.lastSeenText = diffMinutes < 1 ? 'Just now' :
          diffMinutes < 60 ? `${diffMinutes}m ago` :
            diffMinutes < 1440 ? `${Math.floor(diffMinutes / 60)}h ago` :
              `${Math.floor(diffMinutes / 1440)}d ago`;
      }

      callback(data);
    });
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
  },

  getUnreadCount: async (userId) => {
    const q = query(
      collection(db, COLLECTION),
      where("receiverId", "==", userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  getUnreadCountForChat: async (currentUserId, otherUserId) => {
    const q = query(
      collection(db, COLLECTION),
      where("participants", "array-contains", currentUserId),
      where("senderId", "==", otherUserId),
      where("receiverId", "==", currentUserId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  listenForMessageStatus: (messageId, callback) => {
    return onSnapshot(doc(db, COLLECTION, messageId), (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      }
    });
  },

  setActiveChat: (chatId) => {
    ACTIVE_CHAT_ID = chatId;
  },

  clearActiveChat: () => {
    ACTIVE_CHAT_ID = null;
  },

  getActiveChat: () => {
    return ACTIVE_CHAT_ID;
  }
};