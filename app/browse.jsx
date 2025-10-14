import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedServiceCard from '../components/ThemedServiceCard';
import NavBar from '../components/NavBar';
import { useTheme } from '../context/ThemedModes';
import Spacer from '../components/Spacer';
import { services, categories } from '../constants/data';
import { Ionicons } from '@expo/vector-icons';

const Browse = () => {
    const { theme } = useTheme();
    const [searchText, setSearchText] = useState('');
    const [selectedSort, setSelectedSort] = useState('None');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const allCategories = [{ label: 'All', icon: null }, ...categories];

    let filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchText.toLowerCase()) &&
        (selectedCategory === 'All' || service.category === selectedCategory)
    );

    if (selectedSort === 'Price Low → High') filteredServices.sort((a, b) => a.price - b.price);
    else if (selectedSort === 'Price High → Low') filteredServices.sort((a, b) => b.price - a.price);
    else if (selectedSort === 'Rating High → Low') filteredServices.sort((a, b) => b.rating - a.rating);
    else if (selectedSort === 'Distance Near → Far') filteredServices.sort((a, b) => a.distance - b.distance);

    const sortOptions = ['None', 'Price Low → High', 'Price High → Low', 'Rating High → Low', 'Distance Near → Far'];
    const themeStyles = styles(theme);

    return (
        <ThemedView safe style={themeStyles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                <View style={themeStyles.searchContainer}>

                    <Ionicons name="search" size={24} color="#000" style={themeStyles.searchIcon} />

                    <TextInput
                        style={themeStyles.searchInput}
                        placeholder="Search services..."
                        placeholderTextColor={theme.mutedText}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={themeStyles.filterScroll}>
                    {allCategories.map(item => (
                        <TouchableOpacity
                            key={item.label}
                            style={[themeStyles.categoryChip]}
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
        paddingTop: 10,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.cardBackground,
        borderRadius: 10,
        paddingHorizontal: 10,
        margin: 10,
    },

    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        tintColor: theme.mutedText,
    },

    searchInput: {
        borderWidth: 0,
        flex: 1,
        height: 40,
        color: theme.text,
    },

    filterScroll: {
        marginVertical: 10,
        marginHorizontal: 10,
    },

    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        marginRight: 10,
    },

    filterChipActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },

    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        marginRight: 10,
    },

    categoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6,
    },

    filterText: {
        fontWeight: '600',
        color: theme.text,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        margin: 10,
    },
});
