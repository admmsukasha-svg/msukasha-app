import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { api } from "../api";
import { Input } from "../ui";
import { C, money } from "../theme";

const TYPES = [{ id: undefined, label: "All" }, { id: "c2c", label: "Retail" }, { id: "b2b", label: "Wholesale" }];

export default function HomeScreen({ navigation }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState();
  const [type, setType] = useState();
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const timer = useRef();

  const load = useCallback(async (p = 1) => {
    setBusy(true); setErr(null);
    try {
      const qs = new URLSearchParams({ page: String(p), limit: "20" });
      if (q.trim()) qs.set("q", q.trim());
      if (category) qs.set("category", category);
      if (type) qs.set("type", type);
      const r = await api.get("/products?" + qs);
      setItems((prev) => (p === 1 ? r.items : [...prev, ...r.items]));
      setPage(r.page); setPages(r.pages);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }, [q, category, type]);

  useEffect(() => { api.get("/categories").then((r) => setCats(r.categories)).catch(() => {}); }, []);
  useEffect(() => { clearTimeout(timer.current); timer.current = setTimeout(() => load(1), 350); return () => clearTimeout(timer.current); }, [load]);

  const Chip = ({ label, active, onPress }) => (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, marginRight: 8, backgroundColor: active ? C.teal : "#fff", borderWidth: 1, borderColor: active ? C.teal : C.border }}>
      <Text style={{ color: active ? "#fff" : C.text }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ backgroundColor: C.navy, padding: 12, paddingTop: 48 }}>
        <Input placeholder="Search products" value={q} onChangeText={setQ} style={{ marginBottom: 8 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TYPES.map((t) => <Chip key={t.label} label={t.label} active={type === t.id} onPress={() => setType(t.id)} />)}
        </ScrollView>
      </View>
      <View style={{ paddingVertical: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          <Chip label="All categories" active={!category} onPress={() => setCategory(undefined)} />
          {cats.map((c) => <Chip key={c._id} label={c.name} active={category === c._id} onPress={() => setCategory(c._id)} />)}
        </ScrollView>
      </View>
      {err && <Text style={{ color: C.danger, textAlign: "center", padding: 8 }}>{err}</Text>}
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 8 }}
        refreshControl={<RefreshControl refreshing={busy && page === 1} onRefresh={() => load(1)} />}
        onEndReached={() => !busy && page < pages && load(page + 1)}
        ListEmptyComponent={!busy && <Text style={{ textAlign: "center", color: C.muted, marginTop: 40 }}>No products found</Text>}
        ListFooterComponent={busy && page > 1 ? <ActivityIndicator style={{ margin: 16 }} /> : null}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("Product", { id: item._id })} style={{ flex: 1, margin: 6, backgroundColor: C.card, borderRadius: 12, overflow: "hidden" }}>
            {item.images?.[0] ? <Image source={{ uri: item.images[0] }} style={{ height: 130, backgroundColor: C.border }} /> : <View style={{ height: 130, backgroundColor: C.border }} />}
            <View style={{ padding: 10 }}>
              <Text numberOfLines={2} style={{ fontWeight: "600", color: C.text }}>{item.title}</Text>
              <Text style={{ color: C.orange, fontWeight: "800", marginTop: 4 }}>{money(item.price)}</Text>
              {item.minOrderQty > 1 && <Text style={{ color: C.muted, fontSize: 12 }}>Min. order {item.minOrderQty}</Text>}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
