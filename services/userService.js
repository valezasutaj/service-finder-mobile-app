import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

import { saveUser, getUser, removeUser } from "./storageService";

export const updateUserLocation = async (userId, locationData) => {
  try {
    console.log("Updating location for user:", userId, locationData);

    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      location: {
        city: locationData.city,
        coordinates: {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        }
      },
      lastLocationUpdate: new Date().toISOString()
    });

    console.log("Location updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

export const registerUser = async (fullName, username, email, password) => {
  fullName = fullName?.trim();
  username = username?.trim().toLowerCase();
  email = email?.trim().toLowerCase();
  password = password?.trim();

  if (!fullName || !username || !email || !password) {
    throw { customMessage: "Please fill in all fields." };
  }

  if (password.length < 6) {
    throw { customMessage: "Password must be at least 6 characters long." };
  }

  try {
    const usernameQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const usernameSnap = await getDocs(usernameQuery);

    if (!usernameSnap.empty) {
      throw { customMessage: "Username is already taken." };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const emailQuery = query(
      collection(db, "users"),
      where("email", "==", email)
    );
    const emailSnap = await getDocs(emailQuery);

    if (!emailSnap.empty) {
      throw { customMessage: "Email is already registered." };
    }

    const user = userCredential.user;

    const avatar = null;

    const userData = {
      uid: user.uid,
      fullName,
      username,
      email,
      avatar,
      phone: "",
      bio: "",
      profession: "",
      location: {
        latitude: null,
        longitude: null,
        city: "Prishtina",
      },

      privacy: {
        profileVisibility: true,
        activityStatus: true,
        readReceipts: true,
      },

      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, "users", user.uid), userData);
    await saveUser(userData);

    return userData;
  } catch (error) {
    let message = "Registration failed.";

    if (error.code === "auth/email-already-in-use")
      message = "Email is already registered.";
    if (error.code === "auth/invalid-email")
      message = "Invalid email address.";
    if (error.code === "auth/weak-password")
      message = "Password is too weak.";
    if (error.customMessage) message = error.customMessage;

    throw { customMessage: message };
  }
};

export const loginUser = async (email, password) => {
  email = email?.trim().toLowerCase();
  password = password?.trim();

  if (!email || !password) {
    throw { customMessage: "Please enter email and password." };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    const snap = await getDoc(doc(db, "users", user.uid));
    const dbUser = snap.exists() ? snap.data() : {};

    const userData = {
      uid: user.uid,
      email: user.email,
      fullName: dbUser.fullName || "User",
      username: dbUser.username || user.email.split("@")[0],
      avatar:
        dbUser.avatar ||
        null,
      phone: dbUser.phone || "",
      bio: dbUser.bio || "",
      profession: dbUser.profession || "",
      location:
        typeof dbUser.location === "string"
          ? { city: dbUser.location, latitude: null, longitude: null }
          : dbUser.location || {
            city: "Prishtina",
            latitude: null,
            longitude: null,
          },

      privacy: dbUser.privacy || {
        profileVisibility: true,
        activityStatus: true,
        readReceipts: true,
      },

      createdAt: dbUser.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await saveUser(userData);
    return userData;
  } catch (error) {
    let message = "Login failed.";

    if (error.code === "auth/invalid-credential")
      message = "Incorrect email or password.";
    if (error.code === "auth/user-not-found")
      message = "User not found.";
    if (error.code === "auth/wrong-password")
      message = "Incorrect password.";

    throw { customMessage: message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  if (!userId) throw { customMessage: "User ID missing." };

  try {
    await updateDoc(doc(db, "users", userId), {
      ...updates,
      updatedAt: Date.now(),
    });

    const localUser = await getUser();
    if (localUser?.uid === userId) {
      await saveUser({ ...localUser, ...updates, updatedAt: Date.now() });
    }

    return { success: true };
  } catch {
    throw { customMessage: "Failed to update profile." };
  }
};

export const updateUserPrivacy = async (userId, privacy) => {
  if (!userId) throw { customMessage: "User ID missing." };

  try {
    await updateDoc(doc(db, "users", userId), {
      privacy,
      updatedAt: Date.now(),
    });

    const localUser = await getUser();
    if (localUser?.uid === userId) {
      await saveUser({ ...localUser, privacy, updatedAt: Date.now() });
    }

    return { success: true };
  } catch {
    throw { customMessage: "Failed to update privacy settings." };
  }
};

export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error();

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    return { success: true };
  } catch (error) {
    let message = "Failed to update password.";

    if (error.code === "auth/wrong-password")
      message = "Current password is incorrect.";
    if (error.code === "auth/weak-password")
      message = "New password is too weak.";
    if (error.code === "auth/requires-recent-login")
      message = "Please login again to change password.";

    throw { customMessage: message };
  }
};

export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user");
    }

    const uid = user.uid;

    await deleteDoc(doc(db, "users", uid));

    await user.delete();

    await removeUser();

    return { success: true };

  } catch (error) {
    let message = "Failed to delete account.";

    if (error.code === "auth/requires-recent-login") {
      message = "Please login again to delete your account.";
    }

    throw { customMessage: message };
  }
};


export const userService = {
  getUserById: async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) return null;

      const data = snap.data();
      return {
        uid,
        ...data,
        location:
          typeof data.location === "string"
            ? { city: data.location, latitude: null, longitude: null }
            : data.location,
      };
    } catch {
      return null;
    }
  },

  listenUserById: (uid, callback) => {
    return onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        callback({ uid: snap.id, ...snap.data() });
      }
    });
  }
};
