import { Text, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemedModes';

const ThemedText = ({ style, title = false, ...props }) => {
    const { theme } = useTheme();

    const textColor = title ? theme.title : theme.text;

    return (
        <Text style={[{ color: textColor }, style]} {...props} />
    );
};

export default ThemedText;
