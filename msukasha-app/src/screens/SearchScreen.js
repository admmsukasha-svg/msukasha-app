import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet as SS, FlatList,
  TouchableOpacity, TextInput, Image, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as SC, RADIUS as SR, SHADOW as SSH } from '../constants';
import { addToCart, addToWishlist } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const ALL_PRODUCTS = [
  { id:'p1',  title:'Industrial Solar Panels 545W', price:120,     type:'b2b', img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400', location:'Karachi' },
  { id:'p2',  title:'Wholesale Cotton T-Shirts',    price:2.5,     type:'b2b', img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', location:'Faisalabad' },
  { id:'p3',  title:'Wireless Earbuds Bulk',        price:8.9,     type:'b2b', img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', location:'Karachi' },
  { id:'p9',  title:'Used iPhone 12 Pro 128GB',     price:135000,  type:'c2c', img:'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400', location:'DHA, Karachi' },
  { id:'p10', title:'Honda CD 70 2024 Model',       price:115000,  type:'c2c', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', location:'Lahore' },
  { id:'p12', title:'Nikon D5600 DSLR Camera',      price:75000,   type:'c2c', img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', location:'Peshawar' },
  { id:'p13', title:'Samsung Galaxy A54',           price:42000,   type:'c2c', img:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', location:'Lahore' },
  { id:'p7',  title:'FIFA Footballs Bulk Wholesale',price:850,     type:'b2b', img:'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400', location:'Sialkot' },
];

const RECENT_SEARCHES = ['iPhone', 'Solar Panels', 'Honda CD 70', 'T-Shirts', 'DSLR Camera'];
const TRENDING = ['iPhone 12', 'Wholesale T-Shirts', 'Honda CD 70', 'Solar Panels', 'DSLR Camera', 'Samsung A54'];

export default function SearchScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initQuery = route?.params?.query || '';
  const inputRef = useRef(null);

  const [query,   setQuery]   = useState(initQuery);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(!!initQuery);

  useEffect(() => {
    inputRef.current?.focus();
    if (initQuery) doSearch(initQuery);
  }, []);

  const doSearch = (q) => {
    if (!q.trim()) { setResults([]); setHasSearched(false); return; }
    const lower = q.toLowerCase();
    const found = ALL_PRODUCTS.filter(p =>
      (p.title || '').toLowerCase().includes(lower) ||
      (p.location || '').toLowerCase().includes(lower)
    );
    setResults(found);
    setHasSearched(true);
  };

  const renderResult = ({ item }) => {
    const isB2B = item.type === 'b2b';
    return (
      <TouchableOpacity
        style={ss.card}
        onPress={() => navigation.navigate('ProductDetail', { id: item.id, type: item.type })}
        activeOpacity={0.9}
      >
        <View style={ss.cardImgWrap}>
          <Image source={{ uri: item.img }} style={ss.cardImg} resizeMode="cover" />
          <View style={[ss.badge, isB2B ? ss.badgeB2B : ss.badgeC2C]}>
            <Text style={ss.badgeTxt}>{isB2B ? 'B2B' : 'USED'}</Text>
          </View>
          <TouchableOpacity
            style={ss.wishBtn}
            onPress={() => addToWishlist({ id: item.id, name: item.title, price: item.price, img: item.img, type: item.type })}
          >
            <Ionicons name="heart-outline" size={13} color={SC.orange} />
          </TouchableOpacity>
        </View>
        <View style={ss.cardBody}>
          <Text style={ss.cardName} numberOfLines={2}>{item.title}</Text>
          <Text style={ss.cardPrice}>
            {isB2B ? `$${Number(item.price).toFixed(2)}/pc` : `Rs. ${Number(item.price).toLocaleString()}`}
          </Text>
          <View style={ss.locRow}>
            <Ionicons name="location-outline" size={10} color={SC.muted} />
            <Text style={ss.locTxt}>{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[ss.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={ss.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color={SC.dark} />
        </TouchableOpacity>
        <View style={ss.inputWrap}>
          <Ionicons name="search-outline" size={16} color={SC.muted} style={{ marginLeft: 10 }} />
          <TextInput
            ref={inputRef}
            style={ss.input}
            placeholder="Search products, brands, suppliers..."
            placeholderTextColor={SC.muted}
            value={query}
            onChangeText={q => { setQuery(q); if (!q.trim()) { setResults([]); setHasSearched(false); } }}
            onSubmitEditing={() => doSearch(query)}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }} style={{ padding: 8 }}>
              <Ionicons name="close-circle" size={16} color={SC.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={ss.searchBtn} onPress={() => doSearch(query)}>
          <Text style={ss.searchBtnTxt}>Search</Text>
        </TouchableOpacity>
      </View>

      {!hasSearched ? (
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          ListHeaderComponent={() => (
            <View style={{ padding: 16 }}>
              {/* Recent */}
              <View style={ss.section}>
                <View style={ss.sectionHeader}>
                  <Text style={ss.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity><Text style={ss.clearTxt}>Clear</Text></TouchableOpacity>
                </View>
                <View style={ss.pills}>
                  {RECENT_SEARCHES.map((r, i) => (
                    <TouchableOpacity key={i} style={ss.pill} onPress={() => { setQuery(r); doSearch(r); }}>
                      <Ionicons name="time-outline" size={13} color={SC.muted} />
                      <Text style={ss.pillTxt}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Trending */}
              <View style={ss.section}>
                <Text style={ss.sectionTitle}>Trending on MSukasha</Text>
                <View style={ss.pills}>
                  {TRENDING.map((t, i) => (
                    <TouchableOpacity key={i} style={[ss.pill, ss.trendPill]} onPress={() => { setQuery(t); doSearch(t); }}>
                      <Ionicons name="trending-up-outline" size={13} color={SC.orange} />
                      <Text style={[ss.pillTxt, { color: SC.orange }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
          renderItem={() => null}
        />
      ) : (
        <>
          <View style={ss.resultsHeader}>
            <Text style={ss.resultsTxt}>
              {results.length > 0 ? `${results.length} results for "${query}"` : `No results for "${query}"`}
            </Text>
          </View>
          {results.length === 0 ? (
            <View style={ss.emptyWrap}>
              <Ionicons name="search-outline" size={52} color={SC.border} />
              <Text style={ss.emptyTitle}>No products found</Text>
              <Text style={ss.emptySub}>Try different keywords or browse categories</Text>
              <TouchableOpacity style={ss.browseBtn} onPress={() => navigation.navigate('Categories')}>
                <Text style={ss.browseBtnTxt}>Browse Categories</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={i => i.id}
              numColumns={2}
              columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, gap: 12 }}
              renderItem={renderResult}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
}

const ss = SS.create({
  container:    { flex: 1, backgroundColor: SC.bodyBg },
  searchBar:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: SC.border },
  inputWrap:    { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: SC.bodyBg, borderRadius: SR.md, borderWidth: 1, borderColor: SC.border },
  input:        { flex: 1, paddingVertical: 9, paddingHorizontal: 8, fontSize: 14, color: SC.text },
  searchBtn:    { marginLeft: 8, backgroundColor: SC.orange, paddingHorizontal: 14, paddingVertical: 9, borderRadius: SR.sm },
  searchBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  section:      { marginBottom: 24 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: SC.dark },
  clearTxt:     { fontSize: 13, color: SC.orange, fontWeight: '700' },
  pills:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: SC.border, backgroundColor: '#fff' },
  trendPill:    { backgroundColor: SC.orangeLight, borderColor: SC.orange },
  pillTxt:      { fontSize: 12, fontWeight: '600', color: SC.muted },
  resultsHeader:{ paddingHorizontal: 16, paddingVertical: 10 },
  resultsTxt:   { fontSize: 13, color: SC.muted, fontWeight: '600' },
  emptyWrap:    { alignItems: 'center', paddingTop: 60, padding: 32 },
  emptyTitle:   { fontSize: 18, fontWeight: '800', color: SC.dark, marginTop: 14, marginBottom: 6 },
  emptySub:     { fontSize: 14, color: SC.muted, textAlign: 'center', marginBottom: 20 },
  browseBtn:    { backgroundColor: SC.orange, paddingHorizontal: 24, paddingVertical: 12, borderRadius: SR.md },
  browseBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  card:         { width: CARD_W, backgroundColor: '#fff', borderRadius: SR.md, overflow: 'hidden', borderWidth: 1, borderColor: SC.border },
  cardImgWrap:  { height: CARD_W * 0.7, position: 'relative' },
  cardImg:      { width: '100%', height: '100%' },
  badge:        { position: 'absolute', top: 7, left: 7, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  badgeB2B:     { backgroundColor: SC.orange },
  badgeC2C:     { backgroundColor: '#0099cc' },
  badgeTxt:     { color: '#fff', fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  wishBtn:      { position: 'absolute', top: 7, right: 7, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cardBody:     { padding: 10 },
  cardName:     { fontSize: 12, fontWeight: '700', color: SC.dark, lineHeight: 16, marginBottom: 4, minHeight: 32 },
  cardPrice:    { fontSize: 14, fontWeight: '900', color: SC.orange, marginBottom: 3 },
  locRow:       { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locTxt:       { fontSize: 10, color: SC.muted },
});
