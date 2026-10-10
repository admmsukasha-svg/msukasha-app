import React, { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { Badge } from "../ui";
import { C, money } from "../theme";

export const statusColor = (s) => ({ placed: C.muted, confirmed: C.teal, shipped: C.navy, delivered: C.ok, cancelled: C.danger, paid: C.ok, failed: C.danger, pending: C.muted, awaiting_verification: C.orange, refunded: C.muted }[s] || C.muted);

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setBusy(true); try { setOrders((await api.get("/orders")).orders); } catch {} finally { setBusy(false); } }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <FlatList
      style={{ backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 12, paddingTop: 50 }}
      data={orders}
      keyExtractor={(o) => o._id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListEmptyComponent={!busy && <Text style={{ textAlign: "center", color: C.muted, marginTop: 60 }}>No orders yet</Text>}
      renderItem={({ item: o }) => (
        <Pressable onPress={() => navigation.navigate("OrderDetail", { id: o._id })} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "700" }}>{o.orderNumber}</Text>
            <Badge text={o.status} color={statusColor(o.status)} />
          </View>
          <Text style={{ color: C.muted, marginVertical: 4 }}>{o.items.length} item(s) · {new Date(o.createdAt).toLocaleDateString()}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: C.orange, fontWeight: "800" }}>{money(o.total)}</Text>
            <Badge text={o.paymentStatus.replace("_", " ")} color={statusColor(o.paymentStatus)} />
          </View>
        </Pressable>
      )}
    />
  );
}
