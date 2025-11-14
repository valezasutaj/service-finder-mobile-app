import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';

import NavBar from '../../components/NavBar';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedBookingCard from '../../components/ThemedBookingCard';

import { useTheme } from '../../context/ThemedModes';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell } from 'lucide-react-native';

import { bookingService } from '../../services/bookingsService';
import { auth } from '../../firebase';
import { getCategoryIcon } from '../../services/imagesMap';

export default function BookingScreen() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = getStyles(theme);
  const navigation = useNavigation();

  const load = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      const userId = firebaseUser.uid;

      const data = await bookingService.getBookingsByUser(userId);

      const mapped = data.map(b => ({
        ...b,
        image: getCategoryIcon(b.job?.categories?.[0]?.icon),
        title: b.job?.name,
        providerName: b.job?.provider?.fullName || "Unknown Provider",
      }));

      setBookings(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => load(), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleCancel = (id) =>
    Alert.alert(
      'Cancel Booking',
      'Are you sure?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await bookingService.updateBookingStatus(id, 'Cancelled');
            setBookings(prev =>
              prev.map(b => (b.id === id ? { ...b, status: 'Cancelled' } : b))
            );
          },
        },
      ]
    );

  const filtered =
    selectedTab === 'All'
      ? bookings
      : bookings.filter(b => b.status === selectedTab);

  if (loading) {
    return (
      <ThemedView safe style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView safe style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>My Booking</ThemedText>

        <TouchableOpacity>
          <Bell size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['All', 'Completed', 'Pending', 'Cancelled'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <ThemedText style={[styles.tabText, selectedTab === tab && { color: '#fff' }]}>
              {tab}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ThemedBookingCard
            id={item.id}
            title={item.title}
            price={item.price}
            date={item.date}
            provider={item.providerName}
            status={item.status}
            image={item.image}
            onCancel={handleCancel}
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
      paddingHorizontal: 15,
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
      borderRadius: 23,
      marginVertical: 8,
      marginHorizontal: 12,
      paddingVertical: 8,
    },
    tab: {
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 23,
    },
    tabActive: {
      backgroundColor: theme.primary,
    },
    tabText: {
      fontSize: 14,
      color: theme.text,
    },
  });
