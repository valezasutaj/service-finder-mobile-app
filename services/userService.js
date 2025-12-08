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
  collection,
  updateDoc
} from 'firebase/firestore';

import { saveUser, getUser } from './storageService';


// ===========================
// REGISTER USER
// ===========================
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

      // 🔥 STRUCTURA E RE
      location: {
        latitude: null,
        longitude: null,
        city: "Prishtina"
      },

      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await setDoc(doc(db, "users", user.uid), userData);
    await saveUser(userData);

    return userData;

  } catch (error) {
    let customMessage = "Registration failed.";

    if (error.code === "auth/email-already-in-use") customMessage = "This email is already registered.";
    if (error.code === "auth/invalid-email") customMessage = "Invalid email format.";
    if (error.code === "auth/weak-password") customMessage = "Password must be at least 6 characters.";

    if (error.customMessage) customMessage = error.customMessage;

    throw { customMessage };
  }
};



// ===========================
// LOGIN USER
// ===========================
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

    // 🔥 NËSE user-i i vjetër ka location si string → e konvertojmë
    let fixedLocation = userDataFromDB.location;
    if (typeof fixedLocation === "string") {
      fixedLocation = {
        latitude: null,
        longitude: null,
        city: fixedLocation
      };
    }

    const userData = {
      uid: user.uid,
      email: user.email,
      avatar: userDataFromDB.avatar || `https://placehold.co/100x100?text=${user.email[0]?.toUpperCase()}`,
      location: fixedLocation || { latitude: null, longitude: null, city: "Prishtina" },
      fullName: userDataFromDB.fullName || "Unknown User",
      username: userDataFromDB.username || user.email.split("@")[0].toLowerCase(),
      createdAt: userDataFromDB.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await saveUser(userData);
    return userData;

  } catch (error) {
    let customMessage = "Login failed. Please try again.";
    if (error.code === "auth/invalid-credential") customMessage = "Invalid email or password.";
    throw { customMessage };
  }
};



// ===========================
// UPDATE USER LOCATION
// ===========================
export const updateUserLocation = async (userId, coords) => {
  try {
    const ref = doc(db, "users", userId);

    await updateDoc(ref, {
      location: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        city: coords.city
      },
      updatedAt: Date.now(),
    });

    console.log("📍 Lokacioni u përditësua në Firestore!");

    // Update në AsyncStorage
    const localUser = await getUser();
    if (localUser) {
      const updatedLocal = {
        ...localUser,
        location: coords
      };
      await saveUser(updatedLocal);
    }

    return true;

  } catch (error) {
    console.log("❌ Gabim në updateUserLocation:", error);
    return false;
  }
};



// ===========================
// USER SERVICE
// ===========================
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

  getUserServices: async (userId) => {
    const q = query(
      collection(db, "jobs"),
      where("provider.uid", "==", userId)
    );

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};