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
import { FlatList } from 'react-native';


const HomeScreen = () => {
    const { theme } = useTheme();

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
        {
            label: 'Plumber',
            icon: 'https://johnsservice.net/wp-content/uploads/2019/08/Emergency-Plumbing-Repair-Services-300x209.jpg',
        },
        {
            label: 'Electrician',
            icon: 'https://images.stockcake.com/public/f/8/8/f88a99d2-13a4-4c4a-a179-14369ef361e8_large/electrician-at-work-stockcake.jpg',
        },
        {
            label: 'Painting',
            icon: 'https://superpaintingco.com/wp-content/uploads/2025/02/Super-Painting.jpg',
        },
        {
            label: 'Car Tow',
            icon: 'https://d2hucwwplm5rxi.cloudfront.net/wp-content/uploads/2023/10/12112729/How-to-Tow-a-Car-with-a-Dolly-_-Cover-12-10-23.jpg',
        },
        {
            label: 'Cleaning',
            icon: 'https://blog.urbancare.co.nz/wp-content/uploads/Domestic-Cleaning-Services-1170x730.png',
        }
    ];


    const themeStyles = styles(theme);

    return (
        <ThemedView safe style={themeStyles.container}>
            <Header />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollContent}>
                <View style={themeStyles.bannerContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                        {services.slice(0, 3).map(item => (
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

                <View style={themeStyles.categorySection}>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={themeStyles.categoriesRow}
                    >
                        {categories.map((item) => (
                            <View
                                key={item.label}
                                style={themeStyles.categoryCard}
                            >
                                <Image
                                    source={{ uri: item.icon }}
                                    style={themeStyles.categoryImg}
                                    resizeMode="cover"
                                />
                                <ThemedText style={themeStyles.categoryLabel}>{item.label}</ThemedText>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <ThemedText title style={[themeStyles.sectionTitle, { paddingHorizontal: 15 }]}>
                    Top Services
                </ThemedText>

                <FlatList
                    data={services.slice(0, 3)}
                    renderItem={({ item }) => (
                        <ThemedServiceCard
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            discount={item.discount}
                            price={item.price}
                            image={item.image}
                        />
                    )}
                    scrollEnabled={false}
                />

                <Spacer height={40} />
            </ScrollView>
            <NavBar />
        </ThemedView >
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
            paddingHorizontal: 15,

        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.text,
            marginVertical: 18,
        },
        viewMore: {
            color: theme.link,
            fontSize: 13,
            margin: 5
        },
        categorySection: {
            paddingHorizontal: 15
        },
        categoriesRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingRight: 10,
        },

        categoryCard: {
            width: 80,
            alignItems: 'center',
        },

        categoryImg: {
            width: 75,
            height: 75,
            borderRadius: 18,
            marginBottom: 6,
            backgroundColor: theme.cardBackground || '#f8f8f8',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
        },

        categoryLabel: {
            fontSize: 13,
            fontWeight: '500',
            color: theme.mutedText,
            textAlign: 'center',
        }
    });
