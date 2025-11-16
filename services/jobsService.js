import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    query,
    where
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "jobs";

export const jobService = {

    getJobs: async () => {
        const snap = await getDocs(collection(db, COLLECTION));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    getJobById: async (id) => {
        const ref = doc(db, COLLECTION, id);
        const snap = await getDoc(ref);

        if (!snap.exists()) return null;

        return { id: snap.id, ...snap.data() };
    },

    createJob: async (job) => {
        const payload = {
            name: job.name,
            price: job.price,
            discount: job.discount,
            description: job.description,

            category: job.category,
            image: job.image,

            provider: job.provider,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const ref = await addDoc(collection(db, COLLECTION), payload);
        return { id: ref.id, ...payload };
    },

    updateJob: async (id, data) => {
        await updateDoc(doc(db, COLLECTION, id), {
            ...data,
            updatedAt: serverTimestamp()
        });
    },

    deleteJob: async (id) => {
        await deleteDoc(doc(db, COLLECTION, id));
    },

    getJobsByUser: async (uid) => {
        const q = query(collection(db, "jobs"), where("provider.uid", "==", uid));
        const snap = await getDocs(q);

        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
};