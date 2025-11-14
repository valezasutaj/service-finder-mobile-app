// services/bookingsService.js
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "bookings";

export const bookingService = {

    createBooking: async (data) => {
        const payload = {
            job: data.job,
            provider: data.provider,
            customerId: data.customerId,

            date: data.date,
            time: data.time,
            price: data.price,
            notes: data.notes || "",

            status: "Pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const ref = await addDoc(collection(db, COLLECTION), payload);
        return { id: ref.id, ...payload };
    },

    getBookingsByUser: async (userId) => {
        const q = query(
            collection(db, COLLECTION),
            where("customerId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    updateBookingStatus: async (id, status) => {
        await updateDoc(doc(db, COLLECTION, id), {
            status,
            updatedAt: serverTimestamp()
        });
    }
};
