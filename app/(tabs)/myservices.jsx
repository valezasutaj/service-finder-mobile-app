import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedServiceCard from "../../components/ThemedServiceCard";
import NavBar from "../../components/NavBar";
import SuccessModal from "../../components/modals/SuccessModal";
import ErrorModal from "../../components/modals/ErrorModal";
import LoginRequiredScreen from "../../components/LoginRequiredScreen";
import { useTheme } from "../../context/ThemedModes";
import { safeRouter } from "../../utils/SafeRouter";
import { jobService } from "../../services/jobsService";
import { getUser } from "../../services/storageService";

export default function MyServices() {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    const [user, setUser] = useState(null);

    useEffect(() => {
        loadServices(true);
    }, []);

    const loadServices = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);

            const currentUser = await getUser();
            setUser(currentUser);

            if (!currentUser) {
                setServices([]);
                return;
            }

            const myJobs = await jobService.getJobsByUser(currentUser.uid);
            setServices(myJobs);
        } catch (error) {
            console.error('Error loading services:', error);
            showModal('Error', 'Failed to load services.', true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadServices(false);
    }, []);

    const showModal = (title, message, isError = false) => {
        setModalContent({ title, message });
        if (isError) setShowErrorModal(true);
        else setShowSuccessModal(true);
    };


    const handleDeleteService = async (serviceId) => {
        if (!user) return;

        const backup = services;

        try {
            setDeletingId(serviceId);
            setServices(prev => prev.filter(s => s.id !== serviceId));

            await jobService.deleteJob(serviceId);
            showModal("Success", "Service deleted successfully");
        } catch (err) {
            console.error("Delete error:", err);
            setServices(backup);
            showModal("Error", "Failed to delete service", true);
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddService = () => {
        if (!user) return;
        safeRouter.push("/post");
    };

    const handleServicePress = (serviceId) => {
        safeRouter.push(`/jobdetails/${serviceId}`);
    };

    if (loading && !user) {
        return (
            <ThemedView safe style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <LoginRequiredScreen
                onLogin={() => safeRouter.push("/login")}
                onSignup={() => safeRouter.push("/signup")}
                message="Please login to view your messages."
            />
        );
    }

    return (
        <ThemedView safe style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                    />
                }
            >
                <View style={styles.header}>
                    <ThemedText title style={styles.title}>My Services</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: theme.mutedText }]}>
                        {services.length} service{services.length !== 1 ? "s" : ""}
                    </ThemedText>
                </View>

                {services.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyEmoji}>📭</ThemedText>
                        <ThemedText style={styles.emptyTitle}>No Services Yet</ThemedText>
                        <ThemedText style={styles.emptyText}>
                            Create your first service and start getting clients!
                        </ThemedText>

                        <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
                            <ThemedText style={styles.addButtonText}>Add Your First Service</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.servicesContainer}>
                        <FlatList
                            data={services}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <ThemedServiceCard
                                    id={item.id}
                                    name={item.name}
                                    price={item.price}
                                    discount={item.discount}
                                    image={ item.image ? { uri: item.image } : require('../../assets/images/categories/default.png')}
                                    providerName={item.provider?.fullName}
                                    onPress={() => handleServicePress(item.id)}
                                    showDelete={true}
                                    showBookmark={false}
                                    onDelete={handleDeleteService}
                                    isDeleting={deletingId === item.id}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                        />
                    </View>
                )}

                {services.length !== 0 && (
                    <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
                        <ThemedText style={styles.addButtonText}>+ Add New Service</ThemedText>
                    </TouchableOpacity>
                )}


            </ScrollView>

            <SuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={modalContent.title}
                message={modalContent.message}
            />

            <ErrorModal
                visible={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title={modalContent.title}
                message={modalContent.message}
            />

            <NavBar />
        </ThemedView>
    );
}


const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: theme.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "500",
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: theme.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: theme.mutedText,
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 30,
    },
    servicesContainer: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        marginTop: 25,
        marginBottom: 55,
        marginHorizontal: 20,
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: theme.primary,
        alignItems: "center",
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
