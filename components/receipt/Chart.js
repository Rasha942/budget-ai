import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { colors, fonts } from "../../theme/receipt";

// Donut pie. data: [{ value, color }]. Renders an open center.
export function Donut({ data, size = 130, thickness = 26, total, centerLabel, centerValue }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const sum = total || data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.ruled} strokeWidth={thickness} fill="none" />
          {data.map((d, i) => {
            const len = (d.value / sum) * C;
            const el = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={d.color}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-acc}
                strokeLinecap="butt"
              />
            );
            acc += len;
            return el;
          })}
        </G>
      </Svg>
      {(centerLabel || centerValue) && (
        <View style={st.center} pointerEvents="none">
          {!!centerLabel && <Text style={st.centerLabel}>{centerLabel}</Text>}
          {!!centerValue && <Text style={st.centerValue}>{centerValue}</Text>}
        </View>
      )}
    </View>
  );
}

// Legend rows beside a donut. items: [{ label, value, color }].
export function Legend({ items }) {
  return (
    <View style={{ flex: 1, gap: 8 }}>
      {items.map((it, i) => (
        <View key={i} style={st.lg}>
          <View style={[st.dot, { backgroundColor: it.color }]} />
          <Text style={st.lgLabel} numberOfLines={1}>{it.label}</Text>
          <Text style={st.lgValue}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

// Horizontal bars. items: [{ label, value, display, color }].
export function Bars({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <View style={{ marginTop: 4 }}>
      {items.map((it, i) => (
        <View key={i} style={{ paddingVertical: 7 }}>
          <View style={st.barRow}>
            <Text style={st.barLabel}>{it.label}</Text>
            <Text style={st.barValue}>{it.display}</Text>
          </View>
          <View style={st.track}>
            <View style={{ width: `${(it.value / max) * 100}%`, height: "100%", backgroundColor: it.color, borderRadius: 5 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// Segmented toggle. options: [{ key, label }].
export function Segmented({ options, value, onChange }) {
  return (
    <View style={st.seg}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <TouchableOpacity
            key={o.key}
            style={[st.segOpt, on && st.segOptOn]}
            onPress={() => onChange(o.key)}
            activeOpacity={0.8}
          >
            <Text style={[st.segText, on && st.segTextOn]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  center: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  centerLabel: { fontFamily: fonts.mono, fontSize: 9, color: colors.sub, letterSpacing: 0.5 },
  centerValue: { fontFamily: fonts.monoSemi, fontSize: 17, color: colors.ink },
  lg: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 3 },
  lgLabel: { fontFamily: fonts.body, fontSize: 12.5, color: colors.text, flexShrink: 1 },
  lgValue: { fontFamily: fonts.monoMed, fontSize: 12.5, color: colors.text, marginStart: "auto" },
  barRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 },
  barLabel: { fontFamily: fonts.body, fontSize: 12.5, color: colors.text },
  barValue: { fontFamily: fonts.monoMed, fontSize: 12, color: colors.ink },
  track: { height: 9, backgroundColor: "#e6dcc4", borderRadius: 5, overflow: "hidden" },
  seg: { flexDirection: "row", backgroundColor: "#ece3cf", borderRadius: 10, padding: 3, gap: 3, alignSelf: "center" },
  segOpt: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  segOptOn: { backgroundColor: colors.ink },
  segText: { fontFamily: fonts.bodyMed, fontSize: 12.5, color: colors.sub },
  segTextOn: { color: colors.paper },
});
