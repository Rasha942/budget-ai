import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { registerWithEmail } from "../auth";

export default function SetPasswordScreen({ onPasswordSet, user }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSetPassword() {
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const firebasIdToken = await registerWithEmail(user.email, password);
      onPasswordSet();
    } catch (error) {
      setError("שגיאה בהגדרת סיסמא");
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>הגדר סיסמא</Text>
      <Text style={styles.subtitle}>צעד זה נחוץ על מנת להתחבר ללא Google</Text>
      <TextInput
        style={styles.input}
        placeholder="סיסמא"
        placeholderTextColor="#6a7a8a"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="אמת סיסמא"
        placeholderTextColor="#6a7a8a"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator color="#00e5a0" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSetPassword}>
          <Text style={styles.buttonText}>התחבר</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#00e5a0",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6a7a8a",
    textAlign: "center",
    marginBottom: 32,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#0e1318",
    color: "#eaf0f8",
    borderColor: "#1e2832",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#00e5a0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#080c10", fontSize: 16, fontWeight: "bold" },
  error: { color: "#ff6b6b", textAlign: "center", marginTop: 16 },
});
