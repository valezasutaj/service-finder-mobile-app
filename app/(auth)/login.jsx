import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { safeRouter } from "../../utils/SafeRouter";
import { loginUser } from "../../services/userService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [customError, setCustomError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    setCustomError("");
    setIsLoading(true);

    if (!email || !pwd) {
      setCustomError("Please enter email and password");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setCustomError("Please enter a valid email");
      setIsLoading(false);
      return;
    }

    try {
      await loginUser(email, pwd);
      safeRouter.replace("/home");
    } catch (error) {
      setCustomError(error.customMessage || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.blueBg} />

      <TouchableOpacity
        onPress={() => safeRouter.replace("/")}
        activeOpacity={0.8}
        style={[styles.backBtn, { top: insets.top + 8 }]}
        disabled={isLoading}
      >
        <ChevronLeft size={26} color="#3595FF" />
      </TouchableOpacity>

      <View style={styles.topTitleWrap}>
        <Text style={styles.topTitle}>Service Finder</Text>
      </View>

      <View pointerEvents="none" style={styles.iconLayer}>
        <Image
          source={require("../../assets/hero.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <View style={{ height: 320 }} />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back!</Text>

        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#e1e5ea"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        <View style={[styles.field, { position: "relative" }]}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#e4e8ed"
            secureTextEntry={!showPwd}
            value={pwd}
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
          activeOpacity={0.8}
          onPress={handleLogin}
          style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#3595FF" />
          ) : (
            <Text style={styles.loginTxt}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupTxt}>New user?</Text>
          <TouchableOpacity
            onPress={() => safeRouter.replace("/signup")}
            disabled={isLoading}
          >
            <Text style={styles.signupLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#3595FF" },
  blueBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#3595FF" },
  topTitleWrap: {
    position: "absolute",
    top: 100,
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
  },
  iconLayer: {
    position: "absolute",
    top: 95,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  icon: { width: 260, height: 260 },
  content: {
    alignSelf: "center",
    width: "88%",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 14,
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
    letterSpacing: 0.3,
  },
  eye: {
    position: "absolute",
    right: 18,
    height: "100%",
    justifyContent: "center"
  },
  loginBtn: {
    backgroundColor: "#fff",
    borderRadius: 28,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginTxt: {
    color: "#3595FF",
    fontSize: 16,
    fontWeight: "700"
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  signupTxt: {
    color: "#fff"
  },
  signupLink: {
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
    marginBottom: -10,
  },
});