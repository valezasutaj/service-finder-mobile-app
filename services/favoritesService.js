import { collection, addDoc, getDocs, deleteDoc, doc, where, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "favorites";

export const favoriteService = {

    addToFavorites: async (userId, job) => {
        const payload = {
            userId,
            job,
            createdAt: serverTimestamp()
        };

        const ref = await addDoc(collection(db, COLLECTION), payload);
        return { id: ref.id, ...payload };
    },

    getUserFavorites: async (userId) => {
        const q = query(
            collection(db, COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    removeFavorite: async (id) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
