import React, { useEffect, useState } from 'react';
import { View, TextInput, Image, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { safeRouter } from "../../utils/SafeRouter";
import { useTheme } from '../../context/ThemedModes';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import Spacer from '../../components/Spacer';
import { Check } from "lucide-react-native";
import { auth } from "../../firebase";
import { userService } from "../../services/userService";
import { jobService } from "../../services/jobsService";
import { categoryService } from "../../services/categoriesService";
import { getCategoryIcon } from "../../services/imagesMap";

export default function Post() {
    const { theme } = useTheme();
    const styles = s(theme);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [image, setImage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const c = await categoryService.getCategories();
                setCategories(c);
            } finally {
                setLoadingCategories(false);
            }
        };
        load();
    }, []);

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

    const handlePost = async () => {
        setError("");

        if (!name.trim() || !price.trim() || !category) {
            setError("Please fill all required fields!");
            return;
        }

        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) return setError("You must be logged in.");

            const provider = await userService.getUserById(firebaseUser.uid);
            if (!provider) return setError("Provider profile not found.");

            await jobService.createJob({
                name,
                price: parseFloat(price),
                discount: discount ? `${discount}%` : "0%",
                description,
                image: image || "https://placehold.co/600x400",

                category: {
                    id: category.id,
                    label: category.label,
                    icon: category.icon
                },

                provider: {
                    uid: provider.uid,
                    fullName: provider.fullName || "Unknown",
                    username: provider.username || "",
                    email: provider.email || "",
                    avatar:
                        provider.avatar ??
                        `https://placehold.co/100x100?text=${provider.fullName?.[0]?.toUpperCase() || "U"}`
                }
            });

            setIsSubmitted(true);

        } catch (err) {
            console.log("POST ERROR:", err);
            setError(err.message ?? "Failed to post job.");
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={styles.header}>
                        <ThemedText title style={styles.headerText}>Post Job</ThemedText>
                    </View>

                    <View style={styles.content}>
                        <ThemedText type="subtitle" style={styles.label}>Name</ThemedText>
                        <TextInput
                            placeholder="Enter Service Name"
                            placeholderTextColor={theme.mutedText}
                            value={name}
                            onChangeText={setName}
                            style={[styles.input, { backgroundColor: theme.uiBackground, borderColor: theme.border, color: theme.text }]}
                        />

                        <Spacer height={15} />

                        <ThemedText type="subtitle" style={styles.label}>Price</ThemedText>
                        <TextInput
                            keyboardType="numeric"
                            placeholder="Enter Price"
                            placeholderTextColor={theme.mutedText}
                            value={price}
                            onChangeText={setPrice}
                            style={[styles.input, { backgroundColor: theme.uiBackground, borderColor: theme.border, color: theme.text }]}
                        />

                        <Spacer height={15} />

                        <ThemedText type="subtitle" style={styles.label}>Discount</ThemedText>
                        <TextInput
                            keyboardType="numeric"
                            placeholder="Enter Discount"
                            placeholderTextColor={theme.mutedText}
                            value={discount}
                            onChangeText={setDiscount}
                            style={[styles.input, { backgroundColor: theme.uiBackground, borderColor: theme.border, color: theme.text }]}
                        />

                        <Spacer height={15} />

                        <ThemedText type="subtitle" style={styles.label}>Description</ThemedText>
                        <TextInput
                            placeholder="Enter Description"
                            placeholderTextColor={theme.mutedText}
                            value={description}
                            onChangeText={setDescription}
                            style={[styles.input, { backgroundColor: theme.uiBackground, borderColor: theme.border, color: theme.text }]}
                        />

                        <Spacer height={15} />

                        <ThemedText type="subtitle" style={styles.label}>Select Category</ThemedText>

                        {loadingCategories ? (
                            <ThemedText>Loading...</ThemedText>
                        ) : (
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={categories}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => setCategory(item)} style={styles.categoryItem}>
                                        <View style={[
                                            styles.categoryBox,
                                            {
                                                borderColor: category?.id === item.id ? theme.primary : theme.border,
                                                backgroundColor: category?.id === item.id ? theme.primary + "33" : theme.uiBackground
                                            }
                                        ]}>
                                            <Image source={getCategoryIcon(item.icon)} style={styles.categoryImage} />
                                        </View>
                                        <ThemedText style={{
                                            fontSize: 12,
                                            marginTop: 6,
                                            color: category?.id === item.id ? theme.primary : theme.text
                                        }}>
                                            {item.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        <Spacer height={15} />

                        <ThemedText type="subtitle" style={styles.label}>Add Image</ThemedText>
                        <ThemedButton onPress={pickImage}>
                            <ThemedText style={{ color: theme.postText }}>Pick an Image</ThemedText>
                        </ThemedButton>

                        {image ? (
                            <>
                                <Spacer height={15} />
                                <Image source={{ uri: image }} style={styles.preview} />
                            </>
                        ) : null}

                        {error ? (
                            <ThemedText style={{ color: "red", textAlign: "center", marginTop: 10 }}>{error}</ThemedText>
                        ) : null}

                    </View>
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        onPress={() => safeRouter.back()}
                        style={[styles.cancelButton, { borderColor: theme.primary }]}
                    >
                        <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
                    </TouchableOpacity>

                    <View style={{ flex: 1, backgroundColor: theme.primary, borderRadius: 10 }}>
                        <ThemedButton onPress={handlePost}>
                            <ThemedText style={{ color: theme.postText }}>Post Job</ThemedText>
                        </ThemedButton>
                    </View>
                </View>

                <Modal visible={isSubmitted} transparent animationType="fade">
                    <View style={styles.overlay}>
                        <View style={styles.popup}>
                            <View style={styles.checkmark}>
                                <Check color={theme.postText} size={36} strokeWidth={3} />
                            </View>

                            <ThemedText style={{ color: theme.backHome, fontSize: 18 }}>
                                Posted Successfully
                            </ThemedText>

                            <ThemedText style={{ color: theme.backHome }}>
                                You have successfully posted your service
                            </ThemedText>

                            <TouchableOpacity
                                onPress={() => {
                                    setIsSubmitted(false);
                                    safeRouter.back();
                                }}
                                style={styles.homeButton}
                            >
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
    container: { flex: 1, paddingTop: 10 },
    header: { alignItems: "center" },
    headerText: { fontSize: 22, fontWeight: "700", color: theme.text },
    content: { paddingHorizontal: 20, paddingTop: 10 },
    label: { marginBottom: 8 },
    input: {
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        fontSize: 15
    },
    categoryItem: { alignItems: "center", marginRight: 16 },
    categoryBox: {
        width: 80,
        height: 80,
        borderWidth: 2,
        borderRadius: 12,
        overflow: "hidden",
    },
    categoryImage: { width: "100%", height: "100%" },
    preview: { width: "100%", height: 180, borderRadius: 10 },
    footer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        gap: 12
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1.5,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center"
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