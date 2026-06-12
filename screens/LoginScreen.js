import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { signInWithEmail, registerWithEmail, signInWithGoogleAndroid } from "../auth";
import { Paper, Stamp, Perforation, Button, Field, Icon } from "../components/receipt";
import { colors, fonts } from "../theme/receipt";

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
    } catch (e) {
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
    } catch (e) {
      setError("שגיאת רישום");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (Platform.OS === "android") {
      setLoading(true);
      setError("");
      try {
        const tk = await signInWithGoogleAndroid();
        await onSignIn(tk, true);
      } catch (err) {
        setError("שגיאה: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      promptAsync();
    }
  }

  return (
    <View style={styles.container}>
      <Paper tilt={-1.4} style={{ width: "100%" }}>
        <View style={styles.brandRow}>
          <Icon name="receipt" size={30} color={colors.ink} />
          <Stamp label="HELLO" tone="ink" />
        </View>
        <Text style={styles.wordmark}>Budget·AI</Text>
        <Text style={styles.tagline}>נהל הוצאות בעברית</Text>
        <Text style={styles.sub}>כתוב מה הוצאת — וזה מסתדר לבד</Text>
        <Perforation />

        {!mode && (
          <>
            <Button label="התחבר עם Google" icon="google" variant="gold" onPress={handleGoogle} disabled={Platform.OS !== "android" && !request} />
            <Button label="התחבר עם אימייל" variant="primary" onPress={() => setMode("signin")} style={{ marginTop: 10 }} />
            <Button label="הרשמה" variant="ghost" onPress={() => setMode("register")} style={{ marginTop: 10 }} />
          </>
        )}

        {mode === "signin" && (
          <>
            <Field label="אימייל" value={email} onChangeText={setEmail} placeholder="email" autoCapitalize="none" inputStyle={{ textAlign: "left" }} />
            <Field label="סיסמא" value={password} onChangeText={setPassword} placeholder="password" secureTextEntry inputStyle={{ textAlign: "left" }} />
            {loading ? (
              <ActivityIndicator color={colors.ink} style={{ marginTop: 14 }} />
            ) : (
              <Button label="התחבר" variant="primary" onPress={handleEmailSignIn} style={{ marginTop: 14 }} />
            )}
            <BackLink onPress={() => setMode(null)} />
          </>
        )}

        {mode === "register" && (
          <>
            <Field label="שם משתמש" value={userName} onChangeText={setUserName} placeholder="שם משתמש" />
            <Field label="אימייל" value={email} onChangeText={setEmail} placeholder="email" autoCapitalize="none" inputStyle={{ textAlign: "left" }} />
            <Field label="סיסמא" value={password} onChangeText={setPassword} placeholder="password" secureTextEntry inputStyle={{ textAlign: "left" }} />
            {loading ? (
              <ActivityIndicator color={colors.ink} style={{ marginTop: 14 }} />
            ) : (
              <Button label="הרשם" variant="primary" onPress={handleEmailRegister} style={{ marginTop: 14 }} />
            )}
            <BackLink onPress={() => setMode(null)} />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Paper>
    </View>
  );
}

function BackLink({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.back}>← חזור</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground, justifyContent: "center", padding: 24 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { fontFamily: fonts.handLat, fontSize: 34, color: colors.ink, marginTop: 10 },
  tagline: { fontFamily: fonts.handHe, fontSize: 26, color: colors.text, marginTop: 4 },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.sub, marginTop: 4 },
  back: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 12 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.red, textAlign: "center", marginTop: 14 },
});
