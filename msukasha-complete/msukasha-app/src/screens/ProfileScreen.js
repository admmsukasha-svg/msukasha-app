import React from "react";
import { Alert, Linking, Text, View } from "react-native";
import { useAuth } from "../auth";
import { Button } from "../ui";
import { C } from "../theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 20, paddingTop: 70 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>{user.name}</Text>
      <Text style={{ color: C.muted }}>{user.email}</Text>
      {!!user.phone && <Text style={{ color: C.muted }}>{user.phone}</Text>}
      <Text style={{ color: C.teal, marginTop: 6, textTransform: "capitalize" }}>{user.role} account</Text>
      {user.role === "seller" && <Button kind="ghost" style={{ marginTop: 20 }} title="Open seller portal" onPress={() => Linking.openURL("https://sellermsukasha.com")} />}
      <Button kind="ghost" style={{ marginTop: 12 }} title="Contact support (WhatsApp)" onPress={() => Linking.openURL("https://wa.me/923313730953")} />
      <Button style={{ marginTop: 12 }} title="Log out" onPress={() => Alert.alert("Log out?", "", [{ text: "Cancel" }, { text: "Log out", onPress: logout }])} />
    </View>
  );
}
