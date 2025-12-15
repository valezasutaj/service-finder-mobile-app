import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal } from "react-native";
import { ArrowLeft, MoreVertical, MessageCircle } from "lucide-react-native";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import ThemedButton from "../../../components/ThemedButton";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../context/ThemedModes";
import { jobService } from "../../../services/jobsService";
import { getCategoryIcon } from "../../../services/imagesMap";
import { safeRouter } from "../../../utils/SafeRouter";
import ServiceReviews from "../../../components/ServiceReviews";
import DateTimePicker from "@react-native-community/datetimepicker";
import { bookingService, formatLocalDate, formatLocalTime } from "../../../services/bookingsService";
import SuccessModal from "../../../components/modals/SuccessModal";
import ErrorModal from "../../../components/modals/ErrorModal";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { auth, db } from "../../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id, image } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState("About");
  const [job, setJob] = useState(null);
  const styles = getStyles(theme);

  const [bookOpen, setBookOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState(new Date());
  const [pickedTime, setPickedTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [sending, setSending] = useState(false);

  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [existingBookingId, setExistingBookingId] = useState(null);
  const [acceptedFuture, setAcceptedFuture] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const load = async () => {
      const jobs = await jobService.getJobs();
      const found = jobs.find((j) => String(j.id) === String(id));
      setJob(found || null);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!job || !auth.currentUser) {
      setCheckingBooking(false);
      return;
    }

    const uid = auth.currentUser.uid;

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", uid),
      where("job.id", "==", job.id)
    );

    const unsub = onSnapshot(q, (snap) => {
      let pending = null;
      let futureAccepted = false;

      const now = new Date();

      snap.docs.forEach((d) => {
        const b = d.data();

        if (b.status === "Pending") pending = d.id;

        if (
          b.status === "Accepted" &&
          b.currentOffer?.date &&
          b.currentOffer?.time
        ) {
          const dt = new Date(`${b.currentOffer.date}T${b.currentOffer.time}`);
          if (dt > now) futureAccepted = true;
        }
      });

      setAlreadyBooked(!!pending);
      setExistingBookingId(pending);
      setAcceptedFuture(futureAccepted);
      setCheckingBooking(false);
    });
    return () => unsub();
  }, [job]);

  if (!job) {
    return (
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <ArrowLeft color={theme.text} size={22} />
            </TouchableOpacity>

            <ThemedText title style={styles.headerText}>Details</ThemedText>

            <TouchableOpacity style={{ padding: 10 }}>
              <MoreVertical color={theme.background} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={
              job?.image
                ? { uri: job.image }
                : require("../../../assets/images/categories/default.png")
            }
            style={styles.headerImage}
          />
        </View>

        <View style={styles.bodyContainer}>
          <ThemedText style={styles.category}>{job.category?.label}</ThemedText>

          <ThemedText title style={styles.title}>{job.name}</ThemedText>

          <ThemedText title style={styles.price}>
            ${job.price} <ThemedText style={styles.priceUnit}>(Per Hour)</ThemedText>
          </ThemedText>

          <View style={styles.tabs}>
            {["About", "Gallery", "Review", "Services"].map((tab) => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                <ThemedText
                  style={[
                    styles.tabText,
                    activeTab === tab && { color: theme.primary, fontWeight: "700" },
                  ]}
                >
                  {tab}
                </ThemedText>
                {activeTab === tab && (
                  <View style={[styles.activeUnderline, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "About" && (
            <View style={{ marginTop: 10 }}>
              <ThemedText style={styles.aboutTitle}>About Service</ThemedText>
              <ThemedText style={styles.aboutText}>{job.description}</ThemedText>
            </View>
          )}

          {activeTab === "Review" && (
            <ServiceReviews serviceId={job.id} providerId={job.provider?.uid} />
          )}

          <ThemedCard style={styles.providerCard}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => safeRouter.push(`/profile/${job.provider.uid}`)}
            >
              <Image source={{ uri: job.provider?.avatar }} style={styles.providerImage} />
              <View style={{ marginLeft: 10 }}>
                <ThemedText title style={{ fontSize: 15 }}>{job.provider?.fullName}</ThemedText>
                <ThemedText>Service Provider</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: theme.primary }]}
              onPress={() => safeRouter.push(`/messages/${job.provider.uid}`)}
            >
              <MessageCircle size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </ThemedCard>
        </View>
      </ScrollView>

      <View style={styles.bottomFixed}>
        <ThemedButton
          style={{
            backgroundColor: acceptedFuture
              ? "#4CAF50"
              : alreadyBooked
              ? "#B00020"
              : undefined,
            opacity: checkingBooking ? 0.6 : 1,
          }}
          disabled={checkingBooking || acceptedFuture}
        >
          <ThemedText
            style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
            onPress={() => {
              if (checkingBooking) return;

              if (acceptedFuture) {
                setSuccessModal({
                  open: true,
                  title: "Already Accepted",
                  message: "You already have a future accepted booking.",
                });
                return;
              }

              if (alreadyBooked && existingBookingId) {
                setConfirmCancel(true);
                return;
              }

              setBookOpen(true);
            }}
          >
            {checkingBooking
              ? "Checking..."
              : acceptedFuture
              ? "Accepted"
              : alreadyBooked
              ? "Cancel Request"
              : "Book Service Now"}
          </ThemedText>
        </ThemedButton>
      </View>

      <ConfirmModal
        visible={confirmCancel}
        title="Cancel Booking?"
        message="Do you want to cancel your pending booking request?"
        confirmText="Cancel Booking"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={async () => {
          try {
            setConfirmCancel(false);
            await bookingService.cancelBooking(existingBookingId);

            setSuccessModal({
              open: true,
              title: "Cancelled",
              message: "Your booking has been cancelled.",
            });
          } catch (e) {
            setErrorModal({
              open: true,
              title: "Error",
              message: e.message || "Failed to cancel booking.",
            });
          }
        }}
      />

      <Modal visible={bookOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.bookBox}>
            <ThemedText title style={{ marginBottom: 10, color: theme.text }}>
              Pick date & time
            </ThemedText>

            <TouchableOpacity onPress={() => setShowDate(true)} style={{ paddingVertical: 10 }}>
              <ThemedText>Date: {formatLocalDate(pickedDate)}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowTime(true)} style={{ paddingVertical: 10 }}>
              <ThemedText>Time: {formatLocalTime(pickedTime)}</ThemedText>
            </TouchableOpacity>

            {showDate && (
              <DateTimePicker
                value={pickedDate}
                mode="date"
                onChange={(_, d) => {
                  setShowDate(false);
                  if (d) setPickedDate(d);
                }}
              />
            )}

            {showTime && (
              <DateTimePicker
                value={pickedTime}
                mode="time"
                onChange={(_, t) => {
                  setShowTime(false);
                  if (t) setPickedTime(t);
                }}
              />
            )}

            <View style={styles.row}>
              <TouchableOpacity onPress={() => setBookOpen(false)} style={styles.cancelBtn}>
                <ThemedText style={{ textAlign: "center", color: theme.text }}>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={sending}
                onPress={async () => {
                  try {
                    setSending(true);

                    const uid = auth.currentUser?.uid;
                    if (!uid) throw new Error("Please login first.");

                    await bookingService.createBooking({
                      job,
                      provider: job.provider,
                      providerId: job.provider.uid,
                      customerId: uid,
                      date: formatLocalDate(pickedDate),
                      time: formatLocalTime(pickedTime),
                      price: job.price,
                    });

                    setBookOpen(false);

                    setSuccessModal({
                      open: true,
                        title: "Request Sent",
                      message: "Your booking request has been sent.",
                    });

                  } catch (e) {
                    setErrorModal({
                      open: true,
                      title: "Error",
                      message: e.message || "Failed to send booking request.",
                    });
                  } finally {
                    setSending(false);
                  }
                }}
                style={[styles.sendBtn, { opacity: sending ? 0.6 : 1 }]}
              >
                <ThemedText style={{ color: "#ffffffff", fontWeight: "700", textAlign: "center" }}>
                  {sending ? "Sending..." : "Send Request"}
                </ThemedText>
              </TouchableOpacity> 
            </View>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={successModal.open}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal((prev) => ({ ...prev, open: false }))}
      />

      <ErrorModal
        visible={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal((prev) => ({ ...prev, open: false }))}
      />
    </ThemedView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    headerContainer: {
      paddingHorizontal: 16,
      height: 70,
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerText: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
    },
    iconButton: {
      backgroundColor: theme.cardBackground,
      padding: 10,
      borderRadius: 40,
    },
    imageWrapper: {
      alignItems: "center",
    },
    headerImage: {
      width: "90%",
      height: 260,
      borderRadius: 20,
    },
    bodyContainer: {
      paddingHorizontal: 18,
      marginTop: 15,
    },
    category: {
      color: theme.primary,
      fontWeight: "600",
      marginBottom: 4,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    price: {
      fontSize: 24,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },
    priceUnit: {
      fontSize: 14,
      color: theme.mutedText,
    },
    tabs: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      marginTop: 20,
    },
    tabText: {
      fontSize: 15,
      color: theme.text,
    },
    activeUnderline: {
      height: 2,
      marginTop: 6,
    },
    aboutTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 6,
    },
    aboutText: {
      fontSize: 14,
      color: theme.mutedText,
      lineHeight: 20,
    },
    providerCard: {
      marginTop: 30,
      flexDirection: "row",
      paddingVertical: 14,
      paddingHorizontal: 12,
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.cardBackground,
    },
    providerImage: {
      width: 50,
      height: 50,
      borderRadius: 50,
    },
    callButton: {
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 23,
    },
    bottomFixed: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: 20,
    },
    bookBox: {
  backgroundColor: theme.cardBackground,
  padding: 16,
  borderRadius: 14,
},

    row: {
      flexDirection: "row",
      gap: 10,
      marginTop: 14,
    },
    cancelBtn: {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: theme.border ?? theme.mutedText,
},

sendBtn: {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  backgroundColor: theme.primary,
},

  });
