import React from 'react';
import {
  View, Text, StyleSheet as CatS, FlatList,
  TouchableOpacity, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as CatC, RADIUS as CatR, SHADOW as CatSH } from '../constants';

const { width } = Dimensions.get('window');

const ALL_CATS = [
  { id:'electronics', label:'Electronics',    icon:'phone-portrait-outline', color:'#0066cc', sub:'Phones, laptops, accessories' },
  { id:'fashion',     label:'Fashion',         icon:'shirt-outline',          color:'#ec4899', sub:'Clothing, shoes, bags' },
  { id:'home',        label:'Home & Living',   icon:'home-outline',           color:'#f59e0b', sub:'Furniture, appliances, décor' },
  { id:'vehicles',    label:'Vehicles',        icon:'car-outline',            color:'#22c55e', sub:'Cars, bikes, rickshaws' },
  { id:'industrial',  label:'Industrial',      icon:'business-outline',       color:'#6366f1', sub:'Steel, machinery, equipment' },
  { id:'agriculture', label:'Agriculture',     icon:'leaf-outline',           color:'#15803d', sub:'Rice, wheat, fertilizers' },
  { id:'sports',      label:'Sports & Fitness',icon:'football-outline',       color:'#f97316', sub:'Footballs, cricket, gym' },
  { id:'tools',       label:'Tools & Hardware',icon:'construct-outline',      color:'#64748b', sub:'Hand tools, power tools' },
  { id:'food',        label:'Food & Beverages',icon:'restaurant-outline',     color:'#dc2626', sub:'Dry goods, spices, bulk food' },
  { id:'chemicals',   label:'Chemicals',       icon:'flask-outline',          color:'#7c3aed', sub:'Industrial & agricultural chemicals' },
  { id:'packaging',   label:'Packaging',       icon:'cube-outline',           color:'#0891b2', sub:'Boxes, bags, wrapping material' },
  { id:'books',       label:'Books & Education',icon:'book-outline',          color:'#b45309', sub:'Textbooks, guides, novels' },
];

export default function CategoriesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const ITEM_W = (width - 48) / 2;

  return (
    <View style={[cats.container, { paddingTop: insets.top }]}>
      <View style={cats.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={CatC.dark} />
        </TouchableOpacity>
        <Text style={cats.headerTitle}>All Categories</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={ALL_CATS}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={cats.banner}>
            <Text style={cats.bannerTitle}>Browse by Category</Text>
            <Text style={cats.bannerSub}>Find B2B wholesale products and C2C used items across all categories.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[cats.card, { width: ITEM_W }]}
            onPress={() => navigation.navigate('Shop', { cat: item.id })}
            activeOpacity={0.85}
          >
            <View style={[cats.iconWrap, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={cats.cardLabel}>{item.label}</Text>
            <Text style={cats.cardSub} numberOfLines={1}>{item.sub}</Text>
            <View style={[cats.arrow, { backgroundColor: item.color + '15' }]}>
              <Ionicons name="arrow-forward" size={14} color={item.color} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const cats = CatS.create({
  container:    { flex: 1, backgroundColor: CatC.bodyBg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: CatC.border },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: CatC.dark },
  banner:       { backgroundColor: CatC.dark, borderRadius: CatR.md, padding: 18, marginHorizontal: 16, marginBottom: 4 },
  bannerTitle:  { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 4 },
  bannerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  card:         { backgroundColor: '#fff', borderRadius: CatR.md, padding: 16, borderWidth: 1, borderColor: CatC.border, ...CatSH.sm },
  iconWrap:     { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardLabel:    { fontSize: 13, fontWeight: '800', color: CatC.dark, marginBottom: 3 },
  cardSub:      { fontSize: 11, color: CatC.muted, marginBottom: 10 },
  arrow:        { alignSelf: 'flex-start', width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
