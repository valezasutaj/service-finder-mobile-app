import React, { useState } from 'react';
import { View, TextInput, Image, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { safeRouter } from "../../utils/SafeRouter";
import { useTheme } from '../../context/ThemedModes';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import Spacer from '../../components/Spacer';
import { categories, addService } from '../../constants/data';
import Slider from '@react-native-community/slider';
import { Check } from "lucide-react-native";

export default function Post() {
    const { theme } = useTheme();
    const styles = s(theme);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState('');
    const [rating, setRating] = useState('');
    const [distance, setDistance] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setisSubmitted] = useState(false);

    const handlePost = () => {
        setError('');
        if (!name.trim() || !price.trim() || !category.trim()) {
            setError('Please fill in all required fields!');
            return;
        }

        try {
            addService({
                id: Date.now().toString(),
                name,
                price: parseFloat(price),
                discount: discount ? `${discount}%` : '0%',
                rating: parseFloat(rating) || 0,
                distance: parseFloat(distance) || 0,
                category,
                image: image || 'https://placehold.co/600x400/4A90E2/FFFFFF?text=New+Service',
            });
            setisSubmitted(true);
        } catch (err) {
            console.error('Error posting job:', err);
            setError('Something went wrong while posting.');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 5}>
                <View style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardDismissMode='on-drag' contentContainerStyle={{ paddingBottom: 10 }}>
                        <View style={styles.header}>
                            <ThemedText title style={styles.headerText}>Post job</ThemedText>
                        </View>
                        <View style={styles.content}>
                            <ThemedText type="subtitle" style={styles.label}>Name</ThemedText>
                            <TextInput
                                placeholder="Enter Service Name"
                                placeholderTextColor={theme.mutedText}
                                value={name}
                                onChangeText={setName}
                                style={[styles.input, { backgroundColor: theme.uiBackground, color: theme.text, borderColor: theme.border }]}
                            />

                            <Spacer height={15} />

                            <ThemedText type="subtitle" style={styles.label}>Price</ThemedText>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Enter Price"
                                placeholderTextColor={theme.mutedText}
                                value={price}
                                onChangeText={setPrice}
                                style={[styles.input, { backgroundColor: theme.uiBackground, color: theme.text, borderColor: theme.border }]}
                            />

                            <Spacer height={15} />

                            <ThemedText type="subtitle" style={styles.label}>
                                Discount
                            </ThemedText>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Enter Discount"
                                placeholderTextColor={theme.mutedText}
                                value={discount}
                                onChangeText={setDiscount}
                                style={[styles.input, { backgroundColor: theme.uiBackground, color: theme.text, borderColor: theme.border }]}
                            />

                            <Spacer height={15} />

                            <ThemedText type="subtitle" style={styles.label}>Rating: {rating || 3}</ThemedText>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={1}
                                maximumValue={5}
                                step={1}
                                value={rating ? parseFloat(rating) : 3}
                                onValueChange={(value) => setRating(value.toString())}
                                minimumTrackTintColor={theme.primary}
                                maximumTrackTintColor={theme.border}
                                thumbTintColor={theme.primary}
                            />

                            <Spacer height={15} />

                            <ThemedText type="subtitle" style={styles.label}>Distance</ThemedText>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Enter Distance"
                                placeholderTextColor={theme.mutedText}
                                value={distance}
                                onChangeText={setDistance}
                                style={[styles.input, { backgroundColor: theme.uiBackground, color: theme.text, borderColor: theme.border }]}
                            />

                            <Spacer height={15} />

                            <ThemedText type="subtitle" style={styles.label}>
                                Select Category
                            </ThemedText>
                            <FlatList
                                data={categories}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.label}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => setCategory(item.label)} style={styles.categoryItem}>
                                        <View style={[styles.categoryBox, { borderColor: category === item.label ? theme.primary : theme.border, backgroundColor: category === item.label ? theme.primary + '15' : theme.uiBackground }]}>
                                            <Image source={item.icon} style={styles.categoryImage} resizeMode="cover" />
                                        </View>
                                        <ThemedText style={{ fontSize: 12, marginTop: 6, color: category === item.label ? theme.primary : theme.text }}>{item.label}</ThemedText>
                                    </TouchableOpacity>
                                )}
                            />

                            <Spacer height={15} />

                            <ThemedText type="subtitle" style={styles.label}>Add Image</ThemedText>
                            <ThemedButton onPress={pickImage}>
                                <ThemedText type="button" style={{ color: theme.postText, fontWeight: '600' }}>Pick an Image</ThemedText>
                            </ThemedButton>

                            {image ? (
                                <>
                                    <Spacer height={15} />
                                    <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
                                </>
                            ) : null}

                            {error ? (
                                <>
                                    <Spacer height={15} />
                                    <ThemedText style={{ color: 'red', textAlign: 'center' }}>{error}</ThemedText>
                                </>
                            ) : null}
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity onPress={() => safeRouter.back()} style={[styles.cancelButton, { borderColor: theme.primary }]}>
                                <ThemedText style={{ textAlign: 'center', color: theme.primary, fontWeight: '600' }}>Cancel</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, backgroundColor: theme.primary, borderWidth: 3, borderColor: theme.primary, borderRadius: 10, }}>
                            <ThemedButton onPress={handlePost}>
                                <ThemedText type="button" style={{ color: theme.postText, fontWeight: '600' }}>Post Job</ThemedText>
                            </ThemedButton>
                        </View>
                    </View>
                </View>
                <Modal visible={isSubmitted} transparent animationType="fade">
                    <View style={styles.overlay}>
                        <View style={styles.popup}>
                            <View style={styles.checkmark}><Check color={theme.postText} size={36} strokeWidth={3} /></View>
                            <ThemedText style={{ color: theme.backHome, fontSize: 18 }}>Posted Successfully</ThemedText>
                            <ThemedText style={{ color: theme.backHome }}>You have successfully posted your service</ThemedText>
                            <TouchableOpacity onPress={() => safeRouter.back()} style={styles.homeButton}>
                                <ThemedText style={{ color: theme.postText, fontSize: 15 }}>Back To Home</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const s = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10
    },
    header: {
        alignItems: 'center',
    },
    headerText: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.text,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    label: {
        marginBottom: 8,
    },
    input: {
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        fontSize: 15,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    categoryBox: {
        width: 80,
        height: 80,
        borderWidth: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    preview: {
        width: '100%',
        height: 180,
        borderRadius: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        gap: 12,
    },
    cancelButton: {
        borderWidth: 1.5,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(18, 18, 18, 0.66)',
    },
    popup: {
        width: '85%',
        height: 300,
        backgroundColor: theme.background,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    checkmark: {
        backgroundColor: theme.primary,
        borderRadius: 50,
        paddingHorizontal: 25,
        paddingVertical: 25,
    },
    homeButton: {
        backgroundColor: theme.primary,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 55,
    },
});
