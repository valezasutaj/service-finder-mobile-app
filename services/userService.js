import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { saveUser } from './storageService';

export const registerUser = async (fullName, username, email, password) => {
    if (!fullName?.trim() || !username?.trim() || !email?.trim() || !password?.trim()) {
        throw { customMessage: "Please fill in all required fields." };
    }
    if (password.length < 6) {
        throw { customMessage: "Password should be at least 6 characters long." };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        const userData = {
            fullName: fullName.trim(),
            username: username.trim(),
            email: email.trim(),
            createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        await saveUser({ uid: user.uid, ...userData });

        return { uid: user.uid, ...userData };
    } catch (error) {
        let customMessage = "Registration failed. Please try again.";
        switch (error.code) {
            case "auth/email-already-in-use":
                customMessage = "This email is already registered.";
                break;
            case "auth/invalid-email":
                customMessage = "Invalid email format.";
                break;
            case "auth/weak-password":
                customMessage = "Password should be at least 6 characters.";
                break;
            case "auth/configuration-not-found":
                customMessage = "Firebase authentication not configured properly.";
                break;
        }
        throw { customMessage };
    }
};

export const loginUser = async (email, password) => {
    if (!email?.trim() || !password?.trim()) {
        throw { customMessage: "Please fill in both email and password." };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        await saveUser({ uid: user.uid, ...userData });

        return { uid: user.uid, ...userData };
    } catch (error) {
        console.error('Login error:', error);
        let customMessage = "Login failed. Please try again.";
        switch (error.code) {
            case "auth/invalid-email":
                customMessage = "Invalid email format.";
                break;
            case "auth/invalid-credential":
                customMessage = "Invalid credentials.";
                break;
            case "auth/configuration-not-found":
                customMessage = "Firebase authentication not configured properly.";
                break;
        }
        throw { customMessage };
    }
};
