import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'current_user';

export const saveUser = async (userData) => {
    try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        console.log('User saved to storage');
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
};

export const getUser = async () => {
    try {
        const userData = await AsyncStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

export const removeUser = async () => {
    try {
        await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error removing user:', error);
        throw error;
    }
};