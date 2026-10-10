import React from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { C } from "./theme";

export const Button = ({ title, onPress, disabled, loading, kind = "primary", style }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    style={[{ backgroundColor: kind === "primary" ? C.orange : kind === "danger" ? C.danger : "#fff", borderColor: kind === "ghost" ? C.teal : "transparent", borderWidth: 1, paddingVertical: 13, borderRadius: 10, alignItems: "center", opacity: disabled ? 0.5 : 1 }, style]}
  >
    {loading ? <ActivityIndicator color={kind === "ghost" ? C.teal : "#fff"} /> : <Text style={{ color: kind === "ghost" ? C.teal : "#fff", fontWeight: "700" }}>{title}</Text>}
  </Pressable>
);

export const Input = (props) => (
  <TextInput placeholderTextColor={C.muted} {...props}
    style={[{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 10, color: C.text }, props.style]} />
);

export const Center = ({ children }) => <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>{children}</View>;
export const Badge = ({ text, color = C.teal }) => (
  <Text style={{ backgroundColor: color + "22", color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontSize: 12, overflow: "hidden" }}>{text}</Text>
);
