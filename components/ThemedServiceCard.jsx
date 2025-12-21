import React, { useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import ThemedCard from './ThemedCard';
import ThemedText from './ThemedText';
import ThemedModal from './modals/ThemedModal';
import { TrendingUp, Trash2, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemedModes';


const ThemedServiceCard = ({
    id,
    name,
    discount,
    price,
    image,
    providerName,
    onPress,
    showDelete = false,
    showBookmark = true,
    onDelete
}) => {
    const { theme } = useTheme();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeletePress = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        setShowDeleteModal(false);
        onDelete?.(id);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    return (
        <>
            <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
                <ThemedCard style={[styles.card, { shadowColor: theme.shadow }]}>

                    <Image source={image} style={styles.image} resizeMode="cover" />

                    <View style={styles.content}>
                        <ThemedText title style={[styles.title, { color: theme.title }]} numberOfLines={1}>
                            {name}
                        </ThemedText>

                        <ThemedText style={[styles.provider, { color: theme.mutedText }]}>
                            {providerName || "Unknown Provider"}
                        </ThemedText>

                        {discount && (
                            <ThemedText style={[styles.discount, { color: theme.primary }]}>
                                Save {discount}
                            </ThemedText>
                        )}

                        <ThemedText style={[styles.price, { color: theme.text }]}>
                            ${price}
                        </ThemedText>
                    </View>

                    <View style={styles.actionsContainer}>
                        {showDelete && (
                            <TouchableOpacity
                                style={[styles.deleteButton, { backgroundColor: '#ff444422' }]}
                                onPress={handleDeletePress}
                            >
                                <Trash2 color="#ff4444" size={18} />
                            </TouchableOpacity>
                        )}

                        {showBookmark && (
                            <View style={[styles.bookmark, { backgroundColor: theme.primary + '22' }]}>
                                <TrendingUp color={theme.text} size={17} />
                            </View>
                        )}
                    </View>
                </ThemedCard>
            </TouchableOpacity>

            <ThemedModal
                visible={showDeleteModal}
                onClose={handleCancelDelete}
                animationType="fade"
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <ThemedText title style={[styles.modalTitle, { color: theme.text }]}>
                            Delete Service
                        </ThemedText>
                        <TouchableOpacity onPress={handleCancelDelete} style={styles.closeButton}>
                            <X size={20} color={theme.mutedText} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <ThemedText style={[styles.modalMessage, { color: theme.mutedText }]}>
                            Are you sure you want to delete "{name}"? This action cannot be undone.
                        </ThemedText>
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: theme.border }]}
                            onPress={handleCancelDelete}
                        >
                            <ThemedText style={[styles.cancelButtonText, { color: theme.text }]}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.deleteConfirmButton, { backgroundColor: '#ff4444' }]}
                            onPress={handleConfirmDelete}
                        >
                            <ThemedText style={styles.deleteConfirmButtonText}>
                                Delete
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedModal>
        </>
    );
};

export default ThemedServiceCard;

const styles = StyleSheet.create({
    card: {
        marginBottom: 14,
        flexDirection: 'row',
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
        marginHorizontal: 10,
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    provider: {
        fontSize: 12,
        marginBottom: 6,
    },
    discount: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },
    actionsContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        alignItems: 'flex-end',
        gap: 8,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 50,
    },
    bookmark: {
        padding: 8,
        borderRadius: 50,
    },
    // Modal Styles
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    modalMessage: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteConfirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    deleteConfirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});