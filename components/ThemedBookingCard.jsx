import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemedModes';
import ThemedText from './ThemedText';

const statusColors = {
  Completed: { background: '#EAF9F1', text: '#1EB980' },
  Pending: { background: '#FFF6E5', text: '#FFAA00' },
  Cancelled: { background: '#FDE2E2', text: '#FF4D4F' },
};

const ThemedBookingCard = ({ id, title, bookingId, price, date, provider, status, image }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const { background, text } =
    statusColors[status] || { background: theme.border, text: theme.text };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ marginHorizontal: 12 }}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <Image source={image} style={styles.image} />
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.bookingId}>Booking ID: {bookingId}</ThemedText>
            <ThemedText style={styles.price}>{price}</ThemedText>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: background }]}>
            <Text style={[styles.statusText, { color: text }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Date & Time</ThemedText>
            <ThemedText style={styles.detailValue}>{date}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Service Provider</ThemedText>
            <ThemedText style={styles.detailValue}>{provider}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    image: {
      width: 85,
      height: 85,
      borderRadius: 10,
      marginRight: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 3,
    },
    bookingId: {
      fontSize: 12.5,
      color: theme.mutedText,
      marginBottom: 3,
    },
    price: {
      fontSize: 14.5,
      fontWeight: 'bold',
      color: theme.text,
    },
    statusBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
    },
    statusText: {
      fontSize: 12.5,
      fontWeight: '600',
    },
    details: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 8,
      marginTop: 6,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 12.5,
      color: theme.mutedText,
    },
    detailValue: {
      fontSize: 13.5,
      color: theme.text,
      fontWeight: '500',
    },
  });

export default ThemedBookingCard;
