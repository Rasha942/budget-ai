import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Platform,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Icon, iconForCategory, Field, Button } from "../components/receipt";
import { colors, fonts } from "../theme/receipt";
import { groupByMonth } from "../utils";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function HistoryScreen({ token, workspaceId }) {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [loading, setLoading] = useState(true);

  const sections =
    transactions.length > 0
      ? Object.entries(groupByMonth(transactions)).map(([title, data]) => ({ title, data }))
      : [];

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [workspaceId]),
  );

  async function fetchTransactions() {
    try {
      const response = await fetch(`${SERVER}/transactions?workspaceId=${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id);
    setEditedFields(transaction);
  }

  async function handleSave() {
    try {
      await fetch(`${SERVER}/transaction/${editingId}?workspaceId=${workspaceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editedFields),
      });
      setTransactions(transactions.map((t) => (t.id === editingId ? editedFields : t)));
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

  function confirmDelete(id) {
    if (Platform.OS === "web") {
      if (window.confirm("האם אתה בטוח שברצונך למחוק?")) deleteTransaction(id);
    } else {
      Alert.alert("מחק עסקה", "האם אתה בטוח?", [
        { text: "ביטול", style: "cancel" },
        { text: "מחק", style: "destructive", onPress: () => deleteTransaction(id) },
      ]);
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.ink} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>היסטוריה</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item, i) => item.id || String(i)}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) =>
          item.id === editingId ? (
            <View style={styles.card}>
              <Field
                label="תיאור"
                value={editedFields.description}
                onChangeText={(text) => setEditedFields({ ...editedFields, description: text })}
                style={{ marginTop: 0 }}
              />
              <Field
                label="קטגוריה"
                value={editedFields.category}
                onChangeText={(text) => setEditedFields({ ...editedFields, category: text })}
              />
              <Field
                label="סכום"
                value={String(editedFields.amount)}
                keyboardType="numeric"
                onChangeText={(text) => setEditedFields({ ...editedFields, amount: text })}
              />
              <Field
                label="תאריך"
                value={editedFields.date}
                onChangeText={(text) => setEditedFields({ ...editedFields, date: text })}
              />
              <View style={styles.editActions}>
                <Button label="שמור" icon="save" variant="gold" onPress={handleSave} style={{ flex: 1 }} />
                <Button label="ביטול" variant="ghost" onPress={() => setEditingId(null)} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.chip}>
                  <Icon name={iconForCategory(item.category)} size={18} color={colors.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
                <Text style={styles.amount}>{item.amount} ₪</Text>
              </View>
              <View style={styles.footer}>
                <Text style={styles.by}>
                  {item.date} · נוסף ע״י {item.addedBy}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.action} onPress={() => handleEdit(item)}>
                    <Icon name="pencil" size={14} color={colors.ink} />
                    <Text style={styles.actionEdit}>עריכה</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.action} onPress={() => confirmDelete(item.id)}>
                    <Icon name="trash" size={14} color={colors.red} />
                    <Text style={styles.actionDelete}>מחק</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        }
        ListEmptyComponent={<Text style={styles.empty}>אין עסקאות עדיין</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground, padding: 20, paddingTop: 56 },
  loader: { flex: 1, backgroundColor: colors.ground, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.handHe, fontSize: 30, color: colors.text, marginBottom: 14 },
  sectionHeader: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.sub,
    marginTop: 14,
    marginBottom: 10,
    textAlign: "right",
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#3c2d14",
    shadowOpacity: 0.14,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#e8eef5",
    alignItems: "center",
    justifyContent: "center",
  },
  category: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.ink },
  description: { fontFamily: fonts.body, fontSize: 13.5, color: colors.text, marginTop: 1 },
  amount: { fontFamily: fonts.monoSemi, fontSize: 16, color: colors.text },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderStyle: "dotted",
    borderColor: "#ddd1b6",
  },
  by: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.muted },
  actions: { flexDirection: "row", gap: 12 },
  action: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionEdit: { fontFamily: fonts.body, fontSize: 11.5, color: colors.ink },
  actionDelete: { fontFamily: fonts.body, fontSize: 11.5, color: colors.red },
  editActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  empty: { fontFamily: fonts.body, fontSize: 16, color: colors.muted, textAlign: "center", marginTop: 48 },
});
