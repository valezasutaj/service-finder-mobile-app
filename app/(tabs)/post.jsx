import React, { useEffect, useState, useRef } from 'react';
import {
    View, TextInput, Image, FlatList, TouchableOpacity,
    KeyboardAvoidingView, StyleSheet, ScrollView, Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { safeRouter } from "../../utils/SafeRouter";
import { useTheme } from '../../context/ThemedModes';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import Spacer from '../../components/Spacer';

import SuccessModal from "../../components/modals/SuccessModal";
import ErrorModal from "../../components/modals/ErrorModal";

import { auth } from "../../firebase";
import { userService } from "../../services/userService";
import { jobService } from "../../services/jobsService";
import { categoryService } from "../../services/categoriesService";
import { getCategoryIcon } from "../../services/imagesMap";
import LoginRequiredScreen from "../../components/LoginRequiredScreen";



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


export default function Post() {
    const { theme } = useTheme();
    const styles = s(theme);
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [image, setImage] = useState("");
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", message: "" });

    useEffect(() => {
        const checkUser = async () => {
            const u = auth.currentUser;
            if (!u) return;
            setUser(u);
        };

        checkUser();

        const loadCategories = async () => {
            try {
                const c = await categoryService.getCategories();
                setCategories(c);
            } finally {
                setLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    const showModal = (title, message, isError = false) => {
        setModalContent({ title, message });
        if (isError) {
            setShowErrorModal(true);
        } else {
            setShowSuccessModal(true);
        }
    };


    const pickImageFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImage(base64Img);
        }
    };


    const pickImageFromCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== "granted") {
            alert("Camera permission is required.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImage(base64Img);
        }
    };

    const handlePost = async () => {
        setError("");

        if (!name.trim() || !price.trim() || !category) {
            setError("Please fill all required fields!");
            return;
        }

        try {
            if (!auth.currentUser) return;

            const provider = await userService.getUserById(auth.currentUser.uid);
            if (!provider) {
                return setError("Provider profile not found.");
            }

            await jobService.createJob({
                name,
                price: parseFloat(price),
                discount: discount ? `${discount}%` : "0%",
                description,
                image,
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
                    avatar: provider.avatar || `https://placehold.co/100x100?text=${provider.fullName?.[0]?.toUpperCase() || "U"}`
                }
            });

            showModal("Success", "You have successfully posted your service!");
        } catch (err) {
            showModal("Error", "Failed to post job.", true);
        }
    };

    if (!user) {
        return (
            <LoginRequiredScreen
                onLogin={() => safeRouter.push("/login")}
                onSignup={() => safeRouter.push("/signup")}
                message="Please login to post a job."
            />
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={styles.header}>
                        <ThemedText title style={styles.headerText}>Post Job</ThemedText>
                    </View>

                    <View style={styles.content}>
                        <ThemedText type="subtitle" style={styles.label}>Name*</ThemedText>
                        <TextInput
                            placeholder="Enter Service Name"
                            placeholderTextColor={theme.mutedText}
                            value={name}
                            onChangeText={setName}
                            style={[styles.input, { backgroundColor: theme.uiBackground, borderColor: theme.border, color: theme.text }]}
                        />

                        <Spacer height={15} />

                        <ThemedText type="subtitle" style={styles.label}>Price*</ThemedText>
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

                        <ThemedText type="subtitle" style={styles.label}>Select Category*</ThemedText>

                        {loadingCategories ? (
                            <ThemedText>Loading...</ThemedText>
                        ) : (
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={categories}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <FadePress
                                        onPress={() => setCategory(item)}
                                        style={styles.categoryItem}
                                    >
                                        <View
                                            style={[
                                                styles.categoryBox,
                                                {
                                                    borderColor: category?.id === item.id ? theme.primary : theme.border,
                                                    backgroundColor: category?.id === item.id
                                                        ? theme.primary + "33"
                                                        : theme.uiBackground
                                                }
                                            ]}
                                        >
                                            <Image source={getCategoryIcon(item.icon)} style={styles.categoryImage} />
                                        </View>

                                        <ThemedText
                                            style={{
                                                fontSize: 12,
                                                marginTop: 6,
                                                color: category?.id === item.id ? theme.primary : theme.text
                                            }}
                                        >
                                            {item.label}
                                        </ThemedText>
                                    </FadePress>
                                )}
                            />
                        )}

                        <Spacer height={15} />

                        <ThemedText type="subtitle" style={styles.label}>Add Image</ThemedText>

                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <ThemedButton onPress={pickImageFromCamera} style={{ flex: 1 }}>
                                <ThemedText style={{ color: theme.postText }}>Use Camera</ThemedText>
                            </ThemedButton>

                            <ThemedButton onPress={pickImageFromGallery} style={{ flex: 1 }}>
                                <ThemedText style={{ color: theme.postText }}>Gallery</ThemedText>
                            </ThemedButton>
                        </View>

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

       
                    <FadePress
                        onPress={() => safeRouter.back()}
                        style={[styles.cancelButton, { borderColor: theme.primary }]}
                    >
                        <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
                    </FadePress>

                    <View style={{ flex: 1, backgroundColor: theme.primary, borderRadius: 10, justifyContent: "center" }}>
                        <ThemedButton onPress={handlePost}>
                            <ThemedText style={{ color: theme.postText }}>Post Job</ThemedText>
                        </ThemedButton>
                    </View>
                </View>

                <SuccessModal
                    visible={showSuccessModal}
                    onClose={() => {
                        setShowSuccessModal(false);
                        safeRouter.back();
                    }}
                    title={modalContent.title}
                    message={modalContent.message}
                />

                <ErrorModal
                    visible={showErrorModal}
                    onClose={() => setShowErrorModal(false)}
                    title={modalContent.title}
                    message={modalContent.message}
                />
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const s = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 10,
        },
        header: {
            alignItems: "center",
        },
        headerText: {
            fontSize: 22,
            fontWeight: "700",
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
            alignItems: "center",
            marginRight: 16,
        },
        categoryBox: {
            width: 80,
            height: 80,
            borderWidth: 2,
            borderRadius: 12,
            overflow: "hidden",
        },
        categoryImage: {
            width: "100%",
            height: "100%",
        },
        preview: {
            width: "100%",
            height: 180,
            borderRadius: 10,
        },
        footer: {
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderTopWidth: 1,
            gap: 12,
        },
        cancelButton: {
            flex: 1,
            borderWidth: 1.5,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: "center",
        }
    });
