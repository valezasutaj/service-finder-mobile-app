import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const saveUserToFirestore = async (userId, data) => {
  const ref = doc(db, "users", userId);
  await setDoc(ref, data, { merge: true });
};

export const getUserFromFirestore = async (userId) => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};
