import { StyleSheet, View, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedCard = ({ style, ...props }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View
            style={[{ backgroundColor: theme.cardBackground, borderColor: theme.border }, styles.card, style]}
            {...props}
        />
    );
};

export default ThemedCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
