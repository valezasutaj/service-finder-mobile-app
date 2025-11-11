import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemedModes';
import { safeRouter } from "../utils/SafeRouter";
import { Ionicons } from '@expo/vector-icons';
import { getUser } from '../services/storageService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; 

const Header = () => {
  const { theme, isDarkMode } = useTheme();
  const styles = s(theme);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getUser();

      if (storedUser) {
        setUser(storedUser);
      }
    };

    fetchUser();

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('User from Firebase in Header:', firebaseUser);
      if (firebaseUser) {
        setUser((prev) =>
          prev ?? {
            fullName: firebaseUser.displayName || 'Name Surname',
            email: firebaseUser.email || '',
            location: 'Kosovë, Prishtinë', 
            photoURL: firebaseUser.photoURL || null,
          }
        );
      }
    });

    return () => unsub();
  }, []);

  console.log('User in Header:', user);

  return (
    <View
      style={[
        styles.headerContainer,
        { backgroundColor: theme.uiBackground },
      ]}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => safeRouter.push('/profile')}>
          <Ionicons
            name="person-circle"
            size={42}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <ThemedText style={[styles.userName, { color: theme.text }]}>
            {user?.fullName || 'Name Surname'}
          </ThemedText>
          <ThemedText
            style={[
              styles.userLocation,
              { color: theme.mutedText || theme.text },
            ]}
          >
            {user?.location || 'Kosovë, Prishtinë'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="notifications" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.primary }]}
          onPress={() => safeRouter.push('/booking')}
        >
          <Ionicons name="calendar" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const s = (theme) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      borderRadius: 16,
    },
    leftSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    userInfo: { flexDirection: 'column' },
    userName: { fontSize: 14, fontWeight: '600' },
    userLocation: { fontSize: 11, opacity: 0.7 },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });