import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { linkEmailPassword } from "../auth";
import { Paper, Stamp, Perforation, Button, Field } from "../components/receipt";
import { colors, fonts } from "../theme/receipt";

export default function SetPasswordScreen({ onPasswordSet, user }) {
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSetPassword() {
    if (!password || !confirmPassword || !userName) return;
    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await linkEmailPassword(user.email, password);
      onPasswordSet(userName);
    } catch (e) {
      setError("שגיאה בהגדרת סיסמא");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Paper style={{ width: "100%" }}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Account</Text>
          <Stamp label="SECURE" tone="red" />
        </View>
        <Perforation />
        <Text style={styles.title}>הגדר סיסמא ושם</Text>
        <Text style={styles.sub}>כדי שתוכל להתחבר גם בלי Google</Text>

        <Field label="שם משתמש" value={userName} onChangeText={setUserName} placeholder="שם משתמש" />
        <Field label="סיסמא" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry inputStyle={{ textAlign: "left" }} />
        <Field label="אימות סיסמא" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" secureTextEntry inputStyle={{ textAlign: "left" }} />

        {loading ? (
          <ActivityIndicator color={colors.ink} style={{ marginTop: 16 }} />
        ) : (
          <Button label="שמור והמשך" variant="primary" onPress={handleSetPassword} style={{ marginTop: 16 }} />
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Paper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground, justifyContent: "center", padding: 24 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontFamily: fonts.handLat, fontSize: 22, color: colors.ink },
  title: { fontFamily: fonts.handHe, fontSize: 28, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.sub, marginTop: 4 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.red, textAlign: "center", marginTop: 14 },
});
