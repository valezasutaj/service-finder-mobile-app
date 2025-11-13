import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTIONS = {
    CATEGORIES: 'categories',
};

export const categoryService = {
    getCategories: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
            const categories = [];
            querySnapshot.forEach((doc) => categories.push({ id: doc.id, ...doc.data() }));
            return categories;
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    },

    initializeCategories: async () => {
        const defaultCategories = [
            { label: 'Plumber', icon: 'plumbing_repair_services.jpg', isActive: true },
            { label: 'Electrician', icon: 'electrician_services.jpg', isActive: true },
            { label: 'Painting', icon: 'painting_services.jpg', isActive: true },
            { label: 'Car Tow', icon: 'car_tow_services.jpg', isActive: true },
            { label: 'Cleaning', icon: 'cleaning_services.png', isActive: true }
        ];
        try {
            for (const category of defaultCategories) {
                await addDoc(collection(db, COLLECTIONS.CATEGORIES), { ...category, createdAt: serverTimestamp() });
            }
        } catch (error) {
            console.error('Error initializing categories:', error);
            throw error;
        }
    }
};
