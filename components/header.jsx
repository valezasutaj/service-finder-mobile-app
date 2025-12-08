import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemedModes';
import { safeRouter } from "../utils/SafeRouter";
import { Ionicons } from '@expo/vector-icons';
import { getUser } from '../services/storageService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getWeatherByCity } from '../services/WeatherService';

const Header = () => {
  const { theme, isDarkMode } = useTheme();
  const styles = s(theme);
  const [user, setUser] = useState(null);

  const [weather, setWeather] = useState({
    temp: null,
    icon: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getUser();
      if (storedUser) setUser(storedUser);
    };

    fetchUser();

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
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

  useEffect(() => {
    const loadWeather = async () => {
      try {
        let city = null;

        if (user?.location) {
          city = user.location;

          if (city.includes(",")) {
            city = city.split(",")[1].trim();
          }

          city = city
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ë/gi, "e");

          if (city.toLowerCase().startsWith("prisht")) {
            city = "Pristina";
          }
        } else {
          city = "Pristina";
        }

        const apiCity =
          city.toLowerCase().startsWith("prisht") || city.toLowerCase().includes("kosov")
            ? `${city},XK`
            : city;

        const weatherData = await getWeatherByCity(apiCity);

        if (weatherData) {
          setWeather({
            temp: weatherData.temp,
            icon: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`,
          });
        }
      } catch (e) {
        console.log("Weather error", e);
      }
    };

    loadWeather();
  }, [user]);

  return (
    <View
      style={[
        styles.headerContainer,
        { backgroundColor: theme.uiBackground },
      ]}
    >
      <View style={styles.leftSection}>
            <TouchableOpacity onPress={() => safeRouter.push('/profile')}>
        {user?.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
            }}
          />
        ) : (
          <Ionicons
            name="person-circle"
            size={42}
            color={isDarkMode ? '#fff' : '#000'}
          />
        )}
      </TouchableOpacity>

        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {user?.fullName || 'Name Surname'}
          </ThemedText>

          <View style={styles.weatherRow}>
            {weather.icon && (
              <Image
                source={{ uri: weather.icon }}
                style={styles.weatherIcon}
                resizeMode="contain"
              />
            )}

            <ThemedText style={styles.userLocation}>
              {`${weather.temp ?? '--'}°C - ${user?.location || 'Prishtina'}`}
            </ThemedText>
          </View>
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
    userName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 2,
    },
    weatherRow: {
      position: 'relative',
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    weatherIcon: {
      width: 22,
      height: 22,
      opacity: 0.9,
    },
    userLocation: {
      fontSize: 12,
      opacity: 0.8,
      color: theme.mutedText || theme.text,
    },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
