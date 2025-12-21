import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";

import ThemedText from "./ThemedText";
import ThemedButton from "./ThemedButton";
import { useTheme } from "../context/ThemedModes";
import { reviewService } from "../services/reviewsService";
import { auth } from "../firebase";

import { Trash2, Pencil } from "lucide-react-native";

import anonymousAvatar from "../assets/images/categories/anonymous.png";
import defaultAvatar from "../assets/images/categories/default-avatar.png";

import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const fetchUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
};

const StarRow = ({ value, onChange, color }) => (
  <View style={{ flexDirection: "row", marginVertical: 8 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onChange(star)}>
        <ThemedText
          style={{
            fontSize: 26,
            marginRight: 4,
            color: star <= value ? color : "#666",
          }}
        >
          {star <= value ? "★" : "☆"}
        </ThemedText>
      </TouchableOpacity>
    ))}
  </View>
);

export default function ServiceReviews({ serviceId, providerId }) {
  const { theme } = useTheme();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editReviewId, setEditReviewId] = useState(null);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [sheetAnim] = useState(new Animated.Value(0));

  const loadReviews = async () => {
    try {
      setLoading(true);
      const raw = await reviewService.getReviews(serviceId);

      const enhanced = await Promise.all(
        raw.map(async (r) => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) loadReviews();
  }, [serviceId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const handleSubmitReview = async () => {
    const user = auth.currentUser;

    if (!user) return alert("Login required.");
    if (reviews.some((r) => r.customerId === user.uid))
      return alert("You already reviewed this service.");
    if (!rating) return alert("Rating required.");

    try {
      setSubmitting(true);

      await reviewService.addReview({
        serviceId,
        providerId,
        customerId: user.uid,
        isAnonymous,
        customerName: isAnonymous ? "Anonymous" : user.displayName,
        rating,
        comment,
      });

      setRating(0);
      setComment("");
      setIsAnonymous(false);

      loadReviews();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rev) => {
    if (rev.customerId !== auth.currentUser?.uid) return;

    if (confirm("Delete this review?")) {
      await reviewService.deleteReview(rev.id);
      loadReviews();
    }
  };

  const openEdit = (rev) => {
    setEditReviewId(rev.id);
    setEditRating(rev.rating);
    setEditComment(rev.comment);
    setEditVisible(true);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const closeEdit = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setEditVisible(false);
      sheetAnim.setValue(0);
    });
  };

  const handleSaveEdit = async () => {
    if (!editRating) return alert("Rating required.");

    await reviewService.addReview({
      serviceId,
      providerId,
      customerId: auth.currentUser.uid,
      isAnonymous: false,
      customerName: auth.currentUser.displayName,
      rating: editRating,
      comment: editComment,
    });

    closeEdit();
    loadReviews();
  };

  return (
    <View style={{ marginTop: 10 }}>
      <ThemedText
        style={{ fontWeight: "700", fontSize: 16, color: theme.text }}
      >
        Reviews
      </ThemedText>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 10 }} />
      ) : (
        <>
          {reviews.length ? (
            <ThemedText style={{ color: theme.mutedText, marginVertical: 10 }}>
              {averageRating.toFixed(1)} ★ average • {reviews.length} reviews
            </ThemedText>
          ) : (
            <ThemedText style={{ color: theme.mutedText, marginVertical: 10 }}>
              No reviews yet.
            </ThemedText>
          )}

          {reviews.map((rev) => (
            <View
              key={rev.id}
              style={{
                flexDirection: "row",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.cardBackground,
              }}
            >
              <Image
                source={rev.avatar}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 50,
                  marginRight: 12,
                  marginTop: 2,
                }}
              />

              <View style={{ flex: 1 }}>
                {/* Name */}
                <ThemedText
                  style={{
                    fontWeight: "700",
                    color: theme.text,
                    marginBottom: 2,
                  }}
                >
                  {rev.customerName}
                </ThemedText>

                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <ThemedText
                      key={i}
                      style={{
                        fontSize: 18,
                        color: i <= rev.rating ? "#FFA41C" : "#ccc",
                        marginRight: 2,
                      }}
                    >
                      {i <= rev.rating ? "★" : "☆"}
                    </ThemedText>
                  ))}
                </View>

                {rev.comment ? (
                  <ThemedText
                    style={{ color: theme.mutedText, lineHeight: 20 }}
                  >
                    {rev.comment}
                  </ThemedText>
                ) : null}
              </View>

              {rev.customerId === auth.currentUser?.uid && (
                <View style={{ justifyContent: "flex-start" }}>
                  <TouchableOpacity
                    onPress={() => openEdit(rev)}
                    style={{ marginBottom: 10 }}
                  >
                    <Pencil color={theme.text} size={20} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDelete(rev)}>
                    <Trash2 color="red" size={22} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          <View style={{ marginTop: 22 }}>
            <ThemedText
              style={{ fontWeight: "700", fontSize: 15, color: theme.text }}
            >
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
                borderRadius: 12,
                padding: 10,
                minHeight: 80,
                color: theme.text,
                marginTop: 10,
              }}
            />

            <TouchableOpacity
              onPress={() => setIsAnonymous(!isAnonymous)}
              style={{ flexDirection: "row", marginTop: 12 }}
            >
              <ThemedText style={{ fontSize: 20, marginRight: 6 }}>
                {isAnonymous ? "☑" : "☐"}
              </ThemedText>
              <ThemedText style={{ color: theme.text }}>
                Post anonymously
              </ThemedText>
            </TouchableOpacity>

            <View style={{ marginTop: 14 }}>
              <ThemedButton onPress={handleSubmitReview}>
                <ThemedText
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </ThemedText>
              </ThemedButton>
            </View>
          </View>
        </>
      )}

      <Modal transparent visible={editVisible} animationType="none">
        <TouchableWithoutFeedback onPress={closeEdit}>
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              opacity: fadeAnim,
            }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.cardBackground,
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            transform: [
              {
                translateY: sheetAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0],
                }),
              },
            ],
          }}
        >
          <ThemedText
            style={{ fontWeight: "700", fontSize: 16, marginBottom: 10 }}
          >
            Edit Review
          </ThemedText>

          <StarRow
            value={editRating}
            onChange={setEditRating}
            color={theme.primary}
          />

          <TextInput
            placeholder="Edit your review..."
            placeholderTextColor={theme.mutedText}
            value={editComment}
            onChangeText={setEditComment}
            multiline
            style={{
              borderWidth: 1,
              borderColor: theme.cardBackground,
              borderRadius: 10,
              padding: 10,
              minHeight: 80,
              color: theme.text,
              marginTop: 8,
            }}
          />

          <View style={{ flexDirection: "row", marginTop: 14 }}>
            <TouchableOpacity
              onPress={closeEdit}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginRight: 8,
                backgroundColor: theme.cardBackground,
                borderWidth: 1,
                borderColor: theme.mutedText,
              }}
            >
              <ThemedText style={{ color: theme.text }}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveEdit}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: theme.primary,
              }}
            >
              <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}
