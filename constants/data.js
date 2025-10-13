export const services = [
    { id: '001', name: 'First Cleaning Service', discount: '25%', price: 200, image: 'https://blog.urbancare.co.nz/wp-content/uploads/Domestic-Cleaning-Services-1170x730.png', rating: 4.5, distance: 2.5, category: 'Cleaning' },
    { id: '002', name: 'Professional Cleaning', discount: '20%', price: 240, image: 'https://img.freepik.com/free-photo/cleaning-concept-young-man-doing-cleaning-home_1303-22911.jpg', rating: 4.8, distance: 1.5, category: 'Cleaning' },
    { id: '003', name: 'Vulputate Services', discount: '10%', price: 150, image: 'https://i0.wp.com/graphicsalon.com/wp-content/uploads/2018/09/Corporate-Company-Bifold-Brochure-Template-5.jpg?fit=600%2C450&ssl=1', rating: 4.2, distance: 3.0, category: 'Painting' },
    { id: '004', name: 'Electrician Services', discount: '15%', price: 180, image: 'https://images.stockcake.com/public/f/8/8/f88a99d2-13a4-4c4a-a179-14369ef361e8_large/electrician-at-work-stockcake.jpg', rating: 4.6, distance: 2.0, category: 'Electrician' }
];

export const categories = [
    { label: 'Plumber', icon: 'https://johnsservice.net/wp-content/uploads/2019/08/Emergency-Plumbing-Repair-Services-300x209.jpg' },
    { label: 'Electrician', icon: 'https://images.stockcake.com/public/f/8/8/f88a99d2-13a4-4c4a-a179-14369ef361e8_large/electrician-at-work-stockcake.jpg' },
    { label: 'Painting', icon: 'https://superpaintingco.com/wp-content/uploads/2025/02/Super-Painting.jpg' },
    { label: 'Car Tow', icon: 'https://d2hucwwplm5rxi.cloudfront.net/wp-content/uploads/2023/10/12112729/How-to-Tow-a-Car-with-a-Dolly-_-Cover-12-10-23.jpg' },
    { label: 'Cleaning', icon: 'https://blog.urbancare.co.nz/wp-content/uploads/Domestic-Cleaning-Services-1170x730.png' },
];

export const addService = (newService) => {
    services.push(newService);
};


export const getServices = () => services;

export const BOOKINGS = [
    {
        id: '1',
        title: 'Car Service',
        bookingId: '#65554',
        price: '$50/hr',
        date: '25 May 2025, 9:45 AM',
        provider: 'MD Ahsanulla Ashik',
        status: 'Completed',
        image: { uri: 'https://picsum.photos/seed/car/200/200' },
    },
    {
        id: '2',
        title: 'Home Cleaning',
        bookingId: '#45454',
        price: '$25/hr',
        date: '25 May 2025, 9:45 AM',
        provider: 'Irfan Khan',
        status: 'Pending',
        image: { uri: 'https://picsum.photos/seed/clean/200/200' },
    },
    {
        id: '3',
        title: 'Car Service',
        bookingId: '#65554',
        price: '$50/hr',
        date: '25 May 2025, 9:45 AM',
        provider: 'MD Ahsanulla Ashik',
        status: 'Cancelled',
        image: { uri: 'https://picsum.photos/seed/car/200/200' },
    }
];