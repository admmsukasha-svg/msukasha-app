import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View, Pressable } from "react-native";
import { api } from "../api";
import { Button, Center } from "../ui";
import { C, money } from "../theme";

export default function ProductScreen({ route, navigation }) {
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/products/${route.params.id}`).then((r) => { setP(r.product); setQty(r.product.minOrderQty || 1); })
      .catch((e) => { Alert.alert("Error", e.message); navigation.goBack(); });
  }, [route.params.id]);

  if (!p) return <Center><Text>Loading...</Text></Center>;

  const tiers = [...(p.tierPricing || [])].sort((a, b) => a.minQty - b.minQty);
  const unit = [...tiers].reverse().find((t) => qty >= t.minQty)?.price ?? p.price;
  const min = p.minOrderQty || 1;

  const add = async () => {
    setBusy(true);
    try {
      await api.put("/cart/items", { productId: p._id, qty });
      Alert.alert("Added to cart", "", [{ text: "Keep shopping" }, { text: "View cart", onPress: () => navigation.navigate("Tabs", { screen: "Cart" }) }]);
    } catch (e) { Alert.alert("Error", e.message); } finally { setBusy(false); }
  };

  const Step = ({ label, delta }) => (
    <Pressable onPress={() => setQty((q) => Math.min(p.stock, Math.max(min, q + delta)))} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.border, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScrollView horizontal pagingEnabled>
        {(p.images?.length ? p.images : [null]).map((u, i) => u ? <Image key={i} source={{ uri: u }} style={{ width: 400, height: 300 }} resizeMode="cover" /> : <View key={i} style={{ width: 400, height: 300, backgroundColor: C.border }} />)}
      </ScrollView>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: C.text }}>{p.title}</Text>
        <Text style={{ fontSize: 24, fontWeight: "800", color: C.orange, marginVertical: 6 }}>{money(unit)} <Text style={{ fontSize: 13, color: C.muted }}>/ unit</Text></Text>
        <Text style={{ color: C.muted }}>Sold by {p.seller?.seller?.storeName || "Seller"} · {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</Text>
        {min > 1 && <Text style={{ color: C.teal, marginTop: 6 }}>Minimum order: {min} units</Text>}
        {tiers.length > 0 && (
          <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12, marginTop: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Wholesale prices</Text>
            {tiers.map((t) => <Text key={t.minQty} style={{ color: C.text }}>{t.minQty}+ units: {money(t.price)} each</Text>)}
          </View>
        )}
        {!!p.description && <Text style={{ marginTop: 14, color: C.text, lineHeight: 21 }}>{p.description}</Text>}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 20 }}>
          <Step label="-" delta={-1} />
          <Text style={{ width: 70, textAlign: "center", fontSize: 18, fontWeight: "700" }}>{qty}</Text>
          <Step label="+" delta={1} />
        </View>
        <Button title={`Add to cart · ${money(unit * qty)}`} onPress={add} loading={busy} disabled={p.stock < min} />
      </View>
    </ScrollView>
  );
}
