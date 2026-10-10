import React, { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { Badge, Button, Center, Input } from "../ui";
import { statusColor } from "./OrdersScreen";
import { C, money } from "../theme";

export default function OrderDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [o, setO] = useState(null);
  const [bank, setBank] = useState(null);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { order } = await api.get(`/orders/${id}`);
      setO(order);
      if (order.paymentMethod === "bank_transfer") setBank((await api.get("/payments/methods")).methods.find((m) => m.id === "bank_transfer")?.instructions);
    } catch (e) { Alert.alert("Error", e.message); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const run = async (fn) => { setBusy(true); try { await fn(); await load(); } catch (e) { Alert.alert("Error", e.message); } finally { setBusy(false); } };

  if (!o) return <Center><Text>Loading...</Text></Center>;
  const payable = ["pending", "failed"].includes(o.paymentStatus) && o.status !== "cancelled";

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>{o.orderNumber}</Text>
      <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>
        <Badge text={o.status} color={statusColor(o.status)} />
        <Badge text={`payment: ${o.paymentStatus.replace("_", " ")}`} color={statusColor(o.paymentStatus)} />
      </View>
      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 12 }}>
        {o.items.map((i, k) => <Text key={k} style={{ marginBottom: 4 }}>{i.qty} × {i.title} — {money(i.unitPrice * i.qty)}</Text>)}
        <Text style={{ color: C.muted, marginTop: 6 }}>Subtotal {money(o.subtotal)} · Shipping {money(o.shippingFee)}</Text>
        <Text style={{ fontWeight: "800", fontSize: 16 }}>Total {money(o.total)}</Text>
      </View>
      <Text style={{ color: C.muted, marginTop: 10 }}>Deliver to: {o.shippingAddress.fullName}, {o.shippingAddress.line1}, {o.shippingAddress.city} · {o.shippingAddress.phone}</Text>

      {o.paymentMethod === "bank_transfer" && payable && (
        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 14 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>Pay by bank transfer</Text>
          <Text>{bank?.bank}</Text><Text>Title: {bank?.accountTitle}</Text><Text>Account: {bank?.accountNumber}</Text><Text>IBAN: {bank?.iban}</Text>
          <Input style={{ marginTop: 10 }} placeholder="Transaction / reference number" value={ref} onChangeText={setRef} />
          <Button title="Submit payment reference" disabled={ref.trim().length < 4} loading={busy} onPress={() => run(() => api.post(`/payments/${o._id}/bank-transfer`, { reference: ref.trim() }))} />
        </View>
      )}
      {o.paymentMethod === "bank_transfer" && o.paymentStatus === "awaiting_verification" && <Text style={{ marginTop: 14, color: C.orange }}>Reference submitted. We will verify your payment shortly.</Text>}

      {o.paymentMethod === "jazzcash" && payable && (
        <Button style={{ marginTop: 14 }} title="Pay with JazzCash" loading={busy} onPress={() => run(async () => navigation.navigate("Pay", { payload: await api.post(`/payments/${o._id}/jazzcash`) }))} />
      )}
      {o.paymentMethod === "cod" && o.status !== "cancelled" && o.paymentStatus !== "paid" && <Text style={{ marginTop: 14, color: C.teal }}>Pay cash when your order arrives.</Text>}

      {["placed", "confirmed"].includes(o.status) && (
        <Button kind="ghost" style={{ marginTop: 16 }} title="Cancel order" loading={busy} onPress={() => Alert.alert("Cancel this order?", "", [{ text: "No" }, { text: "Yes, cancel", style: "destructive", onPress: () => run(() => api.post(`/orders/${o._id}/cancel`)) }])} />
      )}
    </ScrollView>
  );
}
