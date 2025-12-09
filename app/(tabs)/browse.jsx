import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Animated
} from 'react-native';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedServiceCard from '../../components/ThemedServiceCard';
import NavBar from '../../components/NavBar';
import Spacer from '../../components/Spacer';
import { useTheme } from '../../context/ThemedModes';
import { Search } from 'lucide-react-native';
import { useRouter } from "expo-router";
import { categoryService } from '../../services/categoriesService';
import { jobService } from '../../services/jobsService';
import { getCategoryIcon } from '../../services/imagesMap';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import "../../assets/images/categories/default.png";

const FadePress = ({ onPress, children, style }) => {
    const opacity = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.timing(opacity, {
            toValue: 0.5,
            duration: 120,
            useNativeDriver: true
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true
        }).start();
    };

    return (
        <Animated.View style={{ opacity }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={style}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};



const Browse = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const themeStyles = styles(theme);
    const [searchText, setSearchText] = useState('');
    const [selectedSort, setSelectedSort] = useState('None');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [categories, setCategories] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);


    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                setLoading(true);
                const c = await categoryService.getCategories();
                const j = await jobService.getJobs();
                setCategories([{ id: 'All', label: 'All' }, ...c]);
                setJobs(j);
                setLoading(false);
            };
            load();
        }, [])
    );


    let filteredJobs = jobs.filter(job =>
        job.name.toLowerCase().includes(searchText.toLowerCase()) &&
        (
            selectedCategoryId === "All" ||
            (job.category && job.category.id === selectedCategoryId)
        )
    );

    if (selectedSort === 'Price Low → High') {
        filteredJobs.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'Price High → Low') {
        filteredJobs.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'Rating High → Low') {
        filteredJobs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }


    if (loading) {
        return (
            <ThemedView safe style={[themeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }


    return (
        <ThemedView safe style={themeStyles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                <View style={themeStyles.searchContainer}>
                    <Search size={20} color={theme.mutedText} style={themeStyles.searchIcon} />
                    <TextInput
                        style={themeStyles.searchInput}
                        placeholder="Search jobs..."
                        placeholderTextColor={theme.mutedText}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>


                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={themeStyles.filterScroll}>
                    {categories.map(cat => (
                        <FadePress
                            key={cat.id}
                            style={[
                                themeStyles.categoryChip,
                                selectedCategoryId === cat.id && { borderColor: theme.primary }
                            ]}
                            onPress={() => setSelectedCategoryId(cat.id)}
                        >
                            {cat.id !== 'All' && (
                                <Image source={getCategoryIcon(cat.icon)} style={themeStyles.categoryIcon} />
                            )}

                            <ThemedText
                                style={[
                                    themeStyles.filterText,
                                    selectedCategoryId === cat.id && { color: theme.primary }
                                ]}
                            >
                                {cat.label}
                            </ThemedText>
                        </FadePress>
                    ))}
                </ScrollView>


                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={themeStyles.filterScroll}>
                    {["None", "Price Low → High", "Price High → Low", "Rating High → Low"].map(option => (
                        <FadePress
                            key={option}
                            style={[
                                themeStyles.filterChip,
                                selectedSort === option && themeStyles.filterChipActive
                            ]}
                            onPress={() => setSelectedSort(option)}
                        >
                            <ThemedText
                                style={[
                                    themeStyles.filterText,
                                    selectedSort === option && { color: '#fff' }
                                ]}
                            >
                                {option}
                            </ThemedText>
                        </FadePress>
                    ))}
                </ScrollView>


                <ThemedText title style={themeStyles.sectionTitle}>Services</ThemedText>

                <FlatList
                    data={filteredJobs}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <ThemedServiceCard
                            id={item.id}
                            name={item.name}
                            price={item.price}
                            discount={item.discount}
                            rating={item.rating}
                            image={item.image ? { uri: item.image } : require('../../assets/images/categories/default.png')}
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

export default Browse;


const styles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 16,
        paddingTop: 10
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.cardBackground,
        borderRadius: 10,
        paddingHorizontal: 10,
        margin: 10
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 8
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: theme.text
    },
    filterScroll: {
        marginVertical: 10,
        marginHorizontal: 10
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        marginRight: 10
    },
    filterChipActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        marginRight: 10
    },
    categoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6
    },
    filterText: {
        fontWeight: '600',
        color: theme.text
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        margin: 10
    }
});
