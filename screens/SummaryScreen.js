import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function SummaryScreen({ token, workspaceId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, []),
  );
  async function fetchSummary() {
    setLoading(true);
    try {
      const response = await fetch(
        `${SERVER}/summary?workspaceId=${workspaceId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 סיכום חודשי</Text>

      <TouchableOpacity style={styles.button} onPress={fetchSummary}>
        <Text style={styles.buttonText}>טען סיכום</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator color="#00e5a0" style={{ marginTop: 32 }} />
      )}

      {summary && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>הוצאות לפי קטגוריה</Text>
          {Object.entries(summary.summary).map(([category, amount]) => (
            <View key={category} style={styles.row}>
              <Text style={styles.category}>{category}</Text>
              <Text style={styles.amount}>{amount.toFixed(2)} ₪</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.total}>סה״כ</Text>
            <Text style={styles.totalAmount}>{summary.total.toFixed(2)} ₪</Text>
          </View>
        </View>
      )}
    </ScrollView>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#00e5a0",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00e5a0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: { color: "#080c10", fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "#0e1318",
    borderColor: "#00e5a0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  cardTitle: {
    color: "#00e5a0",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  category: { color: "#eaf0f8", fontSize: 14 },
  amount: { color: "#eaf0f8", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#1e2832", marginVertical: 8 },
  total: { color: "#00e5a0", fontWeight: "bold", fontSize: 16 },
  totalAmount: { color: "#00e5a0", fontWeight: "bold", fontSize: 16 },
});
