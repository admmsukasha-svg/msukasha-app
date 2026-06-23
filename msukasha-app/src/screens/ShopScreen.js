import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, RefreshControl, Dimensions,
  ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES, RADIUS, SHADOW } from '../constants';
import { apiGetProducts, apiGetAds, addToCart, addToWishlist } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const STATIC_PRODUCTS = [
  { id:'p1', title:'Industrial Solar Panels 545W', price:120, unit:'/pc', moq:10, type:'b2b', cat:'industrial', img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400' },
  { id:'p2', title:'Wholesale Cotton T-Shirts', price:2.5, unit:'/pc', moq:100, type:'b2b', cat:'fashion', img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  { id:'p3', title:'Wireless Earbuds Bulk', price:8.9, unit:'/pc', moq:50, type:'b2b', cat:'electronics', img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
  { id:'p4', title:'Custom Power Banks 10000mAh', price:5.2, unit:'/pc', moq:20, type:'b2b', cat:'electronics', img:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400' },
  { id:'p5', title:'Basmati Rice Premium 50kg', price:4500, unit:'/bag', moq:10, type:'b2b', cat:'agriculture', img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { id:'p6', title:'Steel Rebar 12mm Per Ton', price:180000, unit:'/ton', moq:5, type:'b2b', cat:'industrial', img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
  { id:'p7', title:'FIFA Footballs Bulk Wholesale', price:850, unit:'/pc', moq:24, type:'b2b', cat:'sports', img:'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400' },
  { id:'p9', title:'Used iPhone 12 Pro 128GB', price:135000, unit:'', moq:1, type:'c2c', cat:'electronics', location:'DHA, Karachi', img:'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400' },
  { id:'p10', title:'Honda CD 70 2024 Model', price:115000, unit:'', moq:1, type:'c2c', cat:'vehicles', location:'Lahore', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { id:'p11', title:'Office Desk & Chair Set', price:12000, unit:'', moq:1, type:'c2c', cat:'home', location:'Islamabad', img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400' },
  { id:'p12', title:'Nikon D5600 DSLR Camera', price:75000, unit:'', moq:1, type:'c2c', cat:'electronics', location:'Peshawar', img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' },
  { id:'p13', title:'Samsung Galaxy A54 8GB', price:42000, unit:'', moq:1, type:'c2c', cat:'electronics', location:'Lahore', img:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400' },
  { id:'p14', title:'Leather Sofa Set 5-Seater', price:45000, unit:'', moq:1, type:'c2c', cat:'home', location:'Lahore', img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
  { id:'p15', title:'LED Bulbs 9W Pack of 100', price:35, unit:'/pc', moq:100, type:'b2b', cat:'electronics', img:'https://images.unsplash.com/photo-1558618047-f4e4ad2a4df6?w=400' },
  { id:'p16', title:'Suzuki Mehran 2020', price:1250000, unit:'', moq:1, type:'c2c', cat:'vehicles', location:'Karachi', img:'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400' },
];

export default function ShopScreen({ navigation, route }) {
  const insets  = useSafeAreaInsets();
  const initCat  = route?.params?.cat  || '';
  const initType = route?.params?.type || '';

  const [query,     setQuery]    = useState('');
  const [selCat,    setSelCat]   = useState(initCat);
  const [selType,   setSelType]  = useState(initType);
  const [sortBy,    setSortBy]   = useState('default');
  const [products,  setProducts] = useState(STATIC_PRODUCTS);
  const [filtered,  setFiltered] = useState(STATIC_PRODUCTS);
  const [loading,   setLoading]  = useState(false);
  const [refreshing,setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { applyFilters(); }, [selCat, selType, sortBy, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        apiGetProducts({ limit: 50 }),
        apiGetAds({ limit: 30 }),
      ]);
      const all = [
        ...(p.products || []).map(x => ({ ...x, id: x._id, img: x.images?.[0] || '' })),
        ...(a.ads || []).map(x => ({ ...x, id: x._id, img: x.images?.[0] || '' })),
      ];
      if (all.length > 0) setProducts(all);
    } catch { /* use static */ }
    setLoading(false);
  };

  const applyFilters = useCallback(() => {
    let list = [...products];
    if (selCat)  list = list.filter(p => (p.category || p.cat || '').toLowerCase() === selCat.toLowerCase());
    if (selType) list = list.filter(p => p.type === selType);
    if (query)   list = list.filter(p => (p.title || p.name || '').toLowerCase().includes(query.toLowerCase()));
    if (sortBy === 'price-asc')  list.sort((a,b) => a.price - b.price);
    if (sortBy === 'price-desc') list.sort((a,b) => b.price - a.price);
    setFiltered(list);
  }, [products, selCat, selType, query, sortBy]);

  useEffect(() => { applyFilters(); }, [query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, []);

  const renderProduct = ({ item }) => {
    const isB2B = item.type === 'b2b';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { id: item.id || item._id, type: item.type })}
        activeOpacity={0.9}
      >
        <View style={styles.cardImgWrap}>
          <Image
            source={{ uri: item.img || item.images?.[0] || 'https://via.placeholder.com/200' }}
            style={styles.cardImg}
            resizeMode="cover"
          />
          <View style={[styles.badge, isB2B ? styles.badgeB2B : styles.badgeC2C]}>
            <Text style={styles.badgeTxt}>{isB2B ? 'B2B' : 'USED'}</Text>
          </View>
          <TouchableOpacity
            style={styles.wishBtn}
            onPress={() => addToWishlist({ id: item.id, name: item.title || item.name, price: item.price, img: item.img, type: item.type })}
          >
            <Ionicons name="heart-outline" size={14} color={COLORS.orange} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={2}>{item.title || item.name}</Text>
          {isB2B ? (
            <>
              <Text style={styles.cardPrice}>${Number(item.price).toFixed(2)}{item.unit || '/pc'}</Text>
              <Text style={styles.cardMoq}>MOQ: {item.moq || 1} pcs</Text>
            </>
          ) : (
            <>
              <Text style={[styles.cardPrice, { color: COLORS.dark }]}>Rs. {Number(item.price).toLocaleString()}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap:3 }}>
                <Ionicons name="location-outline" size={10} color={COLORS.muted} />
                <Text style={styles.cardMoq}>{item.location || item.sellerCity || 'Pakistan'}</Text>
              </View>
            </>
          )}
        </View>
        <View style={styles.cardFooter}>
          {isB2B ? (
            <TouchableOpacity
              style={styles.btnSolid}
              onPress={() => addToCart({ id: item.id, name: item.title || item.name, price: item.price, img: item.img, type: 'b2b' })}
            >
              <Text style={styles.btnSolidTxt}>Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Messages')}>
              <Text style={styles.btnOutlineTxt}>Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterToggle}>
          <Ionicons name="options-outline" size={20} color={COLORS.dark} />
          <Text style={styles.filterToggleTxt}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={COLORS.muted} style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 8 }}>
              <Ionicons name="close-circle" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type Filter Tabs */}
      <View style={styles.typeTabs}>
        {[{ v:'', l:'All' },{ v:'b2b', l:'B2B Wholesale' },{ v:'c2c', l:'Used Items' }].map(t => (
          <TouchableOpacity
            key={t.v}
            style={[styles.typeTab, selType === t.v && styles.typeTabActive]}
            onPress={() => setSelType(t.v)}
          >
            <Text style={[styles.typeTabTxt, selType === t.v && styles.typeTabTxtActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        <TouchableOpacity
          style={[styles.catPill, selCat === '' && styles.catPillActive]}
          onPress={() => setSelCat('')}
        >
          <Text style={[styles.catPillTxt, selCat === '' && styles.catPillTxtActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catPill, selCat === c.id && styles.catPillActive]}
            onPress={() => setSelCat(c.id)}
          >
            <Text style={[styles.catPillTxt, selCat === c.id && styles.catPillTxtActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Row */}
      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>{filtered.length} products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {[{ v:'default', l:'Default' },{ v:'price-asc', l:'Price ↑' },{ v:'price-desc', l:'Price ↓' }].map(s => (
            <TouchableOpacity
              key={s.v}
              style={[styles.sortChip, sortBy === s.v && styles.sortChipActive]}
              onPress={() => setSortBy(s.v)}
            >
              <Text style={[styles.sortChipTxt, sortBy === s.v && styles.sortChipTxtActive]}>{s.l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.orange} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id || i._id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, gap: 12 }}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No products found</Text>
              <TouchableOpacity onPress={() => { setSelCat(''); setSelType(''); setQuery(''); }}>
                <Text style={{ color: COLORS.orange, fontWeight:'700', marginTop: 8 }}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor: COLORS.bodyBg },
  header:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: COLORS.border },
  headerTitle:  { fontSize:20, fontWeight:'900', color: COLORS.dark },
  filterToggle: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:12, paddingVertical:6, borderRadius: RADIUS.sm, backgroundColor: COLORS.bodyBg },
  filterToggleTxt: { fontSize:13, fontWeight:'700', color: COLORS.dark },
  searchWrap:   { paddingHorizontal:16, paddingVertical:10, backgroundColor:'#fff' },
  searchBar:    { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.bodyBg, borderRadius: RADIUS.md, borderWidth:1, borderColor: COLORS.border },
  searchInput:  { flex:1, paddingVertical:9, paddingHorizontal:8, fontSize:13, color: COLORS.text },
  typeTabs:     { flexDirection:'row', backgroundColor:'#fff', paddingHorizontal:16, paddingBottom:10, gap:8 },
  typeTab:      { paddingHorizontal:14, paddingVertical:6, borderRadius: RADIUS.full, borderWidth:1, borderColor: COLORS.border, backgroundColor:'#fff' },
  typeTabActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  typeTabTxt:   { fontSize:12, fontWeight:'700', color: COLORS.muted },
  typeTabTxtActive: { color:'#fff' },
  catRow:       { paddingHorizontal:16, paddingVertical:8, gap:8, backgroundColor:'#fff' },
  catPill:      { paddingHorizontal:14, paddingVertical:6, borderRadius: RADIUS.full, borderWidth:1, borderColor: COLORS.border, backgroundColor:'#fff' },
  catPillActive: { backgroundColor: COLORS.orangeLight, borderColor: COLORS.orange },
  catPillTxt:   { fontSize:12, fontWeight:'600', color: COLORS.muted },
  catPillTxtActive: { color: COLORS.orange },
  sortRow:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:8 },
  resultCount:  { fontSize:12, color: COLORS.muted, fontWeight:'600' },
  sortChip:     { paddingHorizontal:12, paddingVertical:5, borderRadius: RADIUS.full, borderWidth:1, borderColor: COLORS.border, backgroundColor:'#fff' },
  sortChipActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  sortChipTxt:  { fontSize:11, fontWeight:'700', color: COLORS.muted },
  sortChipTxtActive: { color:'#fff' },
  card:         { width: CARD_W, backgroundColor:'#fff', borderRadius: RADIUS.md, overflow:'hidden', borderWidth:1, borderColor: COLORS.border, ...SHADOW.sm },
  cardImgWrap:  { height: CARD_W * 0.75, position:'relative' },
  cardImg:      { width:'100%', height:'100%' },
  badge:        { position:'absolute', top:7, left:7, paddingHorizontal:7, paddingVertical:2, borderRadius:20 },
  badgeB2B:     { backgroundColor: COLORS.orange },
  badgeC2C:     { backgroundColor:'#0099cc' },
  badgeTxt:     { color:'#fff', fontSize:8, fontWeight:'800', textTransform:'uppercase' },
  wishBtn:      { position:'absolute', top:7, right:7, width:26, height:26, borderRadius:13, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', ...SHADOW.sm },
  cardBody:     { padding:10 },
  cardName:     { fontSize:12, fontWeight:'700', color: COLORS.text, lineHeight:16, marginBottom:5, minHeight:32 },
  cardPrice:    { fontSize:14, fontWeight:'900', color: COLORS.orange, marginBottom:2 },
  cardMoq:      { fontSize:10, color: COLORS.muted },
  cardFooter:   { paddingHorizontal:10, paddingBottom:10 },
  btnSolid:     { backgroundColor: COLORS.orange, paddingVertical:7, borderRadius: RADIUS.sm, alignItems:'center' },
  btnSolidTxt:  { color:'#fff', fontSize:11, fontWeight:'700' },
  btnOutline:   { borderWidth:1, borderColor: COLORS.orange, paddingVertical:6, borderRadius: RADIUS.sm, alignItems:'center' },
  btnOutlineTxt: { color: COLORS.orange, fontSize:11, fontWeight:'700' },
  loadingWrap:  { flex:1, alignItems:'center', justifyContent:'center', paddingTop:60 },
  emptyWrap:    { alignItems:'center', paddingTop:60 },
  emptyText:    { fontSize:15, fontWeight:'700', color: COLORS.muted, marginTop:12 },
});
