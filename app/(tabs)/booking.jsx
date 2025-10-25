import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import NavBar from '../../components/NavBar';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { useTheme } from '../../context/ThemedModes';
import ThemedBookingCard from '../../components/ThemedBookingCard';
import { BOOKINGS } from '../../constants/data';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell } from 'lucide-react-native';

export default function BookingScreen() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('All');
  const [bookings, setBookings] = useState(BOOKINGS);
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const handleCancel = (id) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure that you want to canel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setBookings((prev) =>
              prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b))
            );
          },
        },
      ]
    );
  };

  const filteredBookings =
    selectedTab === 'All'
      ? bookings
      : bookings.filter((b) => b.status === selectedTab);

  return (
    <ThemedView safe style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft
            style={{ marginLeft: 20 }}
            size={22}
            color={theme.text}
          />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>My Booking</ThemedText>

        <TouchableOpacity>
          <Bell
            style={{ marginRight: 20 }}
            size={22}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['All', 'Completed', 'Pending', 'Cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
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
