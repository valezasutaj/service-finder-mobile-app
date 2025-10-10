import React from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedButton = ({ style, children, ...props }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <Pressable
            {...props}
            style={[
                styles.base,
                { backgroundColor: theme.buttonBackground },
            ]}
        >
            {children}
        </Pressable>
    );
};

export default ThemedButton;

const styles = StyleSheet.create({
    base: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
