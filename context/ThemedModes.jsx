import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedMode = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = Appearance.getColorScheme();
    const [userPreference, setUserPreference] = useState(null);
    const [systemTheme, setSystemTheme] = useState(systemScheme);

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
        setSystemTheme(colorScheme);
        });
        return () => listener.remove();
    }, []);

    const isDarkMode = userPreference === null ? systemTheme === 'dark' : userPreference === 'dark';

    const theme = isDarkMode ? Colors.dark : Colors.light;
    const setLightMode = () => setUserPreference('light');
    const setDarkMode = () => setUserPreference('dark');
    const setSystemMode = () => setUserPreference(null);

    return (
        <ThemedMode.Provider value={{theme, isDarkMode, userPreference, setLightMode, setDarkMode, setSystemMode}}>{children}</ThemedMode.Provider>
    );
};

export const useTheme = () => useContext(ThemedMode);
