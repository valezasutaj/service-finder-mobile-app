import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import ThemedText from "./ThemedText";
import ThemedButton from "./ThemedButton";
import { useTheme } from "../context/ThemedModes";
import { reviewService } from "../services/reviewsService.js";
import { auth } from "../firebase.js";

import anonymousAvatar from "../assets/images/categories/anonymous.png";
import defaultAvatar from "../assets/images/categories/default-avatar.png";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const fetchUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("Profile fetch error:", e);
    return null;
  }
};

const StarRow = ({ value, onChange, color = "#FFD700" }) => (
  <View style={{ flexDirection: "row", marginVertical: 8 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onChange(star)}>
        <ThemedText
          style={{
            fontSize: 26,
            marginRight: 4,
            color: star <= value ? color : "#555",
          }}
        >
          {star <= value ? "★" : "☆"}
        </ThemedText>
      </TouchableOpacity>
    ))}
  </View>
);

const ServiceReviews = ({ serviceId, providerId }) => {
  const { theme } = useTheme();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getReviews(serviceId);

      const enhanced = await Promise.all(
        data.map(async (r) => {
          if (r.isAnonymous) {
            return {
              ...r,
              avatar: anonymousAvatar,
              customerName: "Anonymous",
            };
          }

          const profile = await fetchUserProfile(r.customerId);

          return {
            ...r,
            avatar: profile?.avatar || defaultAvatar,
            customerName: profile?.fullName || r.customerName || "User",
          };
        })
      );

      setReviews(enhanced);
    } catch (e) {
      console.error("Error loading reviews:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) loadReviews();
  }, [serviceId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const handleSubmitReview = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to submit a review.");
      return;
    }

    const existing = reviews.find((r) => r.customerId === user.uid);
    if (existing) {
      alert("You have already reviewed this service.");
      return;
    }

    if (!rating) {
      alert("Please select a star rating.");
      return;
    }

    try {
      setSubmitting(true);

      const reviewData = {
        serviceId,
        providerId,
        customerId: user.uid,

        isAnonymous,
        customerName: isAnonymous ? "Anonymous" : user.displayName || "User",

        rating,
        comment,
      };

      await reviewService.addReview(reviewData);

      setRating(0);
      setComment("");
      setIsAnonymous(false);

      await loadReviews();
      alert("Review submitted successfully!");
    } catch (e) {
      console.error("Submit error:", e);
      alert("Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id, uid) => {
    if (uid !== auth.currentUser?.uid) return;

    try {
      await reviewService.deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (e) {
      console.error("Delete error:", e);
      alert("Could not delete review.");
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <ThemedText
        style={{ fontWeight: "700", color: theme.text, marginBottom: 6 }}
      >
        Reviews
      </ThemedText>

      {loading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <>
          {reviews.length ? (
            <ThemedText style={{ color: theme.mutedText, marginBottom: 10 }}>
              Average rating: {averageRating.toFixed(1)} / 5 ⭐ (
              {reviews.length} reviews)
            </ThemedText>
          ) : (
            <ThemedText style={{ color: theme.mutedText }}>
              No reviews yet.
            </ThemedText>
          )}

          {reviews.map((rev) => (
            <View
              key={rev.id}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.cardBackground,
              }}
            >
              <Image
                source={rev.avatar}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 22,
                  marginRight: 12,
                }}
              />

              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: "700", color: theme.text }}>
                  {rev.customerName} · {rev.rating}★
                </ThemedText>

                {rev.comment ? (
                  <ThemedText style={{ color: theme.mutedText }}>
                    {rev.comment}
                  </ThemedText>
                ) : null}

                {rev.customerId === auth.currentUser?.uid && (
                  <TouchableOpacity
                    onPress={() => handleDeleteReview(rev.id, rev.customerId)}
                    style={{ marginTop: 4 }}
                  >
                    <ThemedText style={{ color: "red" }}>
                      Delete review
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <View style={{ marginTop: 20 }}>
            <ThemedText style={{ fontWeight: "700", color: theme.text }}>
              Write a review
            </ThemedText>

            <StarRow
              value={rating}
              onChange={setRating}
              color={theme.primary}
            />

            <TextInput
              placeholder="Share your experience..."
              placeholderTextColor={theme.mutedText}
              value={comment}
              onChangeText={setComment}
              multiline
              style={{
                borderWidth: 1,
                borderColor: theme.cardBackground,
                borderRadius: 10,
                padding: 10,
                minHeight: 80,
                color: theme.text,
                marginTop: 10,
              }}
            />

            {/* Anonymous toggle */}
            <TouchableOpacity
              onPress={() => setIsAnonymous(!isAnonymous)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <ThemedText style={{ fontSize: 22, marginRight: 8 }}>
                {isAnonymous ? "☑" : "☐"}
              </ThemedText>
              <ThemedText style={{ color: theme.text }}>
                Post anonymously
              </ThemedText>
            </TouchableOpacity>

            <View style={{ marginTop: 16 }}>
              <ThemedButton onPress={handleSubmitReview} disabled={submitting}>
                <ThemedText
                  style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </ThemedText>
              </ThemedButton>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default ServiceReviews;
