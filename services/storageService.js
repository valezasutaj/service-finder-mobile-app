import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveUser(user) {
    try {
        console.log("💾 Saving user to storage:", user);
        await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

export async function getUser() {
    try {
        const json = await AsyncStorage.getItem('user');
        return json ? JSON.parse(json) : null;
    } catch (error) {
        console.error('Error reading user:', error);
        return null;
    }
}

export async function removeUser() {
    try {
        await AsyncStorage.removeItem('user');
    } catch (error) {
        console.error('Error removing user:', error);
    }
}
