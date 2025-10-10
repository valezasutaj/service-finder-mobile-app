import { StyleSheet, View, SafeAreaView, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedView = ({ style, children, safe = true }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const Container = safe ? SafeAreaView : View;

    return (
        <Container style={[styles.container, { backgroundColor: theme.background }, style]}>
            {children}
        </Container>
    );
};

export default ThemedView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
        paddingBottom: 12,
    },
});
