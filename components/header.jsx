
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
      if (!user || !user.location) return;

      let city = user.location;

      
      if (city.includes(",")) {
        city = city.split(",")[1].trim();
      }

      
      city = city
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace("ë", "e")
        .replace("Ë", "E");
           
        
            if (
              city.toLowerCase() === "prishtine" ||
              city.toLowerCase() === "prishtina" ||
              city.toLowerCase() === "pristine"
            ) {
              city = "Pristina,XK";
            }

      console.log("CITY REQUESTED:", city); 

      const weatherData = await getWeatherByCity(city);

      if (weatherData) {
        setWeather({
          temp: weatherData.temp,
          icon: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`,
        });
            }
            } catch (error) {
              console.log("Weather fetch error: ", error);
            }
          };

          if (user?.location) {
            loadWeather();
          }
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

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {weather.icon && (
              <Image
                source={{ uri: weather.icon }}
                style={{ width: 32, height: 32, }}
                resizeMode="contain"
              />
            )}

            <ThemedText
              style={[
                styles.userLocation,
                { color: theme.mutedText || theme.text },
              ]}
            >
              {`${weather.temp ?? '--'}°C | ${user?.location || ''}`}
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

