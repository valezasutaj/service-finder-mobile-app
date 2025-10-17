import React, { useState } from "react";
import {View,Text,StyleSheet,Image,TouchableOpacity,TextInput,Dimensions,Platform,} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");


const ICON_W = width * 0.65;         
const ICON_H = ICON_W * 0.9;         
const ICON_TOP = 110;              
const OVERLAP = 26;                 
const CONTENT_TOP_SPACER = ICON_TOP + ICON_H - OVERLAP;

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  const onLogin = () => {
    console.log({ username, pwd, remember });
  };

  return (
    <SafeAreaView style={styles.screen}>
    
      <View style={styles.blueBg} />
 
      <View style={styles.topTitleWrap}>
        <Text style={styles.topTitle}>Service Finder</Text>
      </View>

      <View pointerEvents="none" style={styles.iconLayer}>
        <Image
          source={require("../assets/hero.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

    
      <View style={{ height: CONTENT_TOP_SPACER }} />

     
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back !</Text>

   
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
            <Ionicons
              name={showPwd ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#6B8ECC"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity onPress={() => setRemember(!remember)} style={styles.remember}>
            <View style={[styles.circle, remember && styles.circleOn]}>
              {remember ? <View style={styles.circleDot} /> : null}
            </View>
            <Text style={styles.rememberTxt}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgot}>Forget password?</Text>
          </TouchableOpacity>
        </View>

      
        <TouchableOpacity activeOpacity={0.8} onPress={onLogin} style={styles.loginBtn}>
          <Text style={styles.loginTxt}>Login</Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupTxt}>New user?</Text>
          <TouchableOpacity onPress={() => navigation?.navigate?.("Register")}>
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
    letterSpacing: 1,
    fontStyle: "italic",
  },

  iconLayer: {
    position: "absolute",
    top: 110,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2, 
  },

  icon: { width: ICON_W, height: ICON_H },

  content: {
    alignSelf: "center",
    width: "88%",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
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
  eye: { position: "absolute", right: 18, height: "100%", justifyContent: "center" },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  remember: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: 18, 
    height: 18, 
    borderRadius: 9,
    borderWidth: 1.5, borderColor: "#fff",
    marginRight: 8, alignItems: "center", justifyContent: "center",
  },
  circleOn: { borderColor: "#fff" },
  circleDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#fff" },
  rememberTxt: { color: "#fff", fontSize: 13 },
  forgot: { color: "#fff", fontSize: 13 },

  loginBtn: {
    backgroundColor: "#fff",
    borderRadius: 28,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  loginTxt: { color: "#3595FF", fontSize: 16, fontWeight: "700" },

  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  signupTxt: { color: "#fff" },
  signupLink: { color: "#fff", fontWeight: "700" },
});
