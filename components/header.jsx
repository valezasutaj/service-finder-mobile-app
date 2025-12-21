import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemedModes';
import { safeRouter } from "../utils/SafeRouter";
import { Ionicons } from '@expo/vector-icons';
import { getUser } from '../services/storageService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getWeatherByCity } from '../services/WeatherService';
import { userService } from '../services/userService';

const FadePress = ({ onPress, children, style, testID }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(opacity, {
      toValue: 0.5,
      duration: 120,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true
    }).start();
  };

  return (
    <Animated.View style={{ opacity }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
        testID={testID}  // Ja ku vendoset testID
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const Header = () => {
  const { theme } = useTheme();
  const styles = s(theme);

  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState({
    temp: null,
    icon: null,
  });

  useEffect(() => {
    const loadUser = async () => {
      const stored = await getUser();
      if (stored) setUser(stored);

      if (stored?.uid) {
        const fresh = await userService.getUserById(stored.uid);
        if (fresh) setUser(fresh);
      }
    };

    loadUser();

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => prev ?? {
          fullName: firebaseUser.displayName || "Name Surname",
          email: firebaseUser.email,
          location: { city: "Prishtina" },
          avatar: firebaseUser.photoURL || null,
        });
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        let city = user?.location?.city || "Prishtina";
        city = city
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ë/gi, "e");

        if (city.toLowerCase().startsWith("prisht")) city = "Pristina";

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
      <FadePress
        testID="profile-btn"
        onPress={() => safeRouter.push('/myprofile')}
        style={styles.leftSection}
      >
        {user?.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.headerAvatar}
          />
        ) : (
          <View style={styles.headerAvatarPlaceholder}>
            <Ionicons name="person" size={22} color={theme.mutedText} />
          </View>
        )}

        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {user?.fullName || "Name Surname"}
          </ThemedText>

          <View style={styles.weatherRow}>
            {weather.icon && (
              <Image source={{ uri: weather.icon }} style={styles.weatherIcon} resizeMode="contain" />
            )}

            <ThemedText style={styles.userLocation}>
              {`${weather.temp ?? "--"}°C - ${user?.location?.city || "Prishtina"}`}
            </ThemedText>
          </View>
        </View>
      </FadePress>

      <View style={styles.rightSection}>
        <FadePress
          testID="notifications-btn"
          onPress={() => safeRouter.push('provider/bookings')}
          style={[styles.iconButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="notifications" size={20} color="#fff" />
        </FadePress>

        <FadePress
          testID="calendar-btn"
          onPress={() => safeRouter.push('/booking')}
          style={[styles.iconButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="calendar" size={20} color="#fff" />
        </FadePress>
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
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
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
    rightSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    headerAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },
    headerAvatarPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
  });
