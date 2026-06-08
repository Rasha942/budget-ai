import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function HistoryScreen({ token, workspaceId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, []),
  );

  async function fetchTransactions() {
    try {
      const response = await fetch(
        `${SERVER}/transactions?workspaceId=${workspaceId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTransaction(id) {
    try {
      await fetch(`${SERVER}/transaction/${id}?workspaceId=${workspaceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }

  if (loading)
    return (
      <ActivityIndicator style={styles.loader} color="#00e5a0" size="large" />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 היסטוריה</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.amount}>{item.amount} ₪</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.date}>{item.date}</Text>
              <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                <Text style={styles.delete}>🗑️ מחק</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>אין עסקאות עדיין</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c10",
    padding: 24,
    paddingTop: 60,
  },
  loader: { flex: 1, backgroundColor: "#080c10" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00e5a0",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#0e1318",
    borderColor: "#1e2832",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  category: { color: "#00e5a0", fontWeight: "bold", fontSize: 13 },
  amount: { color: "#eaf0f8", fontWeight: "bold", fontSize: 15 },
  description: { color: "#eaf0f8", fontSize: 14, marginBottom: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  date: { color: "#6a7a8a", fontSize: 12 },
  delete: { color: "#ff6b6b", fontSize: 12 },
  empty: { color: "#6a7a8a", textAlign: "center", marginTop: 48, fontSize: 16 },
});
