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
import { userService } from '../services/userService';   // <-- për Firestore user-in me lokacion

const Header = () => {
  const { theme, isDarkMode } = useTheme();
  const styles = s(theme);

  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState({
    temp: null,
    icon: null,
  });

  // =====================================================
  // 1️⃣ Marrim user-in nga storage + Firestore (me lokacion)
  // =====================================================
  useEffect(() => {
    const loadUser = async () => {
      const stored = await getUser();
      if (stored) setUser(stored);

      // 👉 SHKARKO VERSIONIN E RI NGA FIRESTORE (SIDOMOS LOKACIONIN)
      if (stored?.uid) {
        const fresh = await userService.getUserById(stored.uid);
        if (fresh) {
          setUser(fresh);
        }
      }
    };

    loadUser();

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => prev ?? {
          fullName: firebaseUser.displayName || "Name Surname",
          email: firebaseUser.email,
          location: { city: "Prishtina" },  // fallback
          avatar: firebaseUser.photoURL || null,
        });
      }
    });

    return () => unsub();
  }, []);

  // =====================================================
  // 2️⃣ Marrim motin sipas user.location.city
  // =====================================================
  useEffect(() => {
    const loadWeather = async () => {
      try {
        let city = user?.location?.city || "Prishtina";

        // Normalizim për API
        city = city
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ë/gi, "e");

        if (city.toLowerCase().startsWith("prisht")) {
          city = "Pristina";
        }

        const apiCity = `${city},XK`;

        const weatherData = await getWeatherByCity(apiCity);

        if (weatherData) {
          setWeather({
            temp: weatherData.temp,
            icon: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`,
          });
        }
      } catch (err) {
        console.log("Weather error", err);
      }
    };

    if (user) loadWeather();
  }, [user]);

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.uiBackground }]}>
      
      {/* ================= LEFT SIDE ================= */}
      <View style={styles.leftSection}>
        
        <TouchableOpacity onPress={() => safeRouter.push('/profile')}>
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: 42, height: 42, borderRadius: 21 }}
            />
          ) : (
            <Ionicons name="person-circle" size={42} color={isDarkMode ? "#fff" : "#000"} />
          )}
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {user?.fullName || "Name Surname"}
          </ThemedText>

          {/* Temperature + City */}
          <View style={styles.weatherRow}>
            {weather.icon && (
              <Image source={{ uri: weather.icon }} style={styles.weatherIcon} resizeMode="contain" />
            )}

            <ThemedText style={styles.userLocation}>
              {`${weather.temp ?? "--"}°C - ${user?.location?.city || "Prishtina"}`}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* ================= RIGHT SIDE ================= */}
      <View style={styles.rightSection}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.primary }]}>
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      borderRadius: 16,
    },
    leftSection: { flexDirection: "row", alignItems: "center", gap: 10 },
    userInfo: { flexDirection: "column" },
    userName: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 2,
    },
    weatherRow: {
      flexDirection: "row",
      alignItems: "center",
      right: 8,
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
    rightSection: { flexDirection: "row", alignItems: "center", gap: 8 },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
  });
