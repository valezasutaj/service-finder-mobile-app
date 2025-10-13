import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import NavBar from '../components/NavBar';
import ThemedText from '../components/ThemedText';
import ThemedView from '../components/ThemedView';
import { useTheme } from '../context/ThemedModes';
import ThemedBookingCard from '../components/ThemedBookingCard';
import { BOOKINGS } from '../constants/data';
import { useNavigation } from '@react-navigation/native';


export default function BookingScreen() {
    const { theme } = useTheme();
    const [selectedTab, setSelectedTab] = useState('All');
    const styles = getStyles(theme);
    const navigation = useNavigation();


    const filteredBookings =
        selectedTab === 'All' ? BOOKINGS : BOOKINGS.filter((b) => b.status === selectedTab);

    return (
        <ThemedView safe style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        style={{ marginLeft: 20 }}
                        name="arrow-back"
                        size={22}
                        color={theme.text}
                    />
                </TouchableOpacity>

                <ThemedText style={styles.headerTitle}>My Booking</ThemedText>
                <TouchableOpacity>
                    <Ionicons
                        style={{ marginRight: 20 }}
                        name="notifications-outline"
                        size={22}
                        color={theme.text}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                {['All', 'Completed', 'Pending', 'Cancelled'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            selectedTab === tab && styles.tabActive,
                        ]}
                        onPress={() => setSelectedTab(tab)}
                    >
                        <ThemedText
                            style={[
                                styles.tabText,
                                selectedTab === tab && { color: '#fff' },
                            ]}
                        >
                            {tab}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredBookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ThemedBookingCard
                        id={item.id}
                        title={item.title}
                        bookingId={item.bookingId}
                        price={item.price}
                        date={item.date}
                        provider={item.provider}
                        status={item.status}
                        image={item.image}
                    />
                )}
                scrollEnabled={false}
                contentContainerStyle={{ paddingVertical: 10 }}
            />

            <NavBar />
        </ThemedView>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            paddingHorizontal: 16,
            paddingTop: 10,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.text,
        },
        tabs: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            marginVertical: 8,
            marginHorizontal: 12,
            paddingVertical: 6,
        },
        tab: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
        },
        tabActive: {
            backgroundColor: theme.primary,
        },
        tabText: {
            fontSize: 14,
            color: theme.text,
        },
    });

