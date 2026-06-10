import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function HomeScreen({ token, workspaceId, user }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("מה הוצאת היום?");

  useEffect(() => {
    fetchPlaceholder();
  }, []);

  async function fetchPlaceholder() {
    const response = await fetch(`${SERVER}/placeholder`);
    const data = await response.json();
    setPlaceholder(data.placeholder);
  }

  async function handleSubmit() {
    if (!input) return;
    setLoading(true);
    setStatus("");
    setTransaction(null);

    try {
      const response = await fetch(`${SERVER}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input, workspaceId }),
      });
      const data = await response.json();

      if (data.type === "answer") {
        setStatus(data.message);
      } else {
        setTransaction(data.transaction);
        setStatus("✅ נשמר בהצלחה");
        if (data.anomaly) {
          setStatus(`✅ נשמר בהצלחה\n⚠️ ${data.anomaly}`);
        }
      }
      setInput("");
    } catch (error) {
      setStatus("❌ שגיאה, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>💰 AI Budget Manager</Text>
          <Text style={styles.greeting}>
            <Text style={styles.greeting}>
              שלום, {user?.userName || user?.name?.split(" ")[0]} 👋
            </Text>{" "}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#6a7a8a"
            value={input}
            onChangeText={setInput}
            multiline
          />

          {loading ? (
            <ActivityIndicator size="large" color="#00e5a0" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>שמור</Text>
            </TouchableOpacity>
          )}

          {status ? <Text style={styles.status}>{status}</Text> : null}

          {transaction && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✅ עסקה נשמרה</Text>
              <Text style={styles.cardText}>📝 {transaction.description}</Text>
              <Text style={styles.cardText}>🏷️ {transaction.category}</Text>
              <Text style={styles.cardText}>
                💵 {transaction.amount} {transaction.currency}
              </Text>
              <Text style={styles.cardText}>📅 {transaction.date}</Text>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c10",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00e5a0",
    marginBottom: 8,
    textAlign: "center",
  },
  greeting: {
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
    minHeight: 80,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#00e5a0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#080c10", fontSize: 16, fontWeight: "bold" },
  status: {
    color: "#eaf0f8",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#0e1318",
    borderColor: "#00e5a0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  cardTitle: {
    color: "#00e5a0",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  cardText: { color: "#eaf0f8", fontSize: 14 },
});
