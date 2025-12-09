import { ScrollView, Image, StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedServiceCard from '../../components/ThemedServiceCard';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import Header from '../../components/header';
import NavBar from '../../components/NavBar';
import { useTheme } from '../../context/ThemedModes';
import { useRouter } from "expo-router";

import { jobService } from '../../services/jobsService';
import { categoryService } from '../../services/categoriesService';
import { getCategoryIcon } from '../../services/imagesMap';
import { safeRouter } from '../../utils/SafeRouter';


const HomeScreen = () => {
    const { theme } = useTheme();
    const themeStyles = styles(theme);
    const router = useRouter();

    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const shuffle = (array) => {
        return [...array].sort(() => Math.random() - 0.5);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const j = await jobService.getJobs();
                const c = await categoryService.getCategories();
                const randomJobs = shuffle(j);
                setJobs(randomJobs);
                setCategories(c);
            } finally {
                setLoading(false);
            }
        };
        load();
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

                        {jobs.slice(0, 3).map(item => (
                            <View key={item.id} style={themeStyles.bannerCard}>

                                <Image
                                    source={
                                            item.image
                                                ? { uri: item.image }
                                                : require('../../assets/images/categories/default.png')
                                    }
                                    style={themeStyles.bannerImage}
                                />

                                <View style={themeStyles.bannerOverlay}>
                                    <ThemedText style={themeStyles.bannerText}>
                                        {item.name} {item.discount && `• ${item.discount}`}
                                    </ThemedText>

                                    <ThemedButton
                                        style={themeStyles.bannerButton}
                                        onPress={() =>
                                            router.push({
                                                pathname: `/jobdetails/${item.id}`,
                                                params: { image: item.image }
                                            })
                                        }
                                    >
                                        <ThemedText style={themeStyles.bannerButtonText}>Book Now</ThemedText>
                                    </ThemedButton>
                                </View>
                            </View>
                        ))}

                    </ScrollView>
                </View>

                <View style={themeStyles.sectionHeader}>
                    <ThemedText title style={themeStyles.sectionTitle}>Categories</ThemedText>
                    <TouchableOpacity onPress={() => safeRouter.push('/browse')}>
                        <ThemedText title style={themeStyles.link}>View More</ThemedText>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={themeStyles.categoriesRow}>
                    {categories.slice(0, 5).map(cat => (
                        <View key={cat.id} style={themeStyles.categoryCard}>
                            <Image
                                source={getCategoryIcon(cat.icon)}
                                style={themeStyles.categoryImg}
                            />
                            <ThemedText style={themeStyles.categoryLabel}>{cat.label}</ThemedText>
                        </View>
                    ))}
                </ScrollView>

                <ThemedText title style={[themeStyles.sectionTitle, { paddingHorizontal: 15 }]}>
                    Top Jobs
                </ThemedText>

                <FlatList
                    data={jobs.slice(0, 4)}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <ThemedServiceCard
                            id={item.id}
                            name={item.name}
                            discount={item.discount}
                            price={item.price}
                            image={ item.image ? { uri: item.image } : require('../../assets/images/categories/default.png')}
                            providerName={item.provider?.fullName}
                            onPress={() =>
                                router.push({
                                    pathname: `/jobdetails/${item.id}`,
                                    params: { image: item.image }
                                })
                            }
                        />
                    )}
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
        marginTop: 15,
        paddingBottom: 20,
    },
    bannerCard: {
        width: 280,
        height: 140,
        borderRadius: 15,
        overflow: 'hidden',
        marginRight: 15,
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
    },
    bannerText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    bannerButton: {
        backgroundColor: theme.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    bannerButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
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
        paddingHorizontal: 15,
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
        backgroundColor: theme.cardBackground,
        marginBottom: 6,
    },
    categoryLabel: {
        fontSize: 13,
        color: theme.mutedText,
        textAlign: 'center',
    },
});
