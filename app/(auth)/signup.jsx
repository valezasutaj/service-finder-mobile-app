import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { safeRouter } from "../../utils/SafeRouter";
import { registerUser } from "../../services/userService";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [customError, setCustomError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const insets = useSafeAreaInsets();

  const handleSignUp = async () => {
    setCustomError("");
    setIsLoading(true);

    if (!name || !username || !email || !pwd) {
      setCustomError("Please fill all fields");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setCustomError("Please enter a valid email");
      setIsLoading(false);
      return;
    }

    if (pwd.length < 6) {
      setCustomError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await registerUser(name, username, email, pwd);
      Alert.alert("Success", "Account created successfully!");
      safeRouter.replace("/login");
    } catch (error) {
      setCustomError(error.customMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity
        onPress={() => safeRouter.replace("/")}
        style={[styles.backBtn, { top: insets.top + 8 }]}
        disabled={isLoading}
      >
        <ChevronLeft size={26} color="#3595FF" />
      </TouchableOpacity>

      <View style={styles.topTitleWrap}>
        <Text style={styles.topTitle}>Service Finder</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Image
            source={require("../../assets/hero.png")}
            style={styles.icon}
            resizeMode="contain"
          />

          <Text style={styles.title}>Create your account</Text>

          <View style={styles.field}>
            <TextInput
              placeholder="Full name"
              placeholderTextColor="#e1e5ea"
              style={styles.input}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          <View style={styles.field}>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#e1e5ea"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.field}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#e1e5ea"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={[styles.field, { position: "relative" }]}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#e1e5ea"
              style={styles.input}
              value={pwd}
              secureTextEntry={!showPwd}
              onChangeText={setPwd}
              autoCapitalize="none"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={styles.eye}
              onPress={() => setShowPwd(!showPwd)}
              disabled={isLoading}
            >
              {showPwd ? <Eye size={20} color="#6B8ECC" /> : <EyeOff size={20} color="#6B8ECC" />}
            </TouchableOpacity>
          </View>

          {customError ? (
            <Text style={styles.errorTxt}>{customError}</Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSignUp}
            style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#3595FF" />
            ) : (
              <Text style={styles.primaryTxt}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomTxt}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => safeRouter.replace("/login")}
              disabled={isLoading}
            >
              <Text style={styles.bottomLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#3595FF"
  },
  topTitleWrap: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },
  topTitle: {
    color: "#fff",
    fontSize: 44,
    fontWeight: "800",
    fontStyle: "italic",
    marginTop: 50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  card: {
    alignSelf: "center",
    width: "88%",
    marginTop: 200,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    elevation: 6,
  },
  icon: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginVertical: -80,
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 80,
    marginBottom: 15,
  },
  field: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 18,
    justifyContent: "center",
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
  },
  eye: {
    position: "absolute",
    right: 18,
    height: "100%",
    justifyContent: "center",
  },
  primaryBtn: {
    backgroundColor: "#fff",
    borderRadius: 28,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryTxt: {
    color: "#3595FF",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  bottomTxt: {
    color: "#fff"
  },
  bottomLink: {
    color: "#fff",
    fontWeight: "700"
  },
  backBtn: {
    position: "absolute",
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  errorTxt: {
    color: "#ff4d4f",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});