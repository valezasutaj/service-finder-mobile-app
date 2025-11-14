import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';

import {
    doc,
    setDoc,
    getDoc,
    query,
    where,
    getDocs,
    collection
} from 'firebase/firestore';

import { saveUser } from './storageService';



export const registerUser = async (fullName, username, email, password) => {
    fullName = fullName?.trim();
    username = username?.trim().toLowerCase();
    email = email?.trim();
    password = password?.trim();

    if (!fullName || !username || !email || !password)
        throw { customMessage: "Please fill in all required fields." };

    if (password.length < 6)
        throw { customMessage: "Password should be at least 6 characters long." };

    const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", username)
    );
    const usernameSnap = await getDocs(usernameQuery);

    if (!usernameSnap.empty)
        throw { customMessage: "This username is already taken." };

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const avatar = `https://placehold.co/100x100?text=${fullName[0]?.toUpperCase()}`;

        const userData = {
            uid: user.uid,
            fullName,
            username,
            email,
            avatar,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await setDoc(doc(db, "users", user.uid), userData);

        await saveUser(userData);

        return userData;

    } catch (error) {
        console.log("REGISTER ERROR:", error);

        let customMessage = "Registration failed.";

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
        }

        throw { customMessage };
    }
};


export const loginUser = async (email, password) => {
    email = email?.trim();
    password = password?.trim();

    if (!email || !password)
        throw { customMessage: "Please fill in both email and password." };

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const finalUser = { uid: user.uid, ...userData };

        await saveUser(finalUser);

        return finalUser;

    } catch (error) {
        console.log("LOGIN ERROR:", error);

        let customMessage = "Login failed. Please try again.";

        if (error.code === "auth/invalid-credential")
            customMessage = "Invalid email or password.";

        throw { customMessage };
    }
};


export const userService = {

    getUserById: async (uid) => {
        try {
            const ref = doc(db, "users", uid);
            const snap = await getDoc(ref);

            if (!snap.exists()) return null;

            return {
                uid,
                ...snap.data(),
            };
        } catch (err) {
            console.error("userService.getUserById ERROR:", err);
            return null;
        }
    },

};
