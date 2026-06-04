import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

export default function App() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("מה הוצאת היום?");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchPlaceholder();
  }, []);

  async function fetchPlaceholder() {
    const response = await fetch(
      "https://budget-ai-production-1c70.up.railway.app/placeholder",
    );
    const data = await response.json();
    setPlaceholder(data.placeholder);
  }

  async function handleSubmit() {
    if (!input) return;

    setLoading(true);
    setStatus("");
    setTransaction(null);

    try {
      const response = await fetch(
        "https://budget-ai-production-1c70.up.railway.app/transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        },
      );
      const data = await response.json();
      setTransaction(data.transaction);
      setStatus("✅ נשמר בהצלחה");
      setInput("");
    } catch (error) {
      setStatus("❌ שגיאה, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    const response = await fetch(
      "https://budget-ai-production-1c70.up.railway.app/summary",
    );
    const data = await response.json();
    setSummary(data);
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
          {/* Title */}
          <Text style={styles.title}>💰 AI Budget Manager</Text>

          <TouchableOpacity
            onPress={async () => {
              const appURL =
                "googlesheets://spreadsheets/d/178wlPrfvbr8ZE25PcnZFdBTn1CsfIwr7LUduTqsIA4U";
              const webURL =
                "https://docs.google.com/spreadsheets/d/178wlPrfvbr8ZE25PcnZFdBTn1CsfIwr7LUduTqsIA4U";
              const canOpen = await Linking.canOpenURL(appURL);
              Linking.openURL(canOpen ? appURL : webURL);
            }}
          >
            <Text style={styles.sheetLink}>📋 פתח גיליון</Text>
          </TouchableOpacity>

          {/* Input */}
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#6a7a8a"
            value={input}
            onChangeText={setInput}
            multiline
          />

          {/* Submit button or spinner */}
          {loading ? (
            <ActivityIndicator size="large" color="#00e5a0" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>שמור</Text>
            </TouchableOpacity>
          )}

          {/* Summary button */}
          <TouchableOpacity style={styles.summaryButton} onPress={fetchSummary}>
            <Text style={styles.summaryButtonText}>📊 הצג סיכום חודשי</Text>
          </TouchableOpacity>

          {/* Status message */}
          {status ? <Text style={styles.status}>{status}</Text> : null}

          {/* Transaction confirmation card */}
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

          {/* Summary card */}
          {summary && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 סיכום הוצאות</Text>
              {Object.entries(summary.summary).map(([category, amount]) => (
                <Text key={category} style={styles.cardText}>
                  {category}: {amount.toFixed(2)} ₪
                </Text>
              ))}
              <Text style={styles.cardTitle}>
                סה״כ: {summary.total.toFixed(2)} ₪
              </Text>
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
    marginBottom: 32,
    textAlign: "center",
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
  buttonText: {
    color: "#080c10",
    fontSize: 16,
    fontWeight: "bold",
  },
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
  cardText: {
    color: "#eaf0f8",
    fontSize: 14,
  },
  sheetLink: {
    color: "#4da8ff",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  summaryButton: {
    backgroundColor: "#1e2832",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    borderColor: "#00e5a0",
    borderWidth: 1,
  },
  summaryButtonText: {
    color: "#00e5a0",
    fontSize: 16,
    fontWeight: "bold",
  },
});
