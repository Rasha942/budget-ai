import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Paper, Stamp, Perforation, Button, Field, Icon } from "../components/receipt";
import { colors, fonts } from "../theme/receipt";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function WorkspaceSetupScreen({ user, token, onWorkspaceReady }) {
  const [mode, setMode] = useState(null);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const firstName = user?.userName || user?.name?.split(" ")[0] || "";

  async function handleCreate() {
    if (!name) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${SERVER}/workspace/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      onWorkspaceReady(data.workspaceId);
    } catch (err) {
      setError("שגיאה ביצירת סביבה");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!inviteCode) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${SERVER}/workspace/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      onWorkspaceReady(data.workspaceId);
    } catch (err) {
      setError(err.message || "קוד הזמנה שגוי");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Paper tilt={-1.2} style={{ width: "100%" }}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Budget·AI</Text>
          <Stamp label="NEW · חדש" tone="ink" />
        </View>
        <Perforation />
        <Text style={styles.title}>ברוך הבא, {firstName}!</Text>
        <Text style={styles.sub}>צור סביבת עבודה או הצטרף עם קוד</Text>

        {!mode && (
          <>
            <Button label="צור סביבה חדשה" icon="plus" variant="gold" onPress={() => setMode("create")} style={{ marginTop: 16 }} />
            <Perforation />
            <Button label="הצטרף עם קוד הזמנה" icon="link" variant="ghost" onPress={() => setMode("join")} />
          </>
        )}

        {mode === "create" && (
          <>
            <Field label="שם הסביבה" value={name} onChangeText={setName} placeholder="למשל: רז ונועה" />
            {loading ? (
              <ActivityIndicator color={colors.ink} style={{ marginTop: 14 }} />
            ) : (
              <Button label="צור" variant="gold" onPress={handleCreate} style={{ marginTop: 14 }} />
            )}
            <BackLink onPress={() => setMode(null)} />
          </>
        )}

        {mode === "join" && (
          <>
            <Field
              label="קוד הזמנה"
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="הכנס קוד הזמנה"
              autoCapitalize="characters"
            />
            {loading ? (
              <ActivityIndicator color={colors.ink} style={{ marginTop: 14 }} />
            ) : (
              <Button label="הצטרף" variant="primary" onPress={handleJoin} style={{ marginTop: 14 }} />
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
  brand: { fontFamily: fonts.handLat, fontSize: 22, color: colors.ink },
  title: { fontFamily: fonts.handHe, fontSize: 28, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.sub, marginTop: 4 },
  back: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 12 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.red, textAlign: "center", marginTop: 14 },
});
