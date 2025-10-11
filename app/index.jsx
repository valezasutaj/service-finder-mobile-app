import React, { useState } from 'react';
import { ScrollView, Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedServiceCard from '../components/ThemedServiceCard';
import Spacer from '../components/Spacer';
import ThemedButton from '../components/ThemedButton';
import Header from '../components/header';
import NavBar from '../components/NavBar';
import { useTheme } from '../context/ThemedModes';

const HomeScreen = () => {
    const { theme } = useTheme();
    const [filters] = useState({ rating: 0, proximity: 0, price: 0 });

    const services = [
        {
            id: '001',
            name: 'First Cleaning Service',
            discount: '25%',
            price: 200,
            image: 'https://blog.urbancare.co.nz/wp-content/uploads/Domestic-Cleaning-Services-1170x730.png',
            rating: 4.5,
            distance: 2.5,
        },
        {
            id: '002',
            name: 'Professional Cleaning',
            discount: '20%',
            price: 240,
            image: 'https://img.freepik.com/free-photo/cleaning-concept-young-man-doing-cleaning-home_1303-22911.jpg',
            rating: 4.8,
            distance: 1.5,
        },
        {
            id: '003',
            name: 'Vulputate Services',
            discount: '10%',
            price: 150,
            image: 'https://i0.wp.com/graphicsalon.com/wp-content/uploads/2018/09/Corporate-Company-Bifold-Brochure-Template-5.jpg?fit=600%2C450&ssl=1',
            rating: 4.2,
            distance: 3.0,
        },
        {
            id: '004',
            name: 'Electrician Services',
            discount: '15%',
            price: 180,
            image: 'https://images.stockcake.com/public/f/8/8/f88a99d2-13a4-4c4a-a179-14369ef361e8_large/electrician-at-work-stockcake.jpg',
            rating: 4.6,
            distance: 2.0,
        },
    ];

    const categories = [
        { label: 'Cleaning', icon: 'https://img.icons8.com/ios/452/clean.png' },
        { label: 'Plumber', icon: 'https://img.icons8.com/ios/452/plumber.png' },
        { label: 'Electrician', icon: 'https://img.icons8.com/ios/452/electricity.png' },
        { label: 'More', icon: 'https://img.icons8.com/ios/452/more.png' },
    ];

    const filteredServices = services.filter(service => {
        return (
            (filters.rating === 0 || service.rating >= filters.rating) &&
            (filters.proximity === 0 || service.distance <= filters.proximity) &&
            (filters.price === 0 || service.price <= filters.price)
        );
    });

    const themeStyles = styles(theme);

    return (
        <ThemedView safe style={themeStyles.container}>
            <Header />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollContent}>
                <View style={themeStyles.bannerContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                        {services.slice(0, 2).map(item => (
                            <View key={item.id} style={themeStyles.bannerCard}>
                                <Image source={{ uri: item.image }} style={themeStyles.bannerImage} />
                                <View style={themeStyles.bannerOverlay}>
                                    <ThemedText style={themeStyles.bannerText}>
                                        {item.name} with {item.discount} Discount
                                    </ThemedText>

                                    <ThemedButton
                                        style={themeStyles.bannerButton}>
                                        <ThemedText style={themeStyles.bannerButtonText}>Book Now</ThemedText>
                                    </ThemedButton>

                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={themeStyles.sectionHeader}>
                    <ThemedText title style={themeStyles.sectionTitle}>Categories</ThemedText>
                    <TouchableOpacity>
                        <ThemedText style={themeStyles.viewMore}>View More</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={themeStyles.categoriesGrid}>
                    {categories.map((cat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[themeStyles.categoryCard, { backgroundColor: theme.primary + '10' }]}
                        >
                            <Image source={{ uri: cat.icon }} style={themeStyles.categoryIcon} />
                            <ThemedText style={themeStyles.categoryLabel}>{cat.label}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>


                <ThemedText title style={[themeStyles.sectionTitle, themeStyles.topSectionTitle]}>
                    Top Services
                </ThemedText>

                {filteredServices.slice(1).map(service => (
                    <ThemedServiceCard
                        key={service.id}
                        id={service.id}
                        name={service.name}
                        discount={service.discount}
                        price={service.price}
                        image={service.image}
                    />
                ))}

                <Spacer height={40} />
            </ScrollView>
            <NavBar />
        </ThemedView>
    );
};

export default HomeScreen;

const styles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            paddingHorizontal: 16,
            paddingTop: 10,
        },
        scrollContent: { paddingBottom: 20 },
        bannerContainer: { marginTop: 10 },
        bannerCard: {
            width: 280,
            height: 140,
            borderRadius: 15,
            marginRight: 15,
            overflow: 'hidden',
        },
        bannerImage: { width: '100%', height: '100%' },
        bannerOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 10,
        },
        bannerText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 8,
        },
        bannerButton: {
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 20,
        },
        bannerButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
            paddingHorizontal: 10,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.text,
            paddingHorizontal: 5,
        },
        viewMore: { color: theme.link, fontSize: 13, paddingHorizontal: 5 },
        categoriesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            marginTop: 10,
        },

        categoryCard: {
            width: '22%',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            paddingVertical: 14,
            marginBottom: 15,
            backgroundColor: theme.cardBackground,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 3,
            borderWidth: 1,
            borderColor: theme.border,
        },

        categoryIcon: {
            width: 32,
            height: 32,
            tintColor: theme.iconColor,
            marginBottom: 6,
        },

        categoryLabel: {
            fontSize: 13,
            fontWeight: '500',
            color: theme.text,
            textAlign: 'center',
        },

        topSectionTitle: {
            marginTop: 10,
            marginBottom: 10,
            paddingHorizontal: 15,
        },
    });
