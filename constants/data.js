export const services = [
    { id: '001', name: 'First Cleaning Service', discount: '25%', price: 200, image: require('../assets/images/services/cleaning.png'), rating: 4.5, distance: 2.5, category: 'Cleaning' },
    { id: '002', name: 'Professional Cleaning', discount: '20%', price: 240, image: require('../assets/images/services/working.png'), rating: 4.8, distance: 1.5, category: 'Cleaning' },
    { id: '003', name: 'Vulputate Services', discount: '10%', price: 150, image: require('../assets/images/services/brochure.png'), rating: 4.2, distance: 3.0, category: 'Painting' },
    { id: '004', name: 'Electrician Services', discount: '15%', price: 180, image: require('../assets/images/services/electrician.jpg'), rating: 4.6, distance: 2.0, category: 'Electrician' }
];

export const categories = [
    { label: 'Plumber', icon: require('../assets/images/categories/plumbing_repair_services.jpg') },
    { label: 'Electrician', icon: require('../assets/images/categories/electrician_services.jpg') },
    { label: 'Painting', icon: require('../assets/images/categories/painting_services.jpg') },
    { label: 'Car Tow', icon: require('../assets/images/categories/car_tow_services.jpg') },
    { label: 'Cleaning', icon: require('../assets/images/categories/cleaning_services.png') },
];

export const addService = (newService) => {
    services.push(newService);
};


export const getServices = () => services;

export const BOOKINGS = [
    {
        id: '1',
        title: 'Cleaning Service',
        bookingId: '#10001',
        price: '$200/hr',
        date: '15 Oct 2025, 10:00 AM',
        provider: 'Alice Johnson',
        status: 'Completed',
        image: require('../assets/images/services/cleaning.png'),
    },
    {
        id: '2',
        title: 'Professional Cleaning',
        bookingId: '#10002',
        price: '$240/hr',
        date: '16 Oct 2025, 2:00 PM',
        provider: 'Bob Smith',
        status: 'Pending',
        image: require('../assets/images/services/working.png'),
    },
    {
        id: '3',
        title: 'Vulputate Services',
        bookingId: '#10003',
        price: '$150/hr',
        date: '17 Oct 2025, 11:30 AM',
        provider: 'Carol Davis',
        status: 'Cancelled',
        image: require('../assets/images/services/brochure.png'),
    },
    {
        id: '4',
        title: 'Electrician Services',
        bookingId: '#10004',
        price: '$180/hr',
        date: '18 Oct 2025, 1:00 PM',
        provider: 'David Lee',
        status: 'Completed',
        image: require('../assets/images/services/electrician.jpg'),
    },
];


export const mockMessages = [
    {
        id: '1',
        name: 'Jane Cooper',
        message: 'Hey! Are you available tomorrow?',
        time: '10:24 AM',
        avatar: require('../assets/images/users/jane_cooper.png'),
        unread: true,
    },
    {
        id: '2',
        name: 'Robert Fox',
        message: 'Thanks for the service!',
        time: 'Yesterday',
        avatar: require('../assets/images/users/robert_fox.png'),
        unread: false,
    },
    {
        id: '3',
        name: 'Esther Howard',
        message: 'Can we schedule for next week?',
        time: 'Mon',
        avatar: require('../assets/images/users/esther_howard.png'),
        unread: false,
    },
    {
        id: '4',
        name: 'Devon Lane',
        message: 'Great experience, thank you!',
        time: 'Sun',
        avatar: require('../assets/images/users/devon_lane.png'),
        unread: false,
    },
];