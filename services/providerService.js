import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

export const listenToProviderBookings = (onData, onError) => {
  let unsubscribeBookings = null;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      onData([]);
      return;
    }

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid)
    );

    unsubscribeBookings = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort(
            (a, b) =>
              (b.createdAt?.toMillis?.() || 0) -
              (a.createdAt?.toMillis?.() || 0)
          );

        onData(list);
      },
      (err) => {
        console.error("Provider bookings error:", err);
        onError?.(err);
      }
    );
  });

  return () => {
    unsubscribeAuth();
    unsubscribeBookings?.();
  };
};
