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
import { PieChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getDefaultDates, filterByDateRange } from "../utils";

const screenWidth = Dimensions.get("window").width - 48;
const colors = [
  //for charts
  "#00e5a0",
  "#4da8ff",
  "#ff6b6b",
  "#ffd166",
  "#a78bfa",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f59e0b",
];
const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function SummaryScreen({ token, workspaceId }) {
  const { fromDate: defaultFrom, toDate: defaultTo } = getDefaultDates();

  const [transactions, setTransactions] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [workspaceId]),
  );
  const filtered = filterByDateRange(transactions, fromDate, toDate);
  const summary = filtered.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0;
    acc[t.category] += Number(t.amount);
    return acc;
  }, {});
  const total = Object.values(summary).reduce((sum, val) => sum + val, 0);
  const pieData = Object.entries(summary).map(([category, amount], index) => ({
    name: category,
    amount,
    color: colors[index % colors.length],
    legendFontColor: "#eaf0f8",
    legendFontSize: 12,
  }));
  const barData = {
    labels: Object.keys(summary),
    datasets: [{ data: Object.values(summary) }],
  };
  async function fetchTransactions() {
    setLoading(true);
    try {
      const response = await fetch(
        `${SERVER}/transactions?workspaceId=${workspaceId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setTransactions(data.transactions || []);

      const workspaceResponse = await fetch(
        `${SERVER}/workspace/${workspaceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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

      // native only
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(",")[1];
          const fileUri =
            FileSystem.documentDirectory +
            `${workspaceName}-${fromDate}-${toDate}.xlsx`;

          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log("File written to:", fileUri);
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          console.log("File exists:", fileInfo.exists, "Size:", fileInfo.size);

          await Sharing.shareAsync(fileUri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 סיכום חודשי</Text>

      {loading && (
        <ActivityIndicator color="#00e5a0" style={{ marginTop: 32 }} />
      )}

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.fieldLabel}>מתאריך</Text>
          {Platform.OS === "web" ? (
            <TextInput
              style={styles.dateInput}
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6a7a8a"
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromPicker(true)}
              >
                <Text style={{ color: "#eaf0f8" }}>{fromDate}</Text>
              </TouchableOpacity>
              <View style={{ backgroundColor: "white", borderRadius: 8 }}>
                {showFromPicker && (
                  <DateTimePicker
                    value={new Date(fromDate)}
                    themeVariant="light"
                    display="compact"
                    mode="date"
                    onChange={(event, date) => {
                      setShowFromPicker(false);
                      if (date) setFromDate(date.toISOString().split("T")[0]);
                    }}
                  />
                )}
              </View>
            </>
          )}
        </View>
        <View style={styles.dateField}>
          <Text style={styles.fieldLabel}>עד תאריך</Text>
          {Platform.OS === "web" ? (
            <TextInput
              style={styles.dateInput}
              value={toDate}
              onChangeText={setToDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6a7a8a"
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToPicker(true)}
              >
                <Text style={{ color: "#eaf0f8" }}>{toDate}</Text>
              </TouchableOpacity>
              <View style={{ backgroundColor: "white", borderRadius: 8 }}>
                {showToPicker && (
                  <DateTimePicker
                    value={new Date(toDate)}
                    mode="date"
                    onChange={(event, date) => {
                      setShowToPicker(false);
                      if (date) setToDate(date.toISOString().split("T")[0]);
                    }}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </View>

      {Object.keys(summary).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>הוצאות לפי קטגוריה</Text>
          {Object.entries(summary).map(([category, amount]) => (
            <View key={category} style={styles.row}>
              <Text style={styles.category}>{category}</Text>
              <Text style={styles.amount}>{amount.toFixed(2)} ₪</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.total}>סה״כ</Text>
            <Text style={styles.totalAmount}>{total.toFixed(2)} ₪</Text>
          </View>
        </View>
      )}

      {Object.keys(summary).length > 0 && (
        <>
          <Text style={styles.chartTitle}>פילוח לפי קטגוריה</Text>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
          />
          <Text style={styles.chartTitle}>הוצאות לפי קטגוריה</Text>
          <BarChart
            data={barData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: "#0e1318",
              backgroundGradientFrom: "#0e1318",
              backgroundGradientTo: "#0e1318",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 229, 160, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(234, 240, 248, ${opacity})`,
            }}
            style={{ borderRadius: 8 }}
          />
        </>
      )}

      <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
        <Text style={styles.exportButtonText}>📤 ייצא לאקסל</Text>
      </TouchableOpacity>
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
  dateRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  dateField: { flex: 1 },
  dateInput: {
    backgroundColor: "#0e1318",
    color: "#eaf0f8",
    borderColor: "#1e2832",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  fieldLabel: { color: "#6a7a8a", fontSize: 11, marginBottom: 4 },
  exportButton: {
    borderColor: "#00e5a0",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  exportButtonText: { color: "#00e5a0", fontSize: 16, fontWeight: "bold" },
  chartTitle: {
    color: "#eaf0f8",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
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
