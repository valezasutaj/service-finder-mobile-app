import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View, useColorScheme } from 'react-native';
import ThemedCard from './ThemedCard';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';
import { Bookmark } from 'lucide-react-native';
import { useTheme } from '../context/ThemedModes';

const ThemedServiceCard = ({ id, name, discount, price, image, onPress }) => {
   const { theme } = useTheme();

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <ThemedCard style={[styles.card, { shadowColor: theme.shadow }]}>
                <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />

                <View style={styles.content}>
                    <ThemedText style={[styles.id, { color: theme.iconColor }]}>#{id}</ThemedText>
                    <ThemedText title style={[styles.title, { color: theme.title }]}>{name}</ThemedText>
                    <ThemedText style={[styles.discount, { color: theme.text }]}>Save {discount}</ThemedText>
                    <ThemedText style={[styles.price, { color: theme.text }]}>${price}</ThemedText>
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
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
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
    id: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.8,
        marginBottom: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
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
