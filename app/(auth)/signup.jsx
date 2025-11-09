import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { safeRouter } from "../../utils/SafeRouter";
import { registerUser } from '../../services/userService';

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [customError, setCustomError] = useState("");

  const handleSignUp = async () => {
    if (!name || !username || !email || !pwd) {
      setCustomError("Please fill all fields");
      return;
    }

    try {
      const user = await registerUser(name, username, email, pwd);
      console.log('Registered user:', user.uid);
    } catch (error) {
      setCustomError(error.customMessage);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.blueBg} />

      <TouchableOpacity
        onPress={() => safeRouter.replace('/')}
        activeOpacity={0.8}
        style={[styles.backBtn, { top: insets.top + 8, alignItems: "center", justifyContent: "center" }]}
      >
        <ChevronLeft size={26} color="#3595FF" />
      </TouchableOpacity>

      <View style={styles.topTitleWrap}>
        <Text style={styles.topTitle}>Service Finder</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/hero.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.title}>Create your account</Text>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#e1e5ea"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#e1e5ea"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#e1e5ea"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.field, { position: "relative" }]}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#e4e8ed"
              value={pwd}
              onChangeText={setPwd}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eye} onPress={() => setShowPwd(!showPwd)}>
              {showPwd ? <Eye size={20} color="#6B8ECC" /> : <EyeOff size={20} color="#6B8ECC" />}
            </TouchableOpacity>
          </View>

          {customError.length > 0 && <Text style={styles.errorTxt}>{customError}</Text>}

          <TouchableOpacity activeOpacity={0.85} onPress={handleSignUp} style={styles.primaryBtn}>
            <Text style={styles.primaryTxt}>Register</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomTxt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => safeRouter.replace("/login")}>
              <Text style={styles.bottomLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#3595FF" },
  blueBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#3595FF" },

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
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  header: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 20,
  },
  icon: {
    width: 150,
    height: 160,
    position: "absolute",
    top: -60,
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 110,
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

  bottomTxt: { color: "#fff" },
  bottomLink: { color: "#fff", fontWeight: "700" },

  backBtn: {
    position: "absolute",
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    zIndex: 5,
    overflow: "hidden",
  },

  errorTxt: {
    color: "#ff4d4f",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: -10,
  },
});
