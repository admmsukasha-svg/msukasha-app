import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, RefreshControl, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW } from '../constants';
import { apiGetAds, addToWishlist, getUser } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const STATIC_ADS = [
  { id:'p9',  title:'Used iPhone 12 Pro 128GB',        price:135000, category:'Electronics', location:'DHA, Karachi',      img:'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400', condition:'Excellent', time:'2h ago' },
  { id:'p10', title:'Honda CD 70 2024 Model',          price:115000, category:'Vehicles',    location:'Johar Town, Lahore', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', condition:'Good',      time:'5h ago' },
  { id:'p11', title:'Office Desk & Chair Set',         price:12000,  category:'Home',        location:'G-11, Islamabad',    img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', condition:'Good',      time:'1d ago' },
  { id:'p12', title:'Nikon D5600 DSLR Camera',        price:75000,  category:'Electronics', location:'Peshawar Cantt',     img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', condition:'Like New',  time:'1d ago' },
  { id:'p13', title:'Samsung Galaxy A54 8GB',         price:42000,  category:'Electronics', location:'Gulberg, Lahore',    img:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', condition:'Good',      time:'2d ago' },
  { id:'p14', title:'Leather Sofa Set 5-Seater',      price:45000,  category:'Home',        location:'DHA, Lahore',        img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', condition:'Excellent', time:'2d ago' },
  { id:'p15', title:'Suzuki Mehran 2020 First Owner', price:1250000,category:'Vehicles',    location:'Clifton, Karachi',   img:'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400', condition:'Excellent', time:'3d ago' },
  { id:'p16', title:'Rowing Machine Barely Used',     price:18000,  category:'Sports',      location:'F-8, Islamabad',     img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', condition:'Like New',  time:'3d ago' },
];

const FILTER_CATS = ['All','Electronics','Vehicles','Home','Fashion','Sports','Books'];

export default function C2CScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [ads,        setAds]       = useState(STATIC_ADS);
  const [filtered,   setFiltered]  = useState(STATIC_ADS);
  const [selCat,     setSelCat]    = useState('All');
  const [query,      setQuery]     = useState('');
  const [sortBy,     setSortBy]    = useState('newest');
  const [refreshing, setRefreshing]= useState(false);
  const [user,       setUser]      = useState(null);

  useEffect(() => {
    loadAds();
    (async () => setUser(await getUser()))();
  }, []);

  useEffect(() => { applyFilter(); }, [selCat, query, sortBy, ads]);

  const loadAds = async () => {
    try {
      const data = await apiGetAds({ limit: 50 });
      if (data.ads?.length) {
        setAds(data.ads.map(a => ({ ...a, id: a._id, img: a.images?.[0] || '' })));
      }
    } catch {}
  };

  const applyFilter = () => {
    let list = [...ads];
    if (selCat !== 'All') list = list.filter(a => (a.category || '').toLowerCase().includes(selCat.toLowerCase()));
    if (query) list = list.filter(a => (a.title || '').toLowerCase().includes(query.toLowerCase()));
    if (sortBy === 'price-asc')  list.sort((a,b) => a.price - b.price);
    if (sortBy === 'price-desc') list.sort((a,b) => b.price - a.price);
    setFiltered(list);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAds();
    setRefreshing(false);
  }, []);

  const renderAd = ({ item }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id || item._id, type: 'c2c' })}
      activeOpacity={0.9}
    >
      <View style={s.cardImgWrap}>
        <Image
          source={{ uri: item.img || 'https://via.placeholder.com/200' }}
          style={s.cardImg}
          resizeMode="cover"
        />
        <View style={s.usedBadge}>
          <Text style={s.usedBadgeTxt}>USED</Text>
        </View>
        <TouchableOpacity
          style={s.wishBtn}
          onPress={() => addToWishlist({ id: item.id, name: item.title, price: item.price, img: item.img, type: 'c2c' })}
        >
          <Ionicons name="heart-outline" size={14} color={COLORS.orange} />
        </TouchableOpacity>
        {item.condition && (
          <View style={s.condBadge}>
            <Text style={s.condBadgeTxt}>{item.condition}</Text>
          </View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={2}>{item.title}</Text>
        <Text style={s.cardPrice}>Rs. {Number(item.price).toLocaleString()}</Text>
        <View style={s.locRow}>
          <Ionicons name="location-outline" size={11} color={COLORS.muted} />
          <Text style={s.locTxt} numberOfLines={1}>{item.location || item.sellerCity}</Text>
        </View>
        {item.time && <Text style={s.timeTxt}>{item.time}</Text>}
      </View>
      <View style={s.cardFooter}>
        <TouchableOpacity style={s.msgBtn} onPress={() => navigation.navigate('Messages')}>
          <Ionicons name="chatbubble-outline" size={13} color={COLORS.blue} />
          <Text style={s.msgBtnTxt}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.callBtn}>
          <Ionicons name="call-outline" size={13} color="#fff" />
          <Text style={s.callBtnTxt}>Call</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Used Items (C2C)</Text>
        <TouchableOpacity
          style={s.postBtn}
          onPress={() => user ? navigation.navigate('PostAd') : navigation.navigate('Login', { redirectTo: 'PostAd' })}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={s.postBtnTxt}>Post Ad</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={16} color={COLORS.muted} style={{ marginLeft: 10 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search used items..."
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

      {/* Category Filter */}
      <FlatList
        horizontal
        data={FILTER_CATS}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.catPill, selCat === item && s.catPillActive]}
            onPress={() => setSelCat(item)}
          >
            <Text style={[s.catPillTxt, selCat === item && s.catPillTxtActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Sort + Count */}
      <View style={s.sortRow}>
        <Text style={s.countTxt}>{filtered.length} listings</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[{v:'newest',l:'Latest'},{v:'price-asc',l:'Price ↑'},{v:'price-desc',l:'Price ↓'}].map(o => (
            <TouchableOpacity
              key={o.v}
              style={[s.sortChip, sortBy === o.v && s.sortChipActive]}
              onPress={() => setSortBy(o.v)}
            >
              <Text style={[s.sortChipTxt, sortBy === o.v && s.sortChipTxtActive]}>{o.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id || i._id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, gap: 12 }}
        renderItem={renderAd}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}
        ListEmptyComponent={() => (
          <View style={s.emptyWrap}>
            <Ionicons name="search-outline" size={48} color={COLORS.border} />
            <Text style={s.emptyTxt}>No listings found</Text>
            <TouchableOpacity onPress={() => { setSelCat('All'); setQuery(''); }}>
              <Text style={{ color: COLORS.orange, fontWeight: '700', marginTop: 8 }}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bodyBg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  postBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.orange, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.sm },
  postBtnTxt:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput:  { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: COLORS.text },
  catRow:       { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  catPill:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  catPillActive:{ backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  catPillTxt:   { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  catPillTxtActive: { color: '#fff' },
  sortRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  countTxt:     { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  sortChip:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  sortChipActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  sortChipTxt:  { fontSize: 11, fontWeight: '700', color: COLORS.muted },
  sortChipTxtActive: { color: '#fff' },
  card:         { width: CARD_W, backgroundColor: '#fff', borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  cardImgWrap:  { height: CARD_W * 0.75, position: 'relative' },
  cardImg:      { width: '100%', height: '100%' },
  usedBadge:    { position: 'absolute', top: 7, left: 7, backgroundColor: '#0099cc', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  usedBadgeTxt: { color: '#fff', fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  wishBtn:      { position: 'absolute', top: 7, right: 7, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  condBadge:    { position: 'absolute', bottom: 7, left: 7, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  condBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },
  cardBody:     { padding: 10 },
  cardName:     { fontSize: 12, fontWeight: '700', color: COLORS.dark, lineHeight: 16, marginBottom: 4, minHeight: 32 },
  cardPrice:    { fontSize: 14, fontWeight: '900', color: COLORS.dark, marginBottom: 4 },
  locRow:       { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locTxt:       { fontSize: 10, color: COLORS.muted, flex: 1 },
  timeTxt:      { fontSize: 9, color: COLORS.muted, marginTop: 3 },
  cardFooter:   { flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingBottom: 10 },
  msgBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.blue, paddingVertical: 6, borderRadius: RADIUS.sm },
  msgBtnTxt:    { color: COLORS.blue, fontSize: 11, fontWeight: '700' },
  callBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: COLORS.orange, paddingVertical: 6, borderRadius: RADIUS.sm },
  callBtnTxt:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyWrap:    { alignItems: 'center', paddingTop: 48 },
  emptyTxt:     { fontSize: 15, fontWeight: '700', color: COLORS.muted, marginTop: 10 },
});
