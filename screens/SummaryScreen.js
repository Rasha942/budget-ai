import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Paper,
  Stamp,
  Perforation,
  Barcode,
  Button,
  Donut,
  Legend,
  Bars,
  Segmented,
} from "../components/receipt";
import { colors, fonts } from "../theme/receipt";
import { getDefaultDates, filterByDateRange } from "../utils";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SummaryScreen({ token, workspaceId }) {
  const { fromDate: defaultFrom, toDate: defaultTo } = getDefaultDates();

  const [transactions, setTransactions] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [chartView, setChartView] = useState("pie");

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [workspaceId]),
  );

  const filtered = filterByDateRange(transactions, fromDate, toDate);
  const summary = filtered.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});
  const total = Object.values(summary).reduce((s, v) => s + v, 0);
  const entries = Object.entries(summary).sort((a, b) => b[1] - a[1]);
  const pct = (v) => (total ? Math.round((v / total) * 100) : 0);

  const donutData = entries.map(([cat, amt], i) => ({
    value: amt,
    color: colors.chart[i % colors.chart.length],
  }));
  const legendItems = entries.map(([cat, amt], i) => ({
    label: cat,
    value: `${pct(amt)}%`,
    color: colors.chart[i % colors.chart.length],
  }));
  const barItems = entries.map(([cat, amt], i) => ({
    label: cat,
    value: amt,
    display: `${fmt(amt)} · ${pct(amt)}%`,
    color: colors.chart[i % colors.chart.length],
  }));

  async function fetchTransactions() {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER}/transactions?workspaceId=${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTransactions(data.transactions || []);

      const workspaceResponse = await fetch(`${SERVER}/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const workspaceData = await workspaceResponse.json();
      setWorkspaceName(workspaceData.name);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function exportToExcel() {
    try {
      const response = await fetch(`${SERVER}/export`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: filtered, fromDate, toDate }),
      });

      if (Platform.OS === "web") {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${workspaceName}-${fromDate}-${toDate}.xlsx`;
        a.click();
        return;
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(",")[1];
          const fileUri = FileSystem.documentDirectory + `${workspaceName}-${fromDate}-${toDate}.xlsx`;
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            UTI: "com.microsoft.excel.xlsx",
          });
        } catch (err) {
          console.error("File save error:", err);
        }
      };
    } catch (error) {
      console.error("Export error:", error);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>סיכום</Text>

      {/* date range */}
      <View style={styles.dateRow}>
        <DateField
          label="מתאריך"
          value={fromDate}
          onChange={setFromDate}
          show={showFromPicker}
          setShow={setShowFromPicker}
        />
        <DateField
          label="עד תאריך"
          value={toDate}
          onChange={setToDate}
          show={showToPicker}
          setShow={setShowToPicker}
        />
      </View>

      {loading && <ActivityIndicator color={colors.ink} style={{ marginVertical: 24 }} />}

      <Paper>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Summary</Text>
          <Stamp label={`${toDate.slice(5, 7)} / ${toDate.slice(0, 4)}`} tone="ink" />
        </View>
        <Perforation />
        <Text style={styles.totalLabel}>TOTAL · סה״כ</Text>
        <Text style={styles.total}>₪{fmt(total)}</Text>

        {entries.length > 0 ? (
          <>
            <View style={{ marginTop: 12 }}>
              <Segmented
                options={[
                  { key: "pie", label: "עוגה" },
                  { key: "bars", label: "עמודות" },
                ]}
                value={chartView}
                onChange={setChartView}
              />
            </View>

            {chartView === "pie" ? (
              <View style={styles.pieRow}>
                <Donut
                  data={donutData}
                  total={total}
                  centerLabel="סה״כ"
                  centerValue={Math.round(total).toLocaleString("en-US")}
                />
                <Legend items={legendItems} />
              </View>
            ) : (
              <Bars items={barItems} />
            )}
          </>
        ) : (
          !loading && <Text style={styles.empty}>אין נתונים לטווח הזה</Text>
        )}

        <Perforation />
        <Barcode />
      </Paper>

      <Button label="ייצוא לאקסל" icon="download" variant="primary" onPress={exportToExcel} style={{ marginTop: 14 }} />
    </ScrollView>
  );
}

function DateField({ label, value, onChange, show, setShow }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {Platform.OS === "web" ? (
        <TextInput
          style={styles.dateInput}
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
        />
      ) : (
        <>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShow(true)}>
            <Text style={styles.dateText}>{value}</Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={new Date(value)}
              mode="date"
              display="compact"
              onChange={(e, date) => {
                setShow(false);
                if (date) onChange(date.toISOString().split("T")[0]);
              }}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  title: { fontFamily: fonts.handHe, fontSize: 30, color: colors.text, marginBottom: 14 },
  dateRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.sub,
    marginBottom: 5,
    textAlign: "right",
  },
  dateInput: {
    backgroundColor: colors.paper,
    borderColor: colors.field,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  dateText: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontFamily: fonts.handLat, color: colors.ink, fontSize: 20 },
  totalLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.sub, textAlign: "right" },
  total: { fontFamily: fonts.monoSemi, fontSize: 32, color: colors.ink, marginTop: 6, textAlign: "right" },
  pieRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 14 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 16 },
});
