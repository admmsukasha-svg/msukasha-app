import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, FlatList, RefreshControl,
  Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES, RADIUS, SHADOW } from '../constants';
import { apiGetProducts, apiGetAds, getUser, addToCart, addToWishlist } from '../services/api';

const { width } = Dimensions.get('window');

/* ── Reusable Components ── */
const ProductCard = ({ item, onPress, onCart, onWishlist }) => (
  <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.92}>
    <View style={styles.cardImg}>
      <Image
        source={{ uri: item.img || item.images?.[0] }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={[styles.badge, item.type === 'b2b' ? styles.badgeB2B : styles.badgeUsed]}>
        <Text style={styles.badgeText}>{item.type === 'b2b' ? 'B2B' : 'USED'}</Text>
      </View>
      <TouchableOpacity style={styles.wishBtn} onPress={onWishlist}>
        <Ionicons name="heart-outline" size={16} color={COLORS.orange} />
      </TouchableOpacity>
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.cardName} numberOfLines={2}>{item.name || item.title}</Text>
      {item.type === 'b2b' ? (
        <>
          <Text style={styles.cardPrice}>${Number(item.price).toFixed(2)}{item.unit || '/pc'}</Text>
          <Text style={styles.cardMoq}>MOQ: {item.moq || 1} pcs</Text>
        </>
      ) : (
        <>
          <Text style={[styles.cardPrice, { color: COLORS.dark }]}>
            Rs. {Number(item.price).toLocaleString()}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={11} color={COLORS.muted} />
            <Text style={styles.locationText}>{item.location || item.sellerCity || 'Pakistan'}</Text>
          </View>
        </>
      )}
    </View>
    <View style={styles.cardFooter}>
      {item.type === 'b2b' ? (
        <TouchableOpacity style={styles.cardBtnSolid} onPress={onCart}>
          <Text style={styles.cardBtnSolidText}>Add to Cart</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.cardBtnOutline}>
          <Text style={styles.cardBtnOutlineText}>Message Seller</Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

const CategoryChip = ({ item, onPress }) => (
  <TouchableOpacity style={styles.catChip} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.catChipIcon}>
      <Ionicons name={item.icon} size={22} color={COLORS.orange} />
    </View>
    <Text style={styles.catChipLabel}>{item.label}</Text>
  </TouchableOpacity>
);

