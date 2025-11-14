import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { saveUser } from './storageService';

export const registerUser = async (fullName, username, email, password) => {
    fullName = fullName?.trim();
    username = username?.trim().toLowerCase();
    email = email?.trim();
    password = password?.trim();

    if (!fullName || !username || !email || !password) {
        throw { customMessage: "Please fill in all required fields." };
    }

    if (password.length < 6) {
        throw { customMessage: "Password must be at least 6 characters." };
    }

    try {
        // Kontrollo username para se të krijosh përdoruesin
        const usernameQuery = query(
            collection(db, "users"),
            where("username", "==", username)
        );
        const usernameSnap = await getDocs(usernameQuery);

        if (!usernameSnap.empty) {
            throw { customMessage: "This username is already taken." };
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const avatar = `https://placehold.co/100x100?text=${fullName[0]?.toUpperCase()}`;

        const userData = {
            uid: user.uid,
            fullName,
            username,
            email,
            avatar,
            location: "Prishtina",
            createdAt: Date.now(),
            updatedAt: Date.now()
        };


        await setDoc(doc(db, "users", user.uid), userData);
        await saveUser(userData);

        return userData;

    } catch (error) {
        let customMessage = "Registration failed.";

        switch (error.code) {
            case "auth/email-already-in-use":
                customMessage = "This email is already registered.";
                break;
            case "auth/invalid-email":
                customMessage = "Invalid email format.";
                break;
            case "auth/weak-password":
                customMessage = "Password must be at least 6 characters.";
                break;
            default:
                if (error.customMessage) {
                    customMessage = error.customMessage;
                }
                break;
        }

        throw { customMessage };
    }
};

export const loginUser = async (email, password) => {
    email = email?.trim();
    password = password?.trim();

    if (!email || !password) {
        throw { customMessage: "Please enter email and password." };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const snap = await getDoc(doc(db, "users", user.uid));
        const userDataFromDB = snap.exists() ? snap.data() : {};

        const userData = {
            uid: user.uid,
            email: user.email,
            avatar: userDataFromDB.avatar || `https://placehold.co/100x100?text=${user.email[0]?.toUpperCase()}`,
            location: userDataFromDB.location || "Prishtina",
            fullName: userDataFromDB.fullName || "Unknown User",
            username: userDataFromDB.username || user.email.split("@")[0].toLowerCase(),
            createdAt: userDataFromDB.createdAt || Date.now(),
            updatedAt: Date.now(),
        };

        await saveUser(userData);
        return userData;

    } catch (error) {
        let customMessage = "Login failed. Please try again.";

        if (error.code === "auth/invalid-credential") {
            customMessage = "Invalid email or password.";
        }

        throw { customMessage };
    }
};

export const userService = {
    getUserById: async (uid) => {
        try {
            const ref = doc(db, "users", uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            return { uid, ...snap.data() };
        } catch {
            return null;
        }
    },
};