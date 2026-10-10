import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useAuth } from "../auth";
import { Button, Input } from "../ui";
import { C } from "../theme";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "login") await login(f.email.trim(), f.password);
      else await register({ name: f.name, email: f.email.trim(), password: f.password, ...(f.phone ? { phone: f.phone } : {}), role: "buyer" });
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 90 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 34, fontWeight: "800", color: C.navy }}>msukasha</Text>
        <Text style={{ color: C.muted, marginBottom: 28 }}>Pakistan's B2B & C2C marketplace</Text>
        {mode === "register" && <Input placeholder="Full name" value={f.name} onChangeText={set("name")} />}
        <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={f.email} onChangeText={set("email")} />
        {mode === "register" && <Input placeholder="Phone (optional)" keyboardType="phone-pad" value={f.phone} onChangeText={set("phone")} />}
        <Input placeholder="Password (min 8 characters)" secureTextEntry value={f.password} onChangeText={set("password")} />
        <Button title={mode === "login" ? "Log in" : "Create account"} onPress={submit} loading={busy} />
        <View style={{ height: 14 }} />
        <Button kind="ghost" title={mode === "login" ? "New here? Create an account" : "I already have an account"} onPress={() => setMode(mode === "login" ? "register" : "login")} />
        <Text style={{ color: C.muted, marginTop: 24, fontSize: 12 }}>Want to sell? Register your store at sellermsukasha.com</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
