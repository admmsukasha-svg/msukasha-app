import React, { useCallback, useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { Button, Center } from "../ui";
import { C, money } from "../theme";

const ISSUES = { unavailable: "No longer available", insufficient_stock: "Not enough stock", below_min_qty: "Below minimum order" };

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState(null);
  const load = useCallback(() => api.get("/cart").then(setCart).catch((e) => Alert.alert("Error", e.message)), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const setQty = async (id, qty) => {
    try { setCart(await api.put("/cart/items", { productId: id, qty })); } catch (e) { Alert.alert("Error", e.message); }
  };

  if (!cart) return <Center><Text>Loading...</Text></Center>;
  if (!cart.items.length) return <Center><Text style={{ color: C.muted }}>Your cart is empty</Text></Center>;
  const blocked = cart.items.some((i) => i.issue);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => i.product._id}
        contentContainerStyle={{ padding: 12, paddingTop: 50 }}
        renderItem={({ item: i }) => (
          <View style={{ flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 10, marginBottom: 10 }}>
            {i.product.image ? <Image source={{ uri: i.product.image }} style={{ width: 70, height: 70, borderRadius: 8 }} /> : <View style={{ width: 70, height: 70, borderRadius: 8, backgroundColor: C.border }} />}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text numberOfLines={2} style={{ fontWeight: "600" }}>{i.product.title}</Text>
              <Text style={{ color: C.orange, fontWeight: "700" }}>{money(i.unitPrice)} × {i.qty} = {money(i.lineTotal)}</Text>
              {i.issue && <Text style={{ color: C.danger, fontSize: 12 }}>{ISSUES[i.issue]}</Text>}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                <Pressable onPress={() => setQty(i.product._id, i.qty - 1)}><Text style={{ fontSize: 22, paddingHorizontal: 12 }}>−</Text></Pressable>
                <Text style={{ fontWeight: "700" }}>{i.qty}</Text>
                <Pressable onPress={() => setQty(i.product._id, i.qty + 1)}><Text style={{ fontSize: 22, paddingHorizontal: 12 }}>+</Text></Pressable>
                <Pressable onPress={() => setQty(i.product._id, 0)} style={{ marginLeft: "auto" }}><Text style={{ color: C.danger }}>Remove</Text></Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <View style={{ backgroundColor: "#fff", padding: 16 }}>
        <Text style={{ color: C.muted }}>Subtotal {money(cart.subtotal)} · Shipping from {money(cart.estimatedShipping)}</Text>
        <Button style={{ marginTop: 10 }} title="Checkout" disabled={blocked} onPress={() => navigation.navigate("Checkout")} />
      </View>
    </View>
  );
}
