import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  signInWithEmail,
  registerWithEmail,
  signInWithGoogleAndroid,
} from "../auth";
import { AntDesign } from "@expo/vector-icons";

export default function LoginScreen({ request, promptAsync, onSignIn }) {
  const [mode, setMode] = useState(null);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSignIn() {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await onSignIn(await signInWithEmail(email, password));
    } catch (error) {
      console.error("Sign in error:", error);
      setError("אימייל או סיסמא שגויים");
    } finally {
      setLoading(false);
    }
  }
  async function handleEmailRegister() {
    if (!email || !password || !userName) return;
    setLoading(true);
    setError("");
    try {
      await onSignIn(await registerWithEmail(email, password), false, userName);
    } catch (error) {
      console.error("Sign in error:", error);
      setError("שגיאת רישום");
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💰</Text>
      <Text style={styles.title}>AI Budget Manager</Text>
      <Text style={styles.subtitle}>נהל את ההוצאות שלך בעברית</Text>
      {!mode && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              if (Platform.OS === "android") {
                setLoading(true);
                setError("");
                try {
                  const token = await signInWithGoogleAndroid();
                  await onSignIn(token, true);
                } catch (err) {
                  setError("שגיאה: " + err.message);
                } finally {
                  setLoading(false);
                }
              } else {
                promptAsync();
              }
            }}
            disabled={Platform.OS !== "android" && !request}
          >
            <Text style={styles.buttonText}> התחבר עם Google</Text>
            <AntDesign name="google" size={20} color="#080c10" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setMode("signin")}
          >
            <Text style={styles.buttonText}>התחבר עם אימייל</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => setMode("register")}
          >
            <Text style={styles.outlineButtonText}>הרשם</Text>
          </TouchableOpacity>
        </View>
      )}
      {mode === "signin" && (
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email"
            placeholderTextColor="#6a7a8a"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>סיסמא</Text>
          <TextInput
            style={styles.input}
            placeholder="password"
            placeholderTextColor="#6a7a8a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator color="#00e5a0" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleEmailSignIn}>
              <Text style={styles.buttonText}>התחבר</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setMode(null)}>
            <Text style={styles.back}>← חזור</Text>
          </TouchableOpacity>
        </View>
      )}
      {mode === "register" && (
        <View style={styles.form}>
          <Text style={styles.label}>שם משתמש</Text>
          <TextInput
            style={styles.input}
            placeholder="שם משתמש"
            placeholderTextColor="#6a7a8a"
            value={userName}
            onChangeText={setUserName}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email"
            placeholderTextColor="#6a7a8a"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>סיסמא</Text>
          <TextInput
            style={styles.input}
            placeholder="password"
            placeholderTextColor="#6a7a8a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator color="#00e5a0" />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleEmailRegister}
            >
              <Text style={styles.buttonText}>הרשם</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setMode(null)}>
            <Text style={styles.back}>← חזור</Text>
          </TouchableOpacity>
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c10",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00e5a0",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6a7a8a",
    fontSize: 16,
    marginBottom: 48,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00e5a0",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 0,
  },
  buttonText: { color: "#080c10", fontSize: 16, fontWeight: "bold" },
  buttonGroup: { width: "100%", gap: 16 },
  outlineButton: {
    borderColor: "#00e5a0",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  outlineButtonText: { color: "#00e5a0", fontSize: 16, fontWeight: "bold" },
  form: { width: "100%", gap: 12 },
  label: { color: "#eaf0f8", fontSize: 14 },
  input: {
    backgroundColor: "#0e1318",
    color: "#eaf0f8",
    borderColor: "#1e2832",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    width: "100%",
  },
  back: { color: "#6a7a8a", textAlign: "center", marginTop: 8 },
  error: { color: "#ff6b6b", textAlign: "center", marginTop: 16 },
});
