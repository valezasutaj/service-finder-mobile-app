// services/categoriesService.js
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "categories";

export const categoryService = {

    getCategories: async () => {
        const snap = await getDocs(collection(db, COLLECTION));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    createCategory: async (data) => {
        const category = {
            label: data.label,
            icon: data.icon,
            createdAt: serverTimestamp()
        };

        const ref = await addDoc(collection(db, COLLECTION), category);
        return { id: ref.id, ...category };
    }
};
