import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { groupByMonth } from "../utils";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function HistoryScreen({ token, workspaceId }) {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [loading, setLoading] = useState(true);

  const sections =
    transactions.length > 0
      ? Object.entries(groupByMonth(transactions)).map(([title, data]) => ({
          title,
          data,
        }))
      : [];
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

  function handleUpdate(transaction) {
    setEditingId(transaction.id);
    setEditedFields(transaction);
  }

  async function handleUpdateSave() {
    try {
      await fetch(
        `${SERVER}/transaction/${editingId}?workspaceId=${workspaceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedFields),
        },
      );
      setTransactions(
        transactions.map((t) => (t.id === editingId ? editedFields : t)),
      );
      setEditingId(null);
      setEditedFields({});
    } catch (error) {
      console.error("Update transaction error:", error);
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
      <SectionList
        sections={sections}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.id === editingId ? (
              <>
                <Text style={styles.fieldLabel}>תיאור</Text>
                <TextInput
                  style={styles.input}
                  value={editedFields.description}
                  onChangeText={(text) =>
                    setEditedFields({ ...editedFields, description: text })
                  }
                  placeholderTextColor="#6a7a8a"
                />
                <Text style={styles.fieldLabel}>קטגוריה</Text>
                <TextInput
                  style={styles.input}
                  value={editedFields.category}
                  onChangeText={(text) =>
                    setEditedFields({ ...editedFields, category: text })
                  }
                  placeholderTextColor="#6a7a8a"
                />
                <Text style={styles.fieldLabel}>סכום</Text>
                <TextInput
                  style={styles.input}
                  value={String(editedFields.amount)}
                  onChangeText={(text) =>
                    setEditedFields({ ...editedFields, amount: text })
                  }
                  placeholderTextColor="#6a7a8a"
                  keyboardType="numeric"
                />
                <Text style={styles.fieldLabel}>תאריך</Text>
                <TextInput
                  style={styles.input}
                  value={editedFields.date}
                  onChangeText={(text) =>
                    setEditedFields({ ...editedFields, date: text })
                  }
                  placeholderTextColor="#6a7a8a"
                />
                <View style={styles.cardFooter}>
                  <TouchableOpacity onPress={handleUpdateSave}>
                    <Text style={styles.save}>💾 שמור</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingId(null)}>
                    <Text style={styles.cancel}>ביטול</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
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
                  <TouchableOpacity onPress={() => handleUpdate(item)}>
                    <Text style={styles.edit}>✏️ עריכה</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  sectionHeader: {
    color: "#00e5a0",
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 8,
    backgroundColor: "#080c10",
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
  edit: { color: "#4da8ff", fontSize: 12 },
  save: { color: "#00e5a0", fontSize: 12, fontWeight: "bold" },
  cancel: { color: "#6a7a8a", fontSize: 12 },
  fieldLabel: { color: "#6a7a8a", fontSize: 11, marginBottom: 2 },
  input: {
    backgroundColor: "#080c10",
    color: "#eaf0f8",
    borderColor: "#1e2832",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  empty: {
    color: "#6a7a8a",
    textAlign: "center",
    marginTop: 48,
    fontSize: 16,
  },
});
