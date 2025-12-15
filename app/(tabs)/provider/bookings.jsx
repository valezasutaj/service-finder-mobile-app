import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import NavBar from "../../../components/NavBar";
import ErrorModal from "../../../components/modals/ErrorModal";
import SuccessModal from "../../../components/modals/SuccessModal";
import { useTheme } from "../../../context/ThemedModes";
import { bookingService } from "../../../services/bookingsService";
import { Image } from "react-native";
import { getCategoryIcon } from "../../../services/imagesMap";
import { listenToProviderBookings } from "../../../services/providerService";

const pad2 = (n) => String(n).padStart(2, "0");
const formatLocalDate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const formatLocalTime = (d) =>
  `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const parseYMD = (s) => {
  if (!s) return new Date();
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const tsToMillis = (ts) => (ts?.toMillis ? ts.toMillis() : 0);

export default function ProviderBookings() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const [uid, setUid] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [proposeModal, setProposeModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pickedDate, setPickedDate] = useState(new Date());
  const [pickedTime, setPickedTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const unsubscribe = listenToProviderBookings(
      (list) => {
        setBookings(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load bookings");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);


  const actionable = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "Pending" && (b.waitingOn ?? "provider") === "provider"
      ),
    [bookings]
  );

  const openPropose = (b) => {
    setSelectedBooking(b);
    const offer = b.currentOffer || b;
    setPickedDate(parseYMD(offer.date));
    const t = new Date();
    const [hh = 0, mm = 0] = (offer.time || "").split(":").map(Number);
    t.setHours(hh, mm, 0, 0);
    setPickedTime(t);
    setProposeModal(true);
  };

  const handleAccept = async (id) => {
    try {
      setActionLoadingId(id);
      await bookingService.acceptBooking(id);
      setSuccess("Booking accepted.");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (id) => {
    try {
      setActionLoadingId(id);
      await bookingService.declineBooking(id);
      setSuccess("Booking declined.");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmPropose = async () => {
    try {
      setActionLoadingId(selectedBooking.id);
      await bookingService.proposeReschedule(
        selectedBooking.id,
        formatLocalDate(pickedDate),
        formatLocalTime(pickedTime)
      );
      setProposeModal(false);
      setSuccess("New time proposed.");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <ThemedView safe style={styles.center}>
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
        <ThemedText style={styles.headerTitle}>Provider Requests</ThemedText>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={actionable}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => {
        const imageSource = item.job?.image
          ? { uri: item.job.image }
          : getCategoryIcon(item.job?.category?.icon);

        return (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Image source={imageSource} style={styles.image} />

              <View style={{ flex: 1 }}>
                <ThemedText title numberOfLines={1}>
                  {item.job?.name || "Service"}
                </ThemedText>

                <ThemedText style={styles.muted}>
                  {item.currentOffer?.date} • {item.currentOffer?.time}
                </ThemedText>
              </View>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => handleDecline(item.id)}
                style={styles.outlineBtn}
              >
                <ThemedText>Decline</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openPropose(item)}
                style={styles.outlineBtn}
              >
                <ThemedText>Propose</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleAccept(item.id)}
                style={styles.primaryBtn(theme)}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
                  Accept
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
      />

      <Modal visible={proposeModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox(theme)}>
            <ThemedText title>Propose new date & time</ThemedText>

            <TouchableOpacity onPress={() => setShowDate(true)}>
              <ThemedText>Date: {formatLocalDate(pickedDate)}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowTime(true)}>
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
                onChange={(_, d) => {
                  setShowTime(false);
                  if (d) setPickedTime(d);
                }}
              />
            )}

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setProposeModal(false)}
                style={styles.outlineBtn}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmPropose}
                style={styles.primaryBtn(theme)}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
                  Send
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ErrorModal
        visible={!!error}
        title="Error"
        message={error}
        onClose={() => setError(null)}
      />

      <SuccessModal
        visible={!!success}
        title="Success"
        message={success}
        onClose={() => setSuccess(null)}
      />

      <NavBar />
    </ThemedView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    card: {
      margin: 12,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardBackground,
    },
    muted: { color: theme.mutedText, marginTop: 4 },
    row: { flexDirection: "row", gap: 8, marginTop: 12 },
    outlineBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    primaryBtn: (theme) => ({
      flex: 1,
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.primary,
      alignItems: "center",
    }),
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalBox: (theme) => ({
      backgroundColor: theme.cardBackground,
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    }),
    cardRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

image: {
  width: 60,
  height: 60,
  borderRadius: 12,
  backgroundColor: theme.cardBackground,
},

  });
