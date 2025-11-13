import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTIONS = {
    BOOKINGS: 'bookings',
};

export const bookingService = {
    createBooking: async (bookingData) => {
        try {
            const bookingDoc = {
                serviceId: bookingData.serviceId,
                serviceName: bookingData.serviceName,
                serviceImage: bookingData.serviceImage || '',
                customerId: bookingData.customerId,
                customerName: bookingData.customerName,
                providerId: bookingData.providerId,
                providerName: bookingData.providerName,
                price: bookingData.price || 0,
                date: bookingData.date || '',
                time: bookingData.time || '',
                address: bookingData.address || '',
                notes: bookingData.notes || '',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const docRef = await addDoc(collection(db, COLLECTIONS.BOOKINGS), bookingDoc);
            return { id: docRef.id, ...bookingDoc };
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    getUserBookings: async (userId, userType = 'customer') => {
        try {
            const field = userType === 'customer' ? 'customerId' : 'providerId';
            const bookingsQuery = query(
                collection(db, COLLECTIONS.BOOKINGS),
                where(field, '==', userId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(bookingsQuery);
            const bookings = [];
            querySnapshot.forEach((doc) => bookings.push({ id: doc.id, ...doc.data() }));
            return bookings;
        } catch (error) {
            console.error('Error getting bookings:', error);
            throw error;
        }
    },

    updateBookingStatus: async (bookingId, status) => {
        try {
            const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
            await updateDoc(bookingRef, { status, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }
};
