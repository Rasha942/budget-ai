import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../theme/receipt";

// Rubber stamp — rotated bordered label. tone: "red" | "ink".
export function Stamp({ label, tone = "red", rotate = -6, style }) {
  const c = tone === "ink" ? colors.ink : colors.red;
  return (
    <View style={[s.stamp, { borderColor: c, transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <Text style={[s.stampText, { color: c }]}>{label}</Text>
    </View>
  );
}

// Perforated tear-line, full-bleed across the paper padding.
export function Perforation({ style }) {
  return <View style={[s.perf, style]} />;
}

// A receipt line: right-aligned label · dotted leader · printed value.
// RTL: label sits at the start (right), value at the end (left).
export function LeaderLine({ label, value, labelStyle, valueStyle, style }) {
  return (
    <View style={[s.li, style]}>
      <Text style={[s.liLabel, labelStyle]}>{label}</Text>
      <View style={s.leader} />
      <Text style={[s.liValue, valueStyle]}>{value}</Text>
    </View>
  );
}

// Decorative barcode footer.
export function Barcode({ widths, color = colors.text, height = 30, style }) {
  const bars =
    widths || [2, 4, 2, 6, 2, 3, 5, 2, 2, 4, 6, 2, 3, 2, 5, 2, 4, 2, 6, 3, 2, 5, 2, 4];
  return (
    <View style={[s.barcode, { height }, style]}>
      {bars.map((w, i) => (
        <View key={i} style={{ width: w, backgroundColor: color, height: "100%" }} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  stamp: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  stampText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  perf: {
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.dotted,
    marginHorizontal: -17,
    marginVertical: 14,
  },
  li: { flexDirection: "row", alignItems: "baseline", paddingVertical: 6, gap: 8 },
  liLabel: { fontFamily: fonts.body, fontSize: 12.5, color: colors.sub },
  leader: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderStyle: "dotted",
    borderColor: colors.dotted,
    transform: [{ translateY: -3 }],
  },
  liValue: { fontFamily: fonts.monoMed, fontSize: 13, color: colors.text },
  barcode: { flexDirection: "row", gap: 2, justifyContent: "center", marginTop: 14 },
});
