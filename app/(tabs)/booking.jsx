import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, ActivityIndicator, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onAuthStateChanged } from "firebase/auth";

import NavBar from "../../components/NavBar";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import ThemedBookingCard from "../../components/ThemedBookingCard";

import ErrorModal from "../../components/modals/ErrorModal";
import SuccessModal from "../../components/modals/SuccessModal";

import { useTheme } from "../../context/ThemedModes";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Bell } from "lucide-react-native";

import { bookingService, formatLocalDate, formatLocalTime } from "../../services/bookingsService";
import { auth } from "../../firebase";
import { getCategoryIcon } from "../../services/imagesMap";
import { safeRouter } from "../../utils/SafeRouter";

const parseYMD = (s) => {
  if (!s || typeof s !== "string") return new Date();
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const tsToMillis = (ts) => (ts?.toMillis ? ts.toMillis() : 0);

export default function BookingScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const [selectedTab, setSelectedTab] = useState("All");

  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState(new Date());
  const [pickedTime, setPickedTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const seenActionable = useRef(new Set());

  const [error, setError] = useState({ visible: false, title: "", message: "" });
  const [success, setSuccess] = useState({ visible: false, title: "", message: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = bookingService.listenToBookings(
      uid,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));

        const mapped = list.map((b) => {
          const offer = b.currentOffer || {};
          const dateTimeStr =
            offer.date && offer.time ? `${offer.date} ${offer.time}` : b.date || "";

          return {
            ...b,
            bookingId: b.id,
            title: b.job?.name || "Service",
            providerName:
              b.provider?.fullName ||
              b.provider?.username ||
              "Unknown Provider",
            image:
              b.job?.image ||
              getCategoryIcon(b.job?.category?.icon) ||
              "https://placehold.co/300x200?text=No+Image",
            dateTimeStr,
          };
        });

        setBookings(mapped);
        setLoading(false);
      },
      (err) => {
        setError({
          visible: true,
          title: "Error",
          message: "Failed to load bookings.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const filteredBookings = useMemo(
    () =>
      selectedTab === "All"
        ? bookings
        : bookings.filter((b) => b.status === selectedTab),
    [selectedTab, bookings]
  );

  const actionable = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "Pending" && (b.waitingOn || "provider") === "customer"
      ),
    [bookings]
  );

  useEffect(() => {
    if (respondModalOpen || proposeModalOpen) return;

    const next = actionable.find((b) => !seenActionable.current.has(b.id));
    if (next) {
      seenActionable.current.add(next.id);
      setActiveBooking(next);
      setRespondModalOpen(true);
    }
  }, [actionable, respondModalOpen, proposeModalOpen]);

  const handleCancel = async (id) => {
    try {
      setActionLoading(true);
      await bookingService.cancelBooking(id);
      setRespondModalOpen(false);
      setProposeModalOpen(false);
      setActiveBooking(null);

      setTimeout(() => {
        setSuccess({
          visible: true,
          title: "Booking Cancelled",
          message: "Your booking has been successfully cancelled.",
        });
      }, 150);
    } catch (e) {
      setError({
        visible: true,
        title: "Error",
        message: e?.message || "Failed to cancel booking.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openProposeModal = () => {
    if (!activeBooking) return;

    const offer = activeBooking.currentOffer || {};
    setPickedDate(parseYMD(offer.date));

    const t = new Date();
    const [hh = 0, mm = 0] = (offer.time || "").split(":").map(Number);
    t.setHours(hh, mm, 0, 0);
    setPickedTime(t);

    setShowDate(false);
    setShowTime(false);

    setRespondModalOpen(false);
    setProposeModalOpen(true);
  };

  const handleAccept = async () => {
    if (!activeBooking?.id) return;

    try {
      setActionLoading(true);
      await bookingService.acceptBooking(activeBooking.id);
      setRespondModalOpen(false);

      setSuccess({
        visible: true,
        title: "Booking Accepted",
        message: "You have accepted the provider’s proposed time.",
      });

      setActiveBooking(null);
    } catch (e) {
      setError({
        visible: true,
        title: "Error",
        message: e?.message || "Failed to accept booking.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePropose = async () => {
    if (!activeBooking?.id) return;

    try {
      setActionLoading(true);
      await bookingService.proposeReschedule(
        activeBooking.id,
        formatLocalDate(pickedDate),
        formatLocalTime(pickedTime)
      );

      setProposeModalOpen(false);
      setActiveBooking(null);

      setSuccess({
        visible: true,
        title: "Proposal Sent",
        message: "Your new proposed time has been sent.",
      });
    } catch (e) {
      setError({
        visible: true,
        title: "Error",
        message: e?.message || "Failed to propose new time.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView
        safe
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView safe style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>My Booking</ThemedText>

        <TouchableOpacity onPress={() => safeRouter.push('/myprofile/notifications')}>
          <Bell size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {actionable.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            setActiveBooking(actionable[0]);
            setRespondModalOpen(true);
          }}
          style={styles.actionBanner(theme)}
        >
          <ThemedText style={{ fontWeight: "700" }}>
            {actionable.length} booking(s) need your response
          </ThemedText>
          <ThemedText style={{ color: theme.mutedText, marginTop: 4 }}>
            Tap to review and accept / propose a new time.
          </ThemedText>
        </TouchableOpacity>
      )}

      <View style={styles.tabs}>
        {["All", "Pending", "Accepted", "Declined", "Cancelled"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive(theme)]}
            onPress={() => setSelectedTab(tab)}
          >
            <ThemedText
              style={[
                styles.tabText,
                selectedTab === tab && { color: "#fff" },
              ]}
            >
              {tab}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedBookingCard
            id={item.id}
            bookingId={item.bookingId}
            title={item.title}
            price={item.price}
            date={item.dateTimeStr}
            provider={item.providerName}
            status={item.status}
            image={item.image}
            onCancel={handleCancel}
          />
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={respondModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox(theme)}>
            <ThemedText title style={{ fontSize: 18 }}>
              Provider proposed a time
            </ThemedText>

            <ThemedText style={{ marginTop: 10 }}>
              {activeBooking?.job?.name || "Service"}
            </ThemedText>

            <ThemedText style={{ marginTop: 6, color: theme.mutedText }}>
              Offered: {activeBooking?.currentOffer?.date}{" "}
              {activeBooking?.currentOffer?.time}
            </ThemedText>

            <ThemedText style={{ marginTop: 6, color: theme.mutedText }}>
              Provider:{" "}
              {activeBooking?.provider?.fullName ||
                activeBooking?.provider?.username ||
                "Unknown"}
            </ThemedText>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setRespondModalOpen(false)}
                style={styles.modalBtn(theme)}
              >
                <ThemedText style={{ textAlign: "center" }}>Later</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openProposeModal}
                disabled={actionLoading}
                style={styles.modalBtn(theme)}
              >
                <ThemedText style={{ textAlign: "center" }}>Propose</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAccept}
                disabled={actionLoading}
                style={styles.acceptBtn(theme)}
              >
                <ThemedText style={styles.acceptBtnText}>
                  {actionLoading ? "..." : "Accept"}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleCancel(activeBooking.id)}
              style={{ marginTop: 14, padding: 10 }}
            >
              <ThemedText style={{ textAlign: "center", color: "#FF4D4F" }}>
                Cancel booking
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={proposeModalOpen} transparent animationType="slide">
        <View style={styles.proposeBackdrop}>
          <View style={styles.proposeBox(theme)}>
            <ThemedText title style={{ fontSize: 18, marginBottom: 12 }}>
              Propose new date & time
            </ThemedText>

            <TouchableOpacity
              onPress={() => setShowDate(true)}
              style={{ paddingVertical: 12 }}
            >
              <ThemedText>Date: {formatLocalDate(pickedDate)}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTime(true)}
              style={{ paddingVertical: 12 }}
            >
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

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setProposeModalOpen(false);
                  setActiveBooking(null);
                }}
                style={styles.modalBtn(theme)}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePropose}
                disabled={actionLoading || !activeBooking?.id}
                style={[
                  styles.sendBtn(theme),
                  {
                    opacity: actionLoading || !activeBooking?.id ? 0.6 : 1,
                  },
                ]}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.sendBtnText}>Send</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ErrorModal
        visible={error.visible}
        title={error.title}
        message={error.message}
        onClose={() => setError({ visible: false })}
      />

      <SuccessModal
        visible={success.visible}
        title={success.title}
        message={success.message}
        onClose={() => setSuccess({ visible: false })}
      />

      <NavBar />
    </ThemedView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 15,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    tabs: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: theme.cardBackground,
      borderRadius: 23,
      marginVertical: 8,
      marginHorizontal: 12,
      paddingVertical: 8,
    },
    tab: {
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderRadius: 23,
    },
    tabActive: (theme) => ({
      backgroundColor: theme.primary,
    }),
    tabText: {
      fontSize: 13,
      color: theme.text,
    },
    actionBanner: (theme) => ({
      marginHorizontal: 12,
      marginTop: 6,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardBackground,
    }),
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: 20,
    },
    modalBox: (theme) => ({
      backgroundColor: theme.cardBackground,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    }),
    modalBtn: (theme) => ({
      flex: 1,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    }),
    acceptBtn: (theme) => ({
      flex: 1,
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.primary,
      alignItems: "center",
    }),
    acceptBtnText: {
      color: "#fff",
      fontWeight: "700",
    },
    proposeBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    proposeBox: (theme) => ({
      backgroundColor: theme.cardBackground,
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    }),
    sendBtn: (theme) => ({
      flex: 1,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: "center",
    }),
    sendBtnText: {
      color: "#fff",
      fontWeight: "700",
    },
  });
