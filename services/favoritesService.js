import { collection, getDocs, addDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { serviceService } from './servicesService';

const COLLECTIONS = {
    FAVORITES: 'favorites',
};

export const favoriteService = {
    addToFavorites: async (userId, serviceId) => {
        try {
            const favoriteDoc = {
                userId,
                serviceId,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.FAVORITES), favoriteDoc);
            return { id: docRef.id, ...favoriteDoc };
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
        }
    },

    removeFromFavorites: async (favoriteId) => {
        try {
            await deleteDoc(doc(db, COLLECTIONS.FAVORITES, favoriteId));
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        }
    },

    getUserFavorites: async (userId) => {
        try {
            const favoritesQuery = query(
                collection(db, COLLECTIONS.FAVORITES),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(favoritesQuery);
            const favorites = [];

            for (const docItem of querySnapshot.docs) {
                const favorite = docItem.data();
                const service = await serviceService.getServiceById(favorite.serviceId);
                if (service) {
                    favorites.push({
                        id: docItem.id,
                        service: service
                    });
                }
            }

            return favorites;
        } catch (error) {
            console.error('Error getting favorites:', error);
            throw error;
        }
    }
};
