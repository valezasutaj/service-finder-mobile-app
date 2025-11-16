import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const COLLECTION = "reviews";

export const reviewService = {
  addReview: async (reviewData) => {
    try {
      const docId = `${reviewData.serviceId}_${reviewData.customerId}`;

      const reviewDoc = {
        ...reviewData,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, COLLECTION, docId), reviewDoc);

      return { id: docId, ...reviewDoc };
    } catch (error) {
      console.error("Error adding/updating review:", error);
      throw error;
    }
  },

  getReviews: async (serviceId) => {
    try {
      const reviewsQuery = query(
        collection(db, COLLECTION),
        where("serviceId", "==", serviceId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(reviewsQuery);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error getting reviews:", error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      await deleteDoc(doc(db, COLLECTION, reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};
