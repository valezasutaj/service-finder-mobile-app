import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';


const COLLECTIONS = {
    SERVICES: 'services',
};

export const serviceService = {
    getServices: async (filters = {}) => {
        try {
            let servicesQuery = collection(db, COLLECTIONS.SERVICES);

            if (filters.category && filters.category !== 'All') {
                servicesQuery = query(servicesQuery, where('category', '==', filters.category));
            }

            if (filters.search) {
                servicesQuery = query(servicesQuery, where('name', '>=', filters.search));
            }

            if (filters.sortBy === 'price_low_high') servicesQuery = query(servicesQuery, orderBy('price', 'asc'));
            else if (filters.sortBy === 'price_high_low') servicesQuery = query(servicesQuery, orderBy('price', 'desc'));
            else if (filters.sortBy === 'rating') servicesQuery = query(servicesQuery, orderBy('rating', 'desc'));
            else servicesQuery = query(servicesQuery, orderBy('createdAt', 'desc'));

            const querySnapshot = await getDocs(servicesQuery);
            const services = [];
            querySnapshot.forEach((doc) => services.push({ id: doc.id, ...doc.data() }));
            return services;
        } catch (error) {
            console.error('Error getting services:', error);
            throw error;
        }
    },

    getServiceById: async (serviceId) => {
        try {
            const serviceRef = doc(db, COLLECTIONS.SERVICES, serviceId);
            const serviceSnap = await getDoc(serviceRef);
            return serviceSnap.exists() ? { id: serviceSnap.id, ...serviceSnap.data() } : null;
        } catch (error) {
            console.error('Error getting service:', error);
            throw error;
        }
    },

    createService: async (serviceData) => {
        try {
            const serviceDoc = {
                name: serviceData.name || '',
                price: serviceData.price || 0,
                discount: serviceData.discount || '0%',
                rating: serviceData.rating || 0,
                distance: serviceData.distance || 0,
                category: serviceData.category || '',
                image: serviceData.image || '',
                description: serviceData.description || '',
                providerId: serviceData.providerId || '',
                providerName: serviceData.providerName || '',
                isAvailable: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const docRef = await addDoc(collection(db, COLLECTIONS.SERVICES), serviceDoc);
            return { id: docRef.id, ...serviceDoc };
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    },

    updateService: async (serviceId, serviceData) => {
        try {
            const serviceRef = doc(db, COLLECTIONS.SERVICES, serviceId);
            await updateDoc(serviceRef, { ...serviceData, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    },

    deleteService: async (serviceId) => {
        try {
            const serviceRef = doc(db, COLLECTIONS.SERVICES, serviceId);
            await deleteDoc(serviceRef);
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    },

    getServicesByProvider: async (providerId) => {
        try {
            const servicesQuery = query(
                collection(db, COLLECTIONS.SERVICES),
                where('providerId', '==', providerId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(servicesQuery);
            const services = [];
            querySnapshot.forEach((doc) => services.push({ id: doc.id, ...doc.data() }));
            return services;
        } catch (error) {
            console.error('Error getting provider services:', error);
            throw error;
        }
    }
};
