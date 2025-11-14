import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import ThemedCard from './ThemedCard';
import ThemedText from './ThemedText';
import { Bookmark } from 'lucide-react-native';
import { useTheme } from '../context/ThemedModes';

const ThemedServiceCard = ({ id, name, discount, price, image, rating = null, providerName, onPress }) => {
    const { theme } = useTheme();

    return (
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

                    {!!discount && (
                        <ThemedText style={[styles.discount, { color: theme.primary }]}>
                            Save {discount}
                        </ThemedText>
                    )}

                    <ThemedText style={[styles.price, { color: theme.text }]}>
                        ${price}
                    </ThemedText>
                </View>

                <View style={[styles.bookmark, { backgroundColor: theme.primary + '22' }]}>
                    <Bookmark color={theme.text} size={18} />
                </View>
            </ThemedCard>
        </TouchableOpacity>
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
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    bookmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 8,
        borderRadius: 50,
    },
});
