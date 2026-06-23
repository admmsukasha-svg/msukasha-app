import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, FlatList, Alert, Share,
  ActivityIndicator, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW } from '../constants';
import { apiGetProduct, addToCart, addToWishlist, getUser } from '../services/api';

const { width } = Dimensions.get('window');

const STATIC_PRODUCTS = {
  p1: { id:'p1', title:'Industrial Solar Panels 545W Mono PERC', price:120, unit:'/pc', moq:10, type:'b2b', cat:'industrial', location:'Karachi', imgs:['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800','https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800'], desc:'High efficiency 545W mono PERC solar panels for industrial and commercial use. Bulk pricing available with custom configurations.', seller:'TechExport Pakistan', sellerCity:'Karachi', verified:true, rating:4.9, reviews:32, specs:{ Brand:'TechExport', Wattage:'545W', Type:'Mono PERC', Efficiency:'21.3%', Warranty:'10 Year' } },
  p2: { id:'p2', title:'Wholesale Cotton Plain T-Shirts (Pack of 50)', price:2.5, unit:'/pc', moq:100, type:'b2b', cat:'fashion', location:'Faisalabad', imgs:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800','https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'], desc:'Premium quality 180 GSM cotton plain t-shirts for wholesale. Available in all sizes and custom colors.', seller:'Faisalabad Fabrics', sellerCity:'Faisalabad', verified:true, rating:4.8, reviews:58, specs:{ Material:'100% Cotton', GSM:'180', Sizes:'XS-5XL', Colors:'All available' } },
  p3: { id:'p3', title:'Professional Wireless Earbuds — Bulk Export Grade', price:8.9, unit:'/pc', moq:50, type:'b2b', cat:'electronics', location:'Karachi', imgs:['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'], desc:'Export quality TWS wireless earbuds. Bluetooth 5.3, 30hr total battery, IPX5 waterproof. OEM branding available.', seller:'TechExport Pakistan', sellerCity:'Karachi', verified:true, rating:4.7, reviews:21, specs:{ Bluetooth:'5.3', Battery:'30hr total', Waterproof:'IPX5' } },
  p9: { id:'p9', title:'Used iPhone 12 Pro — 128GB', price:135000, unit:'', moq:1, type:'c2c', condition:'Excellent (9/10)', location:'DHA, Karachi', imgs:['https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800','https://images.unsplash.com/photo-1592286927505-1def25115558?w=800'], desc:'iPhone 12 Pro 128GB in excellent condition. Battery health 87%. Factory unlocked, comes with original box.', seller:'Ahmed Khan', sellerCity:'DHA, Karachi', sellerPhone:'+92 300 0000000', verified:false, rating:4.8, reviews:12, specs:{ Model:'iPhone 12 Pro', Storage:'128GB', BatteryHealth:'87%', Network:'Unlocked' } },
  p10: { id:'p10', title:'Honda CD 70 — 2024 Model', price:115000, unit:'', moq:1, type:'c2c', condition:'Good (8/10)', location:'Johar Town, Lahore', imgs:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], desc:'Honda CD 70 2024, first owner, only 5,000 km. Documents 100% clear.', seller:'Bilal Ahmed', sellerCity:'Lahore', sellerPhone:'+92 321 0000000', verified:false, rating:4.7, reviews:8, specs:{ Brand:'Honda', Model:'CD 70', Year:'2024', KMs:'5,000' } },
  p12: { id:'p12', title:'Nikon D5600 DSLR + 18-55mm Lens', price:75000, unit:'', moq:1, type:'c2c', condition:'Like New (10/10)', location:'Peshawar Cantt', imgs:['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800','https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800'], desc:'Nikon D5600 DSLR with 18-55mm VR lens. Very low shutter count (~3,200). Like new condition.', seller:'Imran Photographer', sellerCity:'Peshawar', sellerPhone:'+92 333 0000000', verified:false, rating:4.9, reviews:15, specs:{ Brand:'Nikon', Model:'D5600', Sensor:'24.2MP', ShutterCount:'~3,200' } },
};

