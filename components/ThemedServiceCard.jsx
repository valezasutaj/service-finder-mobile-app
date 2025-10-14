import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import ThemedCard from './ThemedCard';
import ThemedText from './ThemedText';
import { Bookmark, Star } from 'lucide-react-native';
import { useTheme } from '../context/ThemedModes';

const ThemedServiceCard = ({ name, discount, price, image, rating = null, onPress }) => {
    const { theme } = useTheme();

    const renderStars = () => {
        if (rating === null) {
            return <ThemedText style={{ color: theme.text + '88', fontSize: 13 }}>No rating</ThemedText>;
        }

        const roundedStars = Math.round(rating);
        const stars = [];
        for (let i = 0; i < roundedStars; i++) {
            stars.push(
                <Star
                    key={`full-${i}`}
                    size={14}
                    color="#FFD700"
                    fill="#FFD700"
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <ThemedCard style={[styles.card, { shadowColor: theme.shadow }]}>
                <Image source={image} style={styles.image} resizeMode="cover" />

                <View style={styles.content}>
                    <ThemedText title style={[styles.title, { color: theme.title }]} numberOfLines={1}>
                        {name}
                    </ThemedText>

                    <View style={styles.ratingRow}>
                        <View style={styles.starsContainer}>{renderStars()}</View>
                    </View>

                    <ThemedText style={[styles.discount, { color: theme.text }]}>
                        Save {discount}
                    </ThemedText>
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
        marginVertical: 0,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        borderRadius: 10,
    },
    image: {
        width: 95,
        height: 95,
        borderRadius: 10,
        marginRight: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 6,
    },
    discount: {
        fontSize: 13,
        marginBottom: 4,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 4,
    },
    bookmark: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 8,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
