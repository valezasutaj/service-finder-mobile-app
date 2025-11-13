// screens/home/HomeScreen.jsx
import { ScrollView, Image, StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedServiceCard from '../../components/ThemedServiceCard';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import Header from '../../components/header';
import NavBar from '../../components/NavBar';
import { useTheme } from '../../context/ThemedModes';
import { serviceService } from '../../services/servicesService';
import { categoryService } from '../../services/categoriesService';
import { serviceImages, categoryIcons } from '../../services/imagesMap';

const HomeScreen = () => {
    const { theme } = useTheme();
    const themeStyles = styles(theme);

    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedServices = await serviceService.getServices();
                const fetchedCategories = await categoryService.getCategories();

                const mappedServices = fetchedServices.map(s => ({
                    ...s,
                    image: s.image ? serviceImages[s.image] : null
                }));

                const mappedCategories = fetchedCategories.map(c => ({
                    ...c,
                    icon: c.icon ? categoryIcons[c.icon] : null
                }));

                setServices(mappedServices);
                setCategories(mappedCategories);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <ThemedView safe style={[themeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    return (
        <ThemedView safe style={[themeStyles.container, { paddingBottom: 40 }]}>
            <Header />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollContent}>
                <View style={themeStyles.bannerContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                        {services.slice(0, 3).map(item => (
                            <View key={item.id} style={themeStyles.bannerCard}>
                                {item.image && <Image source={item.image} style={themeStyles.bannerImage} />}
                                <View style={themeStyles.bannerOverlay}>
                                    <ThemedText style={themeStyles.bannerText}>
                                        {item.name} {item.discount && `with ${item.discount} Discount`}
                                    </ThemedText>

                                    <ThemedButton style={themeStyles.bannerButton}>
                                        <ThemedText style={themeStyles.bannerButtonText}>Book Now</ThemedText>
                                    </ThemedButton>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={themeStyles.sectionHeader}>
                    <ThemedText title style={themeStyles.sectionTitle}>Categories</ThemedText>
                    <ThemedText title style={themeStyles.link}>View More</ThemedText>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={themeStyles.categoriesRow}>
                    {categories.slice(0, 5).map(cat => (
                        <View key={cat.label} style={themeStyles.categoryCard}>
                            {cat.icon && <Image source={cat.icon} style={themeStyles.categoryImg} />}
                            <ThemedText style={themeStyles.categoryLabel}>{cat.label}</ThemedText>
                        </View>
                    ))}
                </ScrollView>

                <ThemedText title style={[themeStyles.sectionTitle, { paddingHorizontal: 15 }]}>Top Services</ThemedText>

                <FlatList
                    data={services.slice(0, 3)}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <ThemedServiceCard
                            id={item.id}
                            name={item.name}
                            discount={item.discount}
                            rating={item.rating}
                            price={item.price}
                            image={item.image}
                        />
                    )}
                    scrollEnabled={false}
                />

                <Spacer height={40} />
            </ScrollView>
            <NavBar />
        </ThemedView>
    );
};

export default HomeScreen;

const styles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    bannerContainer: {
        marginTop: 10,
    },
    bannerCard: {
        width: 280,
        height: 140,
        borderRadius: 15,
        marginRight: 15,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
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
    bannerButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
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
    link: {
        fontSize: 14,
        color: theme.mutedText,
        marginVertical: 18,
    },
    categoriesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 15
    },
    categoryCard: {
        width: 80,
        alignItems: 'center',
        marginRight: 10,
    },
    categoryImg: {
        width: 75,
        height: 75,
        borderRadius: 18,
        marginBottom: 6,
        backgroundColor: theme.cardBackground || '#f8f8f8',
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.mutedText,
        textAlign: 'center',
    },
});
