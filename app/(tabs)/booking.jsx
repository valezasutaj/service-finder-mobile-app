// screens/bookings/BookingScreen.jsx
import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, Image } from 'react-native';
import NavBar from '../../components/NavBar';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { useTheme } from '../../context/ThemedModes';
import ThemedBookingCard from '../../components/ThemedBookingCard';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { bookingService } from '../../services/bookingsService';
import { auth } from '../../firebase';

export default function BookingScreen() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const fetchBookings = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userBookings = await bookingService.getUserBookings(userId, 'customer');

      const mappedBookings = userBookings.map(b => ({
        ...b,
        serviceImage: b.serviceImage ? { uri: b.serviceImage } : undefined
      }));

      setBookings(mappedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = (id) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure that you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await bookingService.updateBookingStatus(id, 'Cancelled');
              setBookings(prev =>
                prev.map(b => (b.id === id ? { ...b, status: 'Cancelled' } : b))
              );
            } catch (error) {
              console.error('Error cancelling booking:', error);
            }
          },
        },
      ]
    );
  };

  const filteredBookings = selectedTab === 'All'
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
          <ArrowLeft style={{ marginLeft: 20 }} size={22} color={theme.text} />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>My Booking</ThemedText>

        <TouchableOpacity>
          <Bell style={{ marginRight: 20 }} size={22} color={theme.text} />
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
        data={filteredBookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ThemedBookingCard
            id={item.id}
            title={item.serviceName}
            bookingId={item.bookingId || item.id}
            price={item.price}
            date={item.date}
            provider={item.providerName}
            status={item.status}
            image={item.serviceImage}
            onCancel={handleCancel}
          />
        )}
        scrollEnabled={false}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={
          <ThemedText style={{ textAlign: 'center', marginTop: 20, color: theme.text }}>
            No bookings found.
          </ThemedText>
        }
      />

      <NavBar />
    </ThemedView>
  );
}

const getStyles = (theme) => StyleSheet.create({
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
