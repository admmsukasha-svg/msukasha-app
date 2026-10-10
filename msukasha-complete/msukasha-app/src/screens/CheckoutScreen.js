import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../api";
import { useAuth } from "../auth";
import { Button, Input } from "../ui";
import { C } from "../theme";

export default function CheckoutScreen({ navigation }) {
  const { user } = useAuth();
  const saved = user?.addresses?.[0] || {};
  const [a, setA] = useState({ fullName: saved.fullName || user?.name || "", phone: saved.phone || user?.phone || "", line1: saved.line1 || "", city: saved.city || "" });
  const [methods, setMethods] = useState([]);
  const [method, setMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setA((s) => ({ ...s, [k]: v }));

  useEffect(() => { api.get("/payments/methods").then((r) => setMethods(r.methods.filter((m) => m.enabled))).catch(() => {}); }, []);

  const place = async () => {
    setBusy(true);
    try {
      const { orders } = await api.post("/orders/checkout", { shippingAddress: a, paymentMethod: method, ...(note ? { note } : {}) });
      navigation.popToTop();
      navigation.navigate("Tabs", { screen: "Orders" });
      if (orders.length === 1) navigation.navigate("OrderDetail", { id: orders[0]._id });
      else Alert.alert("Orders placed", `Your cart was split into ${orders.length} orders (one per seller).`);
    } catch (e) { Alert.alert("Could not place order", e.message); } finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 8 }}>Delivery address</Text>
      <Input placeholder="Full name" value={a.fullName} onChangeText={set("fullName")} />
      <Input placeholder="Phone (03xx xxxxxxx)" keyboardType="phone-pad" value={a.phone} onChangeText={set("phone")} />
      <Input placeholder="Street address" value={a.line1} onChangeText={set("line1")} />
      <Input placeholder="City" value={a.city} onChangeText={set("city")} />
      <Input placeholder="Note for seller (optional)" value={note} onChangeText={setNote} />
      <Text style={{ fontWeight: "800", fontSize: 16, marginVertical: 8 }}>Payment method</Text>
      {methods.map((m) => (
        <Pressable key={m.id} onPress={() => setMethod(m.id)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 2, borderColor: method === m.id ? C.teal : "transparent" }}>
          <Text style={{ flex: 1, fontWeight: "600" }}>{m.label}</Text>
          {method === m.id && <Text style={{ color: C.teal }}>✓</Text>}
        </Pressable>
      ))}
      <Button style={{ marginTop: 12 }} title="Place order" onPress={place} loading={busy} disabled={!a.fullName || !a.phone || !a.line1 || !a.city} />
    </ScrollView>
  );
}