export default function ProductDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { id, type } = route.params || {};
  const scrollX = useRef(new Animated.Value(0)).current;

  const [product,    setProduct]   = useState(null);
  const [loading,    setLoading]   = useState(false);
  const [qty,        setQty]       = useState(1);
  const [activeTab,  setActiveTab] = useState('desc');
  const [inWishlist, setInWishlist] = useState(false);
  const [user,       setUser]      = useState(null);
  const [imgIndex,   setImgIndex]  = useState(0);

  useEffect(() => {
    loadProduct();
    loadUser();
  }, [id]);

  const loadUser = async () => {
    const u = await getUser();
    setUser(u);
  };

  const loadProduct = async () => {
    // Try static first
    if (STATIC_PRODUCTS[id]) {
      setProduct(STATIC_PRODUCTS[id]);
      return;
    }
    // Try backend
    setLoading(true);
    try {
      const data = await apiGetProduct(id);
      if (data.product) {
        const p = data.product;
        setProduct({
          id: p._id, title: p.title, price: p.price,
          unit: p.unit, moq: p.moq, type: p.type,
          imgs: p.images || [], desc: p.description,
          seller: p.sellerName, sellerCity: p.sellerCity,
          verified: false, rating: 4.5, reviews: 0,
          specs: {},
        });
      }
    } catch { /* show not found */ }
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to login to add items to cart.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login', { redirectTo: 'Cart' }) },
        ]
      );
      return;
    }
    await addToCart({
      id: product.id, name: product.title,
      price: product.price, img: product.imgs?.[0],
      type: product.type, unit: product.unit, qty,
    });
    Alert.alert('Added to Cart', `${product.title} added to your cart.`);
  };

  const handleWishlist = async () => {
    await addToWishlist({
      id: product.id, name: product.title,
      price: product.price, img: product.imgs?.[0], type: product.type,
    });
    setInWishlist(true);
  };

  const handleShare = async () => {
    await Share.share({
      message: `Check out ${product.title} on MSukasha — Rs. ${product.price.toLocaleString()}\nhttps://msukasha.com`,
    });
  };

  const handleBuy = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to login to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login', { redirectTo: 'Checkout' }) },
        ]
      );
      return;
    }
    navigation.navigate('Checkout', { product, qty });
  };

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={52} color={COLORS.border} />
        <Text style={styles.notFoundTxt}>Product not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackBtn}>
          <Text style={styles.goBackTxt}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isB2B = product.type === 'b2b';
  const imgs  = product.imgs?.length ? product.imgs : ['https://via.placeholder.com/400'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{product.title}</Text>
        <View style={{ flexDirection:'row', gap:6 }}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={COLORS.dark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={handleWishlist}>
            <Ionicons name={inWishlist ? 'heart' : 'heart-outline'} size={22} color={inWishlist ? COLORS.orange : COLORS.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imgWrap}>
          <FlatList
            data={imgs}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={e => {
              setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.mainImg} resizeMode="cover" />
            )}
          />
          {/* Dot indicators */}
          {imgs.length > 1 && (
            <View style={styles.dots}>
              {imgs.map((_, i) => (
                <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
              ))}
            </View>
          )}
          {/* Badge */}
          <View style={[styles.badge, isB2B ? styles.badgeB2B : styles.badgeC2C]}>
            <Text style={styles.badgeTxt}>{isB2B ? 'B2B Wholesale' : 'Used Item'}</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoWrap}>
          {/* Title & Rating */}
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(i => (
                <Ionicons key={i} name={i <= Math.round(product.rating) ? 'star' : 'star-outline'} size={14} color={COLORS.yellow} />
              ))}
            </View>
            <Text style={styles.ratingTxt}>{product.rating} ({product.reviews} reviews)</Text>
          </View>

          {/* Price */}
          {isB2B ? (
            <View style={styles.priceRow}>
              <Text style={styles.price}>${Number(product.price).toFixed(2)}{product.unit || '/pc'}</Text>
              <View style={styles.moqBadge}>
                <Text style={styles.moqTxt}>MOQ: {product.moq || 1} pcs</Text>
              </View>
            </View>
          ) : (
            <View>
              {product.condition && (
                <View style={styles.conditionBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                  <Text style={styles.conditionTxt}>{product.condition}</Text>
                </View>
              )}
              <Text style={styles.priceC2C}>Rs. {Number(product.price).toLocaleString()}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.orange} />
                <Text style={styles.locationTxt}>{product.location || product.sellerCity}</Text>
              </View>
            </View>
          )}

          {/* Qty selector (B2B only) */}
          {isB2B && (
            <View style={styles.qtyWrap}>
              <Text style={styles.qtyLabel}>Order Quantity:</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQty(Math.max(product.moq || 1, qty - 1))}
                >
                  <Ionicons name="remove" size={18} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
                  <Ionicons name="add" size={18} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.totalTxt}>
                  Total: <Text style={{ color: COLORS.orange, fontWeight:'900' }}>
                    ${(product.price * qty).toFixed(2)}
                  </Text>
                </Text>
              </View>
            </View>
          )}

          {/* Seller Card */}
          <View style={styles.sellerCard}>
            <View style={[styles.sellerAvatar, { backgroundColor: isB2B ? COLORS.orange : COLORS.blue }]}>
              <Text style={styles.sellerAvatarTxt}>{(product.seller || 'S').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={styles.sellerName}>{product.seller || 'Verified Seller'}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                <Ionicons name="location-outline" size={12} color={COLORS.muted} />
                <Text style={styles.sellerCity}>{product.sellerCity || 'Pakistan'}</Text>
                {product.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={11} color="#15803d" />
                    <Text style={styles.verifiedTxt}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Messages')}
            >
              <Ionicons name="chatbubble-outline" size={16} color={COLORS.orange} />
              <Text style={styles.chatBtnTxt}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {['desc','specs'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, activeTab === t && styles.tabActive]}
                onPress={() => setActiveTab(t)}
              >
                <Text style={[styles.tabTxt, activeTab === t && styles.tabTxtActive]}>
                  {t === 'desc' ? 'Description' : 'Specifications'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'desc' ? (
            <Text style={styles.descTxt}>{product.desc || 'No description available.'}</Text>
          ) : (
            <View style={styles.specsTable}>
              {product.specs && Object.entries(product.specs).map(([k,v], i) => (
                <View key={i} style={[styles.specRow, i % 2 === 0 && styles.specRowEven]}>
                  <Text style={styles.specKey}>{k}</Text>
                  <Text style={styles.specVal}>{v}</Text>
                </View>
              ))}
              {(!product.specs || Object.keys(product.specs).length === 0) && (
                <Text style={styles.noSpecs}>No specifications available.</Text>
              )}
            </View>
          )}

          {/* Safety tip for C2C */}
          {!isB2B && (
            <TouchableOpacity
              style={styles.safetyTip}
              onPress={() => navigation.navigate('SafetyTips')}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.orange} />
              <Text style={styles.safetyTipTxt}>
                Always inspect item before paying. <Text style={{ color: COLORS.orange, fontWeight:'700' }}>Safety Tips →</Text>
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        {isB2B ? (
          <>
            <TouchableOpacity
              style={styles.inquireBtn}
              onPress={() => navigation.navigate('Contact')}
            >
              <Ionicons name="mail-outline" size={18} color={COLORS.orange} />
              <Text style={styles.inquireBtnTxt}>Inquire</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.cartBtnTxt}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
              <Text style={styles.buyBtnTxt}>Buy Now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.inquireBtn}
              onPress={() => navigation.navigate('Messages')}
            >
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.orange} />
              <Text style={styles.inquireBtnTxt}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buyBtn, { flex:2 }]} onPress={() => navigation.navigate('Contact')}>
              <Ionicons name="call-outline" size={18} color="#fff" />
              <Text style={styles.buyBtnTxt}>Call Seller</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#fff' },
  centered:     { flex:1, alignItems:'center', justifyContent:'center' },
  notFoundTxt:  { fontSize:16, fontWeight:'700', color: COLORS.muted, marginTop:12 },
  goBackBtn:    { marginTop:16, paddingHorizontal:24, paddingVertical:10, backgroundColor: COLORS.orange, borderRadius: RADIUS.md },
  goBackTxt:    { color:'#fff', fontWeight:'700' },
  topNav:       { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:12, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: COLORS.border },
  navBtn:       { width:36, height:36, borderRadius:18, backgroundColor: COLORS.bodyBg, alignItems:'center', justifyContent:'center' },
  navTitle:     { flex:1, fontSize:14, fontWeight:'700', color: COLORS.dark, marginHorizontal:10 },
  imgWrap:      { position:'relative' },
  mainImg:      { width, height: width * 0.75 },
  dots:         { position:'absolute', bottom:12, left:0, right:0, flexDirection:'row', justifyContent:'center', gap:6 },
  dot:          { width:6, height:6, borderRadius:3, backgroundColor:'rgba(255,255,255,0.5)' },
  dotActive:    { backgroundColor:'#fff', width:18 },
  badge:        { position:'absolute', top:14, left:14, paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  badgeB2B:     { backgroundColor: COLORS.orange },
  badgeC2C:     { backgroundColor:'#0099cc' },
  badgeTxt:     { color:'#fff', fontSize:10, fontWeight:'800', textTransform:'uppercase' },
  infoWrap:     { padding:18 },
  title:        { fontSize:20, fontWeight:'900', color: COLORS.dark, lineHeight:28, marginBottom:8 },
  ratingRow:    { flexDirection:'row', alignItems:'center', gap:8, marginBottom:14 },
  stars:        { flexDirection:'row', gap:2 },
  ratingTxt:    { fontSize:13, color: COLORS.muted },
  priceRow:     { flexDirection:'row', alignItems:'center', gap:12, marginBottom:16 },
  price:        { fontSize:28, fontWeight:'900', color: COLORS.orange },
  moqBadge:     { backgroundColor: COLORS.orangeLight, borderWidth:1, borderColor:'#ffd4b8', paddingHorizontal:12, paddingVertical:5, borderRadius:8 },
  moqTxt:       { fontSize:12, fontWeight:'700', color: COLORS.orange },
  conditionBadge: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'#dcfce7', paddingHorizontal:10, paddingVertical:4, borderRadius:20, alignSelf:'flex-start', marginBottom:8 },
  conditionTxt: { fontSize:12, fontWeight:'700', color:'#15803d' },
  priceC2C:     { fontSize:26, fontWeight:'900', color: COLORS.dark, marginBottom:6 },
  locationRow:  { flexDirection:'row', alignItems:'center', gap:5, marginBottom:14 },
  locationTxt:  { fontSize:13, color: COLORS.muted },
  qtyWrap:      { marginBottom:16 },
  qtyLabel:     { fontSize:13, fontWeight:'700', color: COLORS.dark, marginBottom:8 },
  qtyRow:       { flexDirection:'row', alignItems:'center', gap:12 },
  qtyBtn:       { width:36, height:36, borderRadius:8, backgroundColor: COLORS.bodyBg, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor: COLORS.border },
  qtyVal:       { fontSize:18, fontWeight:'900', color: COLORS.dark, minWidth:32, textAlign:'center' },
  totalTxt:     { fontSize:14, color: COLORS.muted, marginLeft:4 },
  sellerCard:   { flexDirection:'row', alignItems:'center', gap:12, backgroundColor: COLORS.bodyBg, borderRadius: RADIUS.md, padding:14, marginBottom:18, borderWidth:1, borderColor: COLORS.border },
  sellerAvatar: { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center' },
  sellerAvatarTxt: { fontSize:18, fontWeight:'900', color:'#fff' },
  sellerName:   { fontSize:14, fontWeight:'800', color: COLORS.dark, marginBottom:3 },
  sellerCity:   { fontSize:12, color: COLORS.muted },
  verifiedBadge: { flexDirection:'row', alignItems:'center', gap:3, backgroundColor:'#dcfce7', paddingHorizontal:7, paddingVertical:2, borderRadius:20 },
  verifiedTxt:  { fontSize:10, fontWeight:'700', color:'#15803d' },
  chatBtn:      { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'#fff', borderWidth:1, borderColor: COLORS.border, paddingHorizontal:12, paddingVertical:7, borderRadius:8 },
  chatBtnTxt:   { fontSize:12, fontWeight:'700', color: COLORS.orange },
  tabs:         { flexDirection:'row', borderBottomWidth:2, borderBottomColor: COLORS.border, marginBottom:14 },
  tab:          { flex:1, paddingVertical:10, alignItems:'center', borderBottomWidth:2, borderBottomColor:'transparent', marginBottom:-2 },
  tabActive:    { borderBottomColor: COLORS.orange },
  tabTxt:       { fontSize:14, fontWeight:'600', color: COLORS.muted },
  tabTxtActive: { color: COLORS.orange, fontWeight:'800' },
  descTxt:      { fontSize:14, color: COLORS.text, lineHeight:22 },
  specsTable:   { borderRadius: RADIUS.md, overflow:'hidden', borderWidth:1, borderColor: COLORS.border },
  specRow:      { flexDirection:'row', padding:11 },
  specRowEven:  { backgroundColor: COLORS.bodyBg },
  specKey:      { flex:1, fontSize:13, fontWeight:'700', color: COLORS.dark },
  specVal:      { flex:1, fontSize:13, color: COLORS.text },
  noSpecs:      { padding:16, textAlign:'center', color: COLORS.muted },
  safetyTip:    { flexDirection:'row', alignItems:'flex-start', gap:8, backgroundColor: COLORS.orangeLight, borderRadius: RADIUS.md, padding:12, marginTop:16 },
  safetyTipTxt: { flex:1, fontSize:13, color: COLORS.text, lineHeight:18 },
  bottomBar:    { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', gap:10, paddingHorizontal:16, paddingTop:12, backgroundColor:'#fff', borderTopWidth:1, borderTopColor: COLORS.border, ...SHADOW.md },
  inquireBtn:   { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, borderWidth:1.5, borderColor: COLORS.orange, paddingVertical:13, borderRadius: RADIUS.md },
  inquireBtnTxt: { fontSize:14, fontWeight:'700', color: COLORS.orange },
  cartBtn:      { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, backgroundColor: COLORS.dark, paddingVertical:13, borderRadius: RADIUS.md },
  cartBtnTxt:   { fontSize:14, fontWeight:'700', color:'#fff' },
  buyBtn:       { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, backgroundColor: COLORS.orange, paddingVertical:13, borderRadius: RADIUS.md },
  buyBtnTxt:    { fontSize:14, fontWeight:'700', color:'#fff' },
});
