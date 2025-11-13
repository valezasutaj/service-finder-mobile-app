import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedServiceCard from '../../components/ThemedServiceCard';
import NavBar from '../../components/NavBar';
import { useTheme } from '../../context/ThemedModes';
import Spacer from '../../components/Spacer';
import { categoryService } from '../../services/categoriesService';
import { serviceService } from '../../services/servicesService';
import { Search } from 'lucide-react-native';
import { serviceImages, categoryIcons } from '../../services/imagesMap';

const Browse = () => {
    const { theme } = useTheme();
    const themeStyles = styles(theme);

    const [searchText, setSearchText] = useState('');
    const [selectedSort, setSelectedSort] = useState('None');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchedCategories = await categoryService.getCategories();
                const fetchedServices = await serviceService.getServices();

                // Map images/icons dynamically
                const mappedCategories = fetchedCategories.map(c => ({
                    ...c,
                    icon: c.icon && categoryIcons[c.icon] ? categoryIcons[c.icon] : null
                }));
                const mappedServices = fetchedServices.map(s => ({
                    ...s,
                    image: s.image && serviceImages[s.image] ? serviceImages[s.image] : null
                }));

                setCategories([{ label: 'All', icon: null }, ...mappedCategories]);
                setServices(mappedServices);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    let filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchText.toLowerCase()) &&
        (selectedCategory === 'All' || service.category === selectedCategory)
    );

    if (selectedSort === 'Price Low → High') filteredServices.sort((a, b) => a.price - b.price);
    else if (selectedSort === 'Price High → Low') filteredServices.sort((a, b) => b.price - a.price);
    else if (selectedSort === 'Rating High → Low') filteredServices.sort((a, b) => b.rating - a.rating);
    else if (selectedSort === 'Distance Near → Far') filteredServices.sort((a, b) => a.distance - b.distance);

    const sortOptions = ['None', 'Price Low → High', 'Price High → Low', 'Rating High → Low', 'Distance Near → Far'];

    if (loading) {
        return (
            <ThemedView safe style={[themeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    return (
        <ThemedView safe style={themeStyles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardDismissMode='on-drag' showsVerticalScrollIndicator={false}>
                <View style={themeStyles.searchContainer}>
                    <Search size={20} color={theme.mutedText} style={themeStyles.searchIcon} />
                    <TextInput
                        style={themeStyles.searchInput}
                        placeholder="Search services..."
                        placeholderTextColor={theme.mutedText}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={themeStyles.filterScroll}>
                    {categories.map(item => (
                        <TouchableOpacity
                            key={item.label}
                            style={themeStyles.categoryChip}
                            onPress={() => setSelectedCategory(item.label)}
                        >
                            {item.icon && <Image source={item.icon} style={themeStyles.categoryIcon} />}
                            <ThemedText style={[themeStyles.filterText, selectedCategory === item.label && { color: theme.primary }]}>
                                {item.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={themeStyles.filterScroll}>
                    {sortOptions.map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[themeStyles.filterChip, selectedSort === option && themeStyles.filterChipActive]}
                            onPress={() => setSelectedSort(option)}
                        >
                            <ThemedText style={[themeStyles.filterText, selectedSort === option && { color: '#fff' }]}>
                                {option}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ThemedText title style={themeStyles.sectionTitle}>Services</ThemedText>

                <FlatList
                    data={filteredServices}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <ThemedServiceCard
                            id={item.id}
                            name={item.name}
                            rating={item.rating}
                            discount={item.discount}
                            price={item.price}
                            image={item.image}
                        />
                    )}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <ThemedText style={{ textAlign: 'center', marginVertical: 20, color: theme.mutedText }}>
                            {loading ? 'Loading services...' : 'No services found.'}
                        </ThemedText>
                    }
                />

                <Spacer height={40} />
            </ScrollView>
            <NavBar />
        </ThemedView>
    );
};

export default Browse;

const styles = (theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, paddingHorizontal: 16, paddingTop: 10 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.cardBackground, borderRadius: 10, paddingHorizontal: 10, margin: 10 },
    searchIcon: { width: 20, height: 20, marginRight: 8, tintColor: theme.mutedText },
    searchInput: { borderWidth: 0, flex: 1, height: 40, color: theme.text },
    filterScroll: { marginVertical: 10, marginHorizontal: 10 },
    filterChip: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: theme.border, marginRight: 10 },
    filterChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    categoryChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: theme.border, marginRight: 10 },
    categoryIcon: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
    filterText: { fontWeight: '600', color: theme.text },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text, margin: 10 },
});
