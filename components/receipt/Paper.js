import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, Line } from "react-native-svg";
import { colors, radii } from "../../theme/receipt";

const TOOTH_W = 9;
const TOOTH_H = 7;

// Builds a torn-receipt silhouette: sawtooth top & bottom, straight sides.
function buildTornPath(w, h) {
  const n = Math.max(2, Math.round(w / TOOTH_W));
  const step = w / n;
  let d = `M0 ${TOOTH_H}`;
  for (let i = 0; i < n; i++) {
    const x0 = i * step;
    d += ` L${(x0 + step / 2).toFixed(1)} 0 L${(x0 + step).toFixed(1)} ${TOOTH_H}`;
  }
  d += ` L${w} ${(h - TOOTH_H).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const x0 = w - i * step;
    d += ` L${(x0 - step / 2).toFixed(1)} ${h} L${(x0 - step).toFixed(1)} ${(h - TOOTH_H).toFixed(1)}`;
  }
  return d + " Z";
}

function RuledLines({ w, h }) {
  const lines = [];
  for (let y = TOOTH_H + 22; y < h - TOOTH_H; y += 28) {
    lines.push(
      <Line key={y} x1={14} y1={y} x2={w - 14} y2={y} stroke={colors.ruled} strokeWidth={1} />,
    );
  }
  return lines;
}

// A sheet of receipt paper. `flat` = rounded card (no torn edges), used for
// stacked sub-panels and modals. `tilt` (deg) gives the "placed on a table" feel.
export default function Paper({ children, style, contentStyle, flat = false, tilt = 0, ruled = true }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };
  const { w, h } = size;

  return (
    <View
      onLayout={onLayout}
      style={[styles.shadow, tilt ? { transform: [{ rotate: `${tilt}deg` }] } : null, style]}
    >
      {w > 0 && h > 0 && (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          {flat ? (
            <Rect x={0} y={0} width={w} height={h} rx={radii.lg} fill={colors.paper} />
          ) : (
            <Path d={buildTornPath(w, h)} fill={colors.paper} />
          )}
          {ruled && <RuledLines w={w} h={h} />}
        </Svg>
      )}
      <View style={[styles.pad, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#3c2d14",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  pad: { paddingHorizontal: 17, paddingTop: 18, paddingBottom: 20 },
});
