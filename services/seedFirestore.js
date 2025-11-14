import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
} from 'firebase/firestore';

// ================================
// CATEGORY DATA
// ================================
const categories = [
    { label: 'Plumber', icon: 'plumbing_repair_services.jpg' },
    { label: 'Electrician', icon: 'electrician_services.jpg' },
    { label: 'Painting', icon: 'painting_services.jpg' },
    { label: 'Car Tow', icon: 'car_tow_services.jpg' },
    { label: 'Cleaning', icon: 'cleaning_services.png' },
];

// ================================
// JOB DATA (NEW STRUCTURE)
// ================================
const jobs = [
    {
        name: 'First Cleaning Service',
        discount: '25%',
        price: 200,
        rating: 4.5,
        distance: 2.5,
        categories: ['Cleaning'],
        provider: {
            id: 'provider1',
            fullName: 'John Cleaner'
        }
    },
    {
        name: 'Professional Cleaning',
        discount: '20%',
        price: 240,
        rating: 4.8,
        distance: 1.5,
        categories: ['Cleaning'],
        provider: {
            id: 'provider1',
            fullName: 'John Cleaner'
        }
    },
    {
        name: 'Vulputate Services',
        discount: '10%',
        price: 150,
        rating: 4.2,
        distance: 3.0,
        categories: ['Painting'],
        provider: {
            id: 'provider2',
            fullName: 'Adam Painter'
        }
    },
    {
        name: 'Electrician Services',
        discount: '15%',
        price: 180,
        rating: 4.6,
        distance: 2.0,
        categories: ['Electrician'],
        provider: {
            id: 'provider3',
            fullName: 'Mike Electric'
        }
    }
];

// ================================
// MESSAGES
// ================================
const messages = [
    { senderId: 'customer1', receiverId: 'provider1', message: 'Hey! Are you available tomorrow?' },
    { senderId: 'customer1', receiverId: 'provider1', message: 'Thanks for the service!' },
    { senderId: 'customer1', receiverId: 'provider1', message: 'Can we schedule for next week?' },
];

// ================================
// REVIEWS
// ================================
const reviews = [
    { jobId: '001', bookingId: 'b001', customerId: 'customer1', providerId: 'provider1', rating: 5, comment: 'Excellent service!' },
    { jobId: '002', bookingId: 'b002', customerId: 'customer1', providerId: 'provider2', rating: 4, comment: 'Very good.' },
];

// ================================
// HELPER – CHECK IF EXISTS
// ================================
const checkAndAdd = async (col, field, value, data) => {
    const q = query(collection(db, col), where(field, '==', value));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        await addDoc(collection(db, col), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log(`✓ Added to ${col}: ${value}`);
    } else {
        console.log(`• Skipped (already exists): ${value}`);
    }
};

// ================================
// SEED CATEGORIES
// ================================
const seedCategories = async () => {
    console.log('Seeding Categories...');
    for (const cat of categories) {
        await checkAndAdd('categories', 'label', cat.label, cat);
    }
};

// ================================
// SEED JOBS (NEW STRUCTURE)
// ================================
const seedJobs = async () => {
    console.log('Seeding Jobs...');

    // 1. get all categories with their Firestore IDs
    const snap = await getDocs(collection(db, 'categories'));
    const categoryMap = {};

    snap.forEach(doc => {
        const data = doc.data();
        categoryMap[data.label] = { id: doc.id, ...data };
    });

    // 2. create jobs with embedded categories[]
    for (const job of jobs) {
        const embeddedCats = job.categories.map(label => categoryMap[label]).filter(Boolean);

        await checkAndAdd('jobs', 'name', job.name, {
            name: job.name,
            discount: job.discount,
            price: job.price,
            rating: job.rating,
            distance: job.distance,
            categories: embeddedCats,       // ARRAY OF OBJECTS
            provider: job.provider,         // embedded provider
            isAvailable: true
        });
    }
};

// ================================
// SEED MESSAGES
// ================================
const seedMessages = async () => {
    console.log('Seeding Messages...');
    for (const m of messages) {
        await checkAndAdd('messages', 'message', m.message, {
            ...m,
            isRead: false
        });
    }
};

// ================================
// SEED REVIEWS
// ================================
const seedReviews = async () => {
    console.log('Seeding Reviews...');
    for (const r of reviews) {
        await checkAndAdd('reviews', 'comment', r.comment, r);
    }
};

// ================================
// MAIN SEED FUNCTION
// ================================
export const seedAll = async () => {
    try {
        await seedCategories();
        await seedJobs();
        await seedMessages();
        await seedReviews();

        console.log('All data seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};
