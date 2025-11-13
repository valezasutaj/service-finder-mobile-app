import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTIONS = {
    REVIEWS: 'reviews'
};

export const reviewService = {
    addReview: async (reviewData) => {
        try {
            const reviewDoc = {
                serviceId: reviewData.serviceId,
                bookingId: reviewData.bookingId,
                customerId: reviewData.customerId,
                customerName: reviewData.customerName,
                providerId: reviewData.providerId,
                rating: reviewData.rating,
                comment: reviewData.comment,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), reviewDoc);
            return { id: docRef.id, ...reviewDoc };
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    },

    getReviews: async (targetId, type = 'provider') => {
        try {
            const field = type === 'provider' ? 'providerId' : 'serviceId';
            const reviewsQuery = query(
                collection(db, COLLECTIONS.REVIEWS),
                where(field, '==', targetId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(reviewsQuery);
            const reviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return reviews;
        } catch (error) {
            console.error('Error getting reviews:', error);
            throw error;
        }
    }
};
