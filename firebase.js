import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAwpv-MMxitBwpY5jma-tIG-uPyT0eV2F4",
    authDomain: "servicefinder-fiek.firebaseapp.com",
    projectId: "servicefinder-fiek",
    storageBucket: "servicefinder-fiek.appspot.com",
    messagingSenderId: "1083853747405",
    appId: "1:1083853747405:web:64499fbb0b7df517212584"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;


