import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const categories = [
    { label: 'Plumber', icon: 'plumbing_repair_services.jpg' },
    { label: 'Electrician', icon: 'electrician_services.jpg' },
    { label: 'Painting', icon: 'painting_services.jpg' },
    { label: 'Car Tow', icon: 'car_tow_services.jpg' },
    { label: 'Cleaning', icon: 'cleaning_services.png' },
];

const services = [
    { name: 'First Cleaning Service', discount: '25%', price: 200, rating: 4.5, distance: 2.5, category: 'Cleaning', image: 'cleaning.png' },
    { name: 'Professional Cleaning', discount: '20%', price: 240, rating: 4.8, distance: 1.5, category: 'Cleaning', image: 'working.png' },
    { name: 'Vulputate Services', discount: '10%', price: 150, rating: 4.2, distance: 3.0, category: 'Painting', image: 'brochure.png' },
    { name: 'Electrician Services', discount: '15%', price: 180, rating: 4.6, distance: 2.0, category: 'Electrician', image: 'electrician.jpg' },
];

const bookings = [
    { title: 'Cleaning Service', price: 200, date: '2025-10-15 10:00', provider: 'Alice Johnson', status: 'Completed', serviceId: '001' },
    { title: 'Professional Cleaning', price: 240, date: '2025-10-16 14:00', provider: 'Bob Smith', status: 'Pending', serviceId: '002' },
    { title: 'Vulputate Services', price: 150, date: '2025-10-17 11:30', provider: 'Carol Davis', status: 'Cancelled', serviceId: '003' },
    { title: 'Electrician Services', price: 180, date: '2025-10-18 13:00', provider: 'David Lee', status: 'Completed', serviceId: '004' },
];

const messages = [
    { senderId: 'customer1', senderName: 'Demo Customer', receiverId: 'provider1', receiverName: 'Jane Cooper', message: 'Hey! Are you available tomorrow?', unread: true },
    { senderId: 'customer1', senderName: 'Demo Customer', receiverId: 'provider1', receiverName: 'Robert Fox', message: 'Thanks for the service!', unread: false },
    { senderId: 'customer1', senderName: 'Demo Customer', receiverId: 'provider1', receiverName: 'Esther Howard', message: 'Can we schedule for next week?', unread: false },
    { senderId: 'customer1', senderName: 'Demo Customer', receiverId: 'provider1', receiverName: 'Devon Lane', message: 'Great experience, thank you!', unread: false },
];

const reviews = [
    { serviceId: '001', bookingId: 'b001', customerId: 'customer1', customerName: 'Demo Customer', providerId: 'provider1', rating: 5, comment: 'Excellent service!' },
    { serviceId: '002', bookingId: 'b002', customerId: 'customer1', customerName: 'Demo Customer', providerId: 'provider2', rating: 4, comment: 'Very good.' },
];

const seedCategories = async () => {
    console.log('Seeding Categories...');
    for (const cat of categories) {
        await addDoc(collection(db, 'categories'), { ...cat, createdAt: serverTimestamp() });
    }
};

const seedServices = async () => {
    console.log('Seeding Services...');
    for (const s of services) {
        await addDoc(collection(db, 'services'), {
            ...s,
            providerId: 'provider1',
            providerName: 'Demo Provider',
            isAvailable: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
};

const seedBookings = async () => {
    console.log('Seeding Bookings...');
    for (const b of bookings) {
        await addDoc(collection(db, 'bookings'), {
            ...b,
            customerId: 'customer1',
            customerName: 'Demo Customer',
            providerId: 'provider1',
            providerName: b.provider,
            status: b.status,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
};

const seedMessages = async () => {
    console.log('Seeding Messages...');
    for (const m of messages) {
        await addDoc(collection(db, 'messages'), { ...m, createdAt: serverTimestamp() });
    }
};

const seedReviews = async () => {
    console.log('Seeding Reviews...');
    for (const r of reviews) {
        await addDoc(collection(db, 'reviews'), { ...r, createdAt: serverTimestamp() });
    }
};

export const seedAll = async () => {
    try {
        await seedCategories();
        await seedServices();
        await seedBookings();
        await seedMessages();
        await seedReviews();
        console.log('All data seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

if (require.main === module) {
    seedAll();
}
