import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function WorkspaceSetupScreen({
  user,
  token,
  onWorkspaceReady,
}) {
  const [mode, setMode] = useState(null);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${SERVER}/workspace/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      <Text style={styles.title}>
        ברוך הבא, {user?.userName || user?.name?.split(" ")[0]}!
      </Text>
      <Text style={styles.subtitle}>צור סביבת עבודה חדשה או הצטרף לקיימת</Text>

      {!mode && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setMode("create")}
          >
            <Text style={styles.buttonText}>➕ צור סביבה חדשה</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => setMode("join")}
          >
            <Text style={styles.outlineButtonText}>🔗 הצטרף עם קוד הזמנה</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "create" && (
        <View style={styles.form}>
          <Text style={styles.label}>שם הסביבה</Text>
          <TextInput
            style={styles.input}
            placeholder="למשל: רז ונועה"
            placeholderTextColor="#6a7a8a"
            value={name}
            onChangeText={setName}
          />
          {loading ? (
            <ActivityIndicator color="#00e5a0" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleCreate}>
              <Text style={styles.buttonText}>צור</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setMode(null)}>
            <Text style={styles.back}>← חזור</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "join" && (
        <View style={styles.form}>
          <Text style={styles.label}>קוד הזמנה</Text>
          <TextInput
            style={styles.input}
            placeholder="הכנס קוד הזמנה"
            placeholderTextColor="#6a7a8a"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
          {loading ? (
            <ActivityIndicator color="#00e5a0" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleJoin}>
              <Text style={styles.buttonText}>הצטרף</Text>
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
    marginBottom: 48,
    fontSize: 14,
  },
  buttonGroup: { gap: 16 },
  button: {
    backgroundColor: "#00e5a0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#080c10", fontSize: 16, fontWeight: "bold" },
  outlineButton: {
    borderColor: "#00e5a0",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButtonText: { color: "#00e5a0", fontSize: 16, fontWeight: "bold" },
  form: { gap: 12 },
  label: { color: "#eaf0f8", fontSize: 14, marginBottom: 4 },
  input: {
    backgroundColor: "#0e1318",
    color: "#eaf0f8",
    borderColor: "#1e2832",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  back: { color: "#6a7a8a", textAlign: "center", marginTop: 8 },
  error: { color: "#ff6b6b", textAlign: "center", marginTop: 16 },
});
