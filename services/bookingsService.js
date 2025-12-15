import { collection, query, where, onSnapshot, getDoc, updateDoc, doc, serverTimestamp, arrayUnion, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const pad = (n) => String(n).padStart(2, "0");

export const formatLocalDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const formatLocalTime = (d) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const nowISO = () => new Date().toISOString();

const requireString = (val, name) => {
  if (!val || typeof val !== "string") throw new Error(`Missing ${name}`);
};

const getUserRole = (uid, b) => {
  if (uid === b.providerId) return "provider";
  if (uid === b.customerId) return "customer";
  return null;
};

const assertTurn = (booking, role) => {
  if (booking.waitingOn && booking.waitingOn !== role) {
    throw new Error("Not your turn to respond");
  }
};

const assertNotFinal = (booking) => {
  if (["Accepted", "Declined", "Cancelled"].includes(booking.status)) {
    throw new Error(`Booking already ${booking.status}`);
  }
};

export const bookingService = {
  listenToBookings(uid, callback, errorCallback) {
    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", uid)
    );

    return onSnapshot(q, callback, errorCallback);
  },

  async createBooking(data) {
    requireString(data.customerId, "customerId");
    requireString(data.date, "date");
    requireString(data.time, "time");

    const providerId = data.providerId || data.provider?.uid;
    requireString(providerId, "providerId");

    const offer = {
      date: data.date,
      time: data.time,
      byRole: "customer",
      byId: data.customerId,
    };

    const payload = {
      job: data.job || null,
      provider: data.provider || null,

      customerId: data.customerId,
      providerId,

      price: data.price ?? data.job?.price ?? 0,
      notes: data.notes || "",

      status: "Pending",
      waitingOn: "provider",

      currentOffer: offer,
      offers: [{ ...offer, at: nowISO() }],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, "bookings"), payload);
    return { id: ref.id, ...payload };
  },

  async acceptBooking(bookingId) {
    requireString(bookingId, "bookingId");

    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not logged in");

    const ref = doc(db, "bookings", bookingId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error("Booking not found");

    const b = snap.data();
    const role = getUserRole(uid, b);
    if (!role) throw new Error("Not allowed");

    assertNotFinal(b);
    assertTurn(b, role);

    await updateDoc(ref, {
      status: "Accepted",
      waitingOn: null,
      acceptedOffer: b.currentOffer || null,
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async cancelBooking(bookingId) {
    requireString(bookingId, "bookingId");

    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not logged in");

    const ref = doc(db, "bookings", bookingId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error("Booking not found");

    const b = snap.data();
    const role = getUserRole(uid, b);
    if (!role) throw new Error("Not allowed");

    if (b.status === "Accepted") {
      throw new Error("Cannot cancel an accepted booking");
    }

    await updateDoc(ref, {
      status: "Cancelled",
      waitingOn: null,
      cancelledBy: uid,
      cancelledRole: role,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async declineBooking(bookingId) {
    requireString(bookingId, "bookingId");

    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not logged in");

    const ref = doc(db, "bookings", bookingId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error("Booking not found");

    const b = snap.data();
    const role = getUserRole(uid, b);
    if (!role) throw new Error("Not allowed");

    assertNotFinal(b);
    assertTurn(b, role);

    await updateDoc(ref, {
      status: "Declined",
      waitingOn: null,

      declinedBy: uid,
      declinedRole: role,
      declinedAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });
  },

  async proposeReschedule(bookingId, date, time) {
    requireString(bookingId, "bookingId");
    requireString(date, "date");
    requireString(time, "time");

    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not logged in");

    const ref = doc(db, "bookings", bookingId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error("Booking not found");
    const b = snap.data();

    const role = getUserRole(uid, b);
    if (!role) throw new Error("Not allowed");

    assertNotFinal(b);
    assertTurn(b, role);

    const offer = {
      date,
      time,
      byRole: role,
      byId: uid,
    };

    const nextSide = role === "provider" ? "customer" : "provider";

    await updateDoc(ref, {
      status: "Pending",
      waitingOn: nextSide,
      currentOffer: offer,
      offers: arrayUnion({ ...offer, at: nowISO() }),
      updatedAt: serverTimestamp(),
    });
  },
};