import React, { useState, useEffect, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { Paper, Icon, Stamp, Perforation, LeaderLine, Barcode } from "../components/receipt";
import { colors, fonts, type } from "../theme/receipt";
import { getDefaultDates, filterByDateRange, formatAmount, currentMonthLabel } from "../utils";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

const monthStamp = currentMonthLabel;
const fmt = (n) => formatAmount(n, 2);

export default function HomeScreen({ token, workspaceId, user }) {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState(""); // AI replied with an answer, not a log
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [anomaly, setAnomaly] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placeholder, setPlaceholder] = useState("מה הוצאת היום?");

  const [transactions, setTransactions] = useState([]);
  const [loadingMonth, setLoadingMonth] = useState(true);

  const firstName = user?.userName || user?.name?.split(" ")[0] || "";

  // current-month rollup
  const { fromDate, toDate } = getDefaultDates();
  const monthTx = filterByDateRange(transactions, fromDate, toDate);
  const monthTotal = monthTx.reduce((s, t) => s + Number(t.amount || 0), 0);
  const byCategory = monthTx.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0);
    return acc;
  }, {});
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  useEffect(() => {
    fetchPlaceholder();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [workspaceId]),
  );

  async function fetchPlaceholder() {
    try {
      const response = await fetch(`${SERVER}/placeholder`);
      const data = await response.json();
      if (data.placeholder) setPlaceholder(data.placeholder);
    } catch {}
  }

  async function fetchTransactions() {
    try {
      const response = await fetch(`${SERVER}/transactions?workspaceId=${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch {
    } finally {
      setLoadingMonth(false);
    }
  }

  async function handleSubmit() {
    if (!input || submitting) return;
    Keyboard.dismiss();
    const text = input;
    setSubmitting(true);
    setAnswer("");
    setError("");
    setTransaction(null);
    setAnomaly("");

    try {
      const response = await fetch(`${SERVER}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, workspaceId }),
      });
      const data = await response.json();

      if (data.type === "answer") {
        setAnswer(data.message);
      } else {
        setTransaction(data.transaction);
        if (data.anomaly) setAnomaly(data.anomaly);
        fetchTransactions(); // refresh the month rollup
      }
      setInput("");
    } catch (e) {
      setError("שגיאה, נסה שוב");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* hero receipt — the month so far */}
          <Paper>
            <View style={styles.brandRow}>
              <Text style={styles.paperBrand}>Budget·AI</Text>
              <Stamp label={monthStamp()} tone="ink" />
            </View>
            <Perforation />
            <Text style={styles.greeting}>
              שלום, <Text style={styles.greetingName}>{firstName}</Text> — הנה החשבון שלך
            </Text>
            <Text style={styles.totalLabel}>הוצאת החודש</Text>
            {loadingMonth ? (
              <ActivityIndicator color={colors.ink} style={{ alignSelf: "flex-end", marginTop: 8 }} />
            ) : (
              <Text style={styles.total}>₪{fmt(monthTotal)}</Text>
            )}

            {topCategories.length > 0 ? (
              <View style={{ marginTop: 8 }}>
                {topCategories.map(([cat, amt]) => (
                  <LeaderLine key={cat} label={cat} value={fmt(amt)} />
                ))}
              </View>
            ) : !loadingMonth ? (
              <Text style={styles.emptyMonth}>עוד לא נרשמו הוצאות החודש</Text>
            ) : null}
            <Perforation />
          </Paper>

          {/* the ask bar */}
          <View style={styles.ask}>
            <TextInput
              style={styles.askInput}
              placeholder={placeholder}
              placeholderTextColor="#9fb4cd"
              value={input}
              onChangeText={setInput}
              multiline
              editable={!submitting}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.askGo, submitting && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Icon name="send" size={18} color={colors.ink} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* states */}
          {submitting && <PrintingReceipt text={input} />}

          {transaction && !submitting && (
            <SavedReceipt transaction={transaction} anomaly={anomaly} />
          )}

          {answer && !submitting && (
            <Paper flat style={styles.note} ruled={false}>
              <View style={styles.noteHead}>
                <Icon name="receipt" size={18} color={colors.ink} />
                <Text style={styles.noteTitle}>תשובה</Text>
              </View>
              <Text style={styles.noteBody}>{answer}</Text>
            </Paper>
          )}

          {error ? (
            <View style={styles.warn}>
              <Icon name="alert" size={18} color={colors.red} />
              <Text style={[styles.warnText, { color: colors.red }]}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function PrintingReceipt({ text }) {
  return (
    <Paper style={styles.block}>
      <View style={styles.brandRow}>
        <Text style={styles.paperBrand}>Budget·AI</Text>
        <Stamp label="…" tone="ink" rotate={-4} />
      </View>
      <Perforation />
      <View style={{ alignItems: "center", paddingVertical: 6 }}>
        <ActivityIndicator color={colors.ink} />
        <Text style={styles.printing}>רושם את הקבלה…</Text>
        {!!text && <Text style={styles.printingEcho}>"{text}"</Text>}
      </View>
      <Perforation />
      <LeaderLine label="תיאור" value="— — —" valueStyle={{ color: colors.dotted }} />
      <LeaderLine label="סכום" value="— — —" valueStyle={{ color: colors.dotted }} />
    </Paper>
  );
}

function SavedReceipt({ transaction, anomaly }) {
  const amount = `${transaction.amount} ${transaction.currency || "₪"}`;
  return (
    <>
      <Paper style={styles.block}>
        <View style={styles.brandRow}>
          <Text style={styles.paperBrand}>Receipt</Text>
          <Stamp label="SAVED ✓" tone="ink" />
        </View>
        <Perforation />
        <LeaderLine label="תיאור" value={transaction.description} />
        <LeaderLine label="קטגוריה" value={transaction.category} />
        <LeaderLine label="סכום" value={amount} />
        <LeaderLine label="תאריך" value={transaction.date} />
        <Perforation />
        <Barcode />
      </Paper>

      <View style={styles.toast}>
        <View style={styles.toastCheck}>
          <Icon name="check" size={14} color={colors.goodInk} strokeWidth={2.6} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.toastTitle}>נשמר בהצלחה!</Text>
          <Text style={styles.toastSub}>
            {transaction.description} · {amount} · {transaction.category}
          </Text>
        </View>
      </View>

      {!!anomaly && (
        <View style={styles.warn}>
          <Icon name="alert" size={18} color="#c0631f" />
          <Text style={styles.warnText}>{anomaly}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paperBrand: { fontFamily: fonts.handLat, color: colors.ink, fontSize: 20 },
  greeting: { ...type.greeting, marginTop: 2 },
  greetingName: { color: colors.ink },
  totalLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.sub,
    marginTop: 12,
    textAlign: "right",
  },
  total: { ...type.total, marginTop: 6, textAlign: "right" },
  emptyMonth: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 12 },

  ask: {
    marginTop: 16,
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  askInput: {
    flex: 1,
    color: "#eaf1f8",
    fontFamily: fonts.body,
    fontSize: 15,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    paddingHorizontal: 6,
    maxHeight: 120,
    textAlign: "right",
  },
  askGo: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  block: { marginTop: 16 },
  printing: { fontFamily: fonts.handHe, fontSize: 24, color: colors.ink, marginTop: 12 },
  printingEcho: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, marginTop: 6 },

  toast: {
    marginTop: 14,
    backgroundColor: colors.ink,
    borderRadius: 12,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  toastCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.good,
    alignItems: "center",
    justifyContent: "center",
  },
  toastTitle: { fontFamily: fonts.handHe, fontSize: 21, color: "#fff", lineHeight: 22 },
  toastSub: { fontFamily: fonts.body, fontSize: 11.5, color: "#cfe0d3", marginTop: 2 },

  note: { marginTop: 16 },
  noteHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  noteTitle: { fontFamily: fonts.handHe, fontSize: 22, color: colors.ink },
  noteBody: { fontFamily: fonts.body, fontSize: 14, color: colors.text, marginTop: 6, lineHeight: 20 },

  warn: {
    marginTop: 12,
    backgroundColor: colors.warnBg,
    borderColor: colors.warnBorder,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  warnText: { fontFamily: fonts.body, fontSize: 12.5, color: colors.warnText, flex: 1 },
});
