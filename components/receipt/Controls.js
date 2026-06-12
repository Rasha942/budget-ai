import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "./Icon";
import { colors, fonts } from "../../theme/receipt";

// Button — variant: "primary" (ink/gold) | "gold" (gold/ink) | "ghost" | "danger".
export function Button({ label, icon, variant = "primary", onPress, disabled, style }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <TouchableOpacity
      style={[s.btn, v.box, disabled && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {icon ? <Icon name={icon} size={17} color={v.fg} strokeWidth={2} /> : null}
      <Text style={[s.btnText, { color: v.fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const VARIANTS = {
  primary: { box: { backgroundColor: colors.ink }, fg: colors.gold },
  gold: { box: { backgroundColor: colors.gold }, fg: colors.ink },
  ghost: { box: { borderWidth: 1.5, borderColor: colors.ink }, fg: colors.ink },
  danger: { box: { borderWidth: 1.5, borderColor: colors.red }, fg: colors.red },
};

// Labeled input styled as a receipt field.
export function Field({ label, style, inputStyle, ...props }) {
  return (
    <View style={[{ marginTop: 12 }, style]}>
      {label ? <Text style={s.fl}>{label}</Text> : null}
      <TextInput
        style={[s.fi, inputStyle]}
        placeholderTextColor={colors.muted}
        {...props}
      />
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: { fontFamily: fonts.bodySemi, fontSize: 14 },
  fl: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.sub,
    marginBottom: 6,
    textAlign: "right",
  },
  fi: {
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.field,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 13,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    textAlign: "right",
  },
});