/* ── Static fallback products ── */
const STATIC_B2B = [
  { id:'p1', title:'Industrial Solar Panels 545W', price:120, unit:'/pc', moq:10, type:'b2b', img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400' },
  { id:'p2', title:'Wholesale Cotton T-Shirts', price:2.5, unit:'/pc', moq:100, type:'b2b', img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  { id:'p3', title:'Wireless Earbuds Bulk Export', price:8.9, unit:'/pc', moq:50, type:'b2b', img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
  { id:'p4', title:'Custom Logo Power Banks 10000mAh', price:5.2, unit:'/pc', moq:20, type:'b2b', img:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400' },
];
const STATIC_C2C = [
  { id:'p9', title:'Used iPhone 12 Pro 128GB', price:135000, type:'c2c', location:'DHA, Karachi', img:'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400' },
  { id:'p10', title:'Honda CD 70 2024 Model', price:115000, type:'c2c', location:'Johar Town, Lahore', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { id:'p12', title:'Nikon D5600 DSLR Camera', price:75000, type:'c2c', location:'Peshawar Cantt', img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' },
  { id:'p13', title:'Samsung Galaxy A54 8GB', price:42000, type:'c2c', location:'Gulberg, Lahore', img:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400' },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [b2bProducts, setB2bProducts] = useState(STATIC_B2B);
  const [c2cAds,      setC2cAds]      = useState(STATIC_C2C);
  const [refreshing,  setRefreshing]  = useState(false);
  const [user,        setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadUser = async () => {
    const u = await getUser();
    setCurrentUser(u);
  };

  const loadData = async () => {
    try {
      const [prodData, adsData] = await Promise.all([
        apiGetProducts({ type: 'b2b', limit: 6 }),
        apiGetAds({ limit: 6 }),
      ]);
      if (prodData.products?.length) setB2bProducts(prodData.products);
      if (adsData.ads?.length)       setC2cAds(adsData.ads);
    } catch {
      /* Use static fallback */
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleAddToCart = async (item) => {
    await addToCart({ id: item.id || item._id, name: item.title || item.name, price: item.price, img: item.img || item.images?.[0], type: item.type });
    // Show toast
  };

  const handleWishlist = async (item) => {
    await addToWishlist({ id: item.id || item._id, name: item.title || item.name, price: item.price, img: item.img || item.images?.[0], type: item.type });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      {/* Header */}
      <LinearGradient colors={[COLORS.dark, '#2d4a6e']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>
              {user ? `Hello, ${user.name?.split(' ')[0]} 👋` : 'Pakistan\'s #1 Marketplace'}
            </Text>
            <Text style={styles.headerSub}>Buy wholesale. Sell locally.</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.navigate('Wishlist')}
            >
              <Ionicons name="heart-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="cart-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, suppliers..."
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}
      >
        {/* Hero Banner */}
        <LinearGradient colors={['#1a2332', '#2d4a6e']} style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Ionicons name="star" size={12} color="#ffaa66" />
            <Text style={styles.heroBadgeText}>Pakistan's Smartest Trading Hub</Text>
          </View>
          <Text style={styles.heroTitle}>Buy Wholesale.{'\n'}
            <Text style={{ color: COLORS.orange }}>Sell Locally.</Text>{'\n'}
            Trade Confidently.
          </Text>
          <Text style={styles.heroSub}>
            Source bulk goods from verified factories or sell your used items to buyers near you.
          </Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.heroBtnPrimary}
              onPress={() => navigation.navigate('Shop')}
            >
              <Ionicons name="storefront-outline" size={16} color="#fff" />
              <Text style={styles.heroBtnPrimaryText}>Explore Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroBtnOutline}
              onPress={() => {
                if (!user) { navigation.navigate('Login'); return; }
                navigation.navigate('PostAd');
              }}
            >
              <Ionicons name="camera-outline" size={16} color="#fff" />
              <Text style={styles.heroBtnOutlineText}>Post Free Ad</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          {[
            { num: '50K+',   label: 'Suppliers' },
            { num: '200K+',  label: 'Listings' },
            { num: '1.2M+',  label: 'Users' },
            { num: '100+',   label: 'Cities' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={i => i.id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            renderItem={({ item }) => (
              <CategoryChip
                item={item}
                onPress={() => navigation.navigate('Shop', { cat: item.id })}
              />
            )}
          />
        </View>

        {/* B2B Wholesale */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wholesale Essentials (B2B)</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shop', { type: 'b2b' })}>
              <Text style={styles.seeAll}>See More →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={b2bProducts}
            keyExtractor={i => i.id || i._id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                onPress={() => navigation.navigate('ProductDetail', { id: item.id || item._id, type: 'b2b' })}
                onCart={() => handleAddToCart(item)}
                onWishlist={() => handleWishlist(item)}
              />
            )}
          />
        </View>

        {/* C2C Promo Banner */}
        <TouchableOpacity
          style={styles.promoBanner}
          onPress={() => user ? navigation.navigate('PostAd') : navigation.navigate('Login')}
          activeOpacity={0.9}
        >
          <LinearGradient colors={['#1a2332', '#2d3a4a']} style={styles.promoBannerInner}>
            <View style={styles.promoContent}>
              <View>
                <Text style={styles.promoTitle}>
                  <Ionicons name="camera-outline" size={18} color={COLORS.orange} /> Got Something to Sell?
                </Text>
                <Text style={styles.promoSub}>
                  List your used items and reach thousands of buyers near you — 100% free!
                </Text>
              </View>
              <View style={styles.promoCTA}>
                <Ionicons name="add-circle" size={14} color="#fff" />
                <Text style={styles.promoCTAText}>Post Free Ad</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* C2C Local Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: COLORS.blue }]}>Local Deals (C2C)</Text>
            <TouchableOpacity onPress={() => navigation.navigate('C2C')}>
              <Text style={[styles.seeAll, { color: COLORS.blue }]}>View All →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={c2cAds}
            keyExtractor={i => i.id || i._id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                onPress={() => navigation.navigate('ProductDetail', { id: item.id || item._id, type: 'c2c' })}
                onCart={() => {}}
                onWishlist={() => handleWishlist(item)}
              />
            )}
          />
        </View>

        {/* Why MSukasha */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why MSukasha?</Text>
          <View style={styles.whyGrid}>
            {[
              { icon: 'shield-checkmark-outline', text: 'Verified B2B Suppliers' },
              { icon: 'lock-closed-outline',      text: 'Secure C2C Deals' },
              { icon: 'headset-outline',          text: '24/7 Dispute Support' },
              { icon: 'card-outline',             text: 'Trade Assurance' },
              { icon: 'cube-outline',             text: 'Nationwide Logistics' },
              { icon: 'ribbon-outline',           text: 'SECP Registered' },
            ].map((item, i) => (
              <View key={i} style={styles.whyItem}>
                <View style={styles.whyIcon}>
                  <Ionicons name={item.icon} size={20} color={COLORS.orange} />
                </View>
                <Text style={styles.whyText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = width * 0.55;

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bodyBg },
  header:       { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 10 },
  headerTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerGreeting: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1.5, borderColor: COLORS.orange },
  searchInput:  { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: COLORS.text },
  searchBtn:    { backgroundColor: COLORS.orange, paddingHorizontal: 16, paddingVertical: 10 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  heroBanner:   { margin: 16, borderRadius: RADIUS.lg, padding: 24, position: 'relative', overflow: 'hidden' },
  heroBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,102,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 14 },
  heroBadgeText: { color: '#ffaa66', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroTitle:    { fontSize: 24, fontWeight: '900', color: '#fff', lineHeight: 32, marginBottom: 10 },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 20 },
  heroButtons:  { flexDirection: 'row', gap: 10 },
  heroBtnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.orange, paddingHorizontal: 18, paddingVertical: 11, borderRadius: RADIUS.md },
  heroBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  heroBtnOutline: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md },
  heroBtnOutlineText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  statsBar:     { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: RADIUS.md, padding: 16, marginBottom: 8, ...SHADOW.sm },
  statItem:     { flex: 1, alignItems: 'center' },
  statNum:      { fontSize: 16, fontWeight: '900', color: COLORS.orange },
  statLabel:    { fontSize: 10, color: COLORS.muted, marginTop: 2 },

  section:      { marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  seeAll:       { fontSize: 13, color: COLORS.orange, fontWeight: '700' },

  catChip:      { alignItems: 'center', width: 76 },
  catChipIcon:  { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  catChipLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

  productCard:  { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  cardImg:      { height: CARD_WIDTH * 0.75, position: 'relative' },
  cardImage:    { width: '100%', height: '100%' },
  badge:        { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeB2B:     { backgroundColor: COLORS.orange },
  badgeUsed:    { backgroundColor: '#0099cc' },
  badgeText:    { color: '#fff', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  wishBtn:      { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  cardBody:     { padding: 10 },
  cardName:     { fontSize: 12, fontWeight: '700', color: COLORS.text, lineHeight: 17, marginBottom: 5, minHeight: 34 },
  cardPrice:    { fontSize: 15, fontWeight: '900', color: COLORS.orange, marginBottom: 2 },
  cardMoq:      { fontSize: 10, color: COLORS.muted },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  locationText: { fontSize: 10, color: COLORS.muted },
  cardFooter:   { paddingHorizontal: 10, paddingBottom: 10 },
  cardBtnSolid: { backgroundColor: COLORS.orange, paddingVertical: 8, borderRadius: RADIUS.sm, alignItems: 'center' },
  cardBtnSolidText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cardBtnOutline: { borderWidth: 1, borderColor: COLORS.orange, paddingVertical: 7, borderRadius: RADIUS.sm, alignItems: 'center' },
  cardBtnOutlineText: { color: COLORS.orange, fontSize: 12, fontWeight: '700' },

  promoBanner:  { marginHorizontal: 16, marginVertical: 8, borderRadius: RADIUS.lg, overflow: 'hidden' },
  promoBannerInner: { padding: 20 },
  promoContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  promoTitle:   { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 5 },
  promoSub:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', maxWidth: width * 0.55, lineHeight: 17 },
  promoCTA:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.orange, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.md },
  promoCTAText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  whyGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginTop: 4 },
  whyItem:      { width: (width - 52) / 3, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  whyIcon:      { marginBottom: 7 },
  whyText:      { fontSize: 10, color: COLORS.muted, textAlign: 'center', fontWeight: '600', lineHeight: 14 },
});
