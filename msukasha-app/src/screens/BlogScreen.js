import React from 'react';
import { View, Text, StyleSheet as BS, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as BC, RADIUS as BR, SHADOW as BSH } from '../constants';

const POSTS = [
  {
    id: 1,
    title: 'How to Source Wholesale Products Safely in Pakistan',
    excerpt: 'A practical guide to vetting suppliers, negotiating MOQs, and using Trade Assurance to protect your B2B purchases.',
    category: 'B2B Guide',
    date: 'May 2026',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
  },
  {
    id: 2,
    title: '5 Tips to Sell Your Used Items Faster on MSukasha',
    excerpt: 'Better photos, fair pricing, and quick responses — small changes that make a big difference in how fast your ad sells.',
    category: 'C2C Tips',
    date: 'April 2026',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600',
  },
  {
    id: 3,
    title: 'Understanding Trade Assurance: Buy with Confidence',
    excerpt: 'Here is exactly how escrow protection works when you order from a verified supplier on MSukasha.',
    category: 'Platform',
    date: 'April 2026',
    img: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=600',
  },
  {
    id: 4,
    title: 'Pakistan\u2019s Wholesale Market: 2026 Outlook',
    excerpt: 'A look at how digital B2B marketplaces are reshaping sourcing for retailers across Karachi, Lahore, and Islamabad.',
    category: 'Industry',
    date: 'March 2026',
    img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600',
  },
];

export default function BlogScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[bs.container, { paddingTop: insets.top }]}>
      <View style={bs.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={BC.dark} />
        </TouchableOpacity>
        <Text style={bs.headerTitle}>MSukasha Blog</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text style={bs.introTxt}>Guides, tips, and updates on buying and selling smarter across Pakistan.</Text>

        {POSTS.map(post => (
          <TouchableOpacity key={post.id} style={bs.card} activeOpacity={0.85}>
            <Image source={{ uri: post.img }} style={bs.cardImg} resizeMode="cover" />
            <View style={bs.cardBody}>
              <View style={bs.catPill}>
                <Text style={bs.catPillTxt}>{post.category}</Text>
              </View>
              <Text style={bs.cardTitle} numberOfLines={2}>{post.title}</Text>
              <Text style={bs.cardExcerpt} numberOfLines={2}>{post.excerpt}</Text>
              <View style={bs.cardFooter}>
                <Text style={bs.cardDate}>{post.date}</Text>
                <View style={bs.readMore}>
                  <Text style={bs.readMoreTxt}>Read More</Text>
                  <Ionicons name="arrow-forward" size={12} color={BC.orange} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={bs.subscribeCard}>
          <Ionicons name="mail-outline" size={28} color="#fff" />
          <Text style={bs.subscribeTitle}>Want more tips like these?</Text>
          <Text style={bs.subscribeSub}>Reach out and we'll keep you posted on new guides and platform updates.</Text>
          <TouchableOpacity style={bs.subscribeBtn} onPress={() => navigation.navigate('Contact')}>
            <Text style={bs.subscribeBtnTxt}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const bs = BS.create({
  container:   { flex: 1, backgroundColor: BC.bodyBg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BC.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: BC.dark },
  introTxt:    { fontSize: 13, color: BC.muted, lineHeight: 19, marginBottom: 2 },
  card:        { backgroundColor: '#fff', borderRadius: BR.md, overflow: 'hidden', borderWidth: 1, borderColor: BC.border, ...BSH.sm },
  cardImg:     { width: '100%', height: 150, backgroundColor: BC.border },
  cardBody:    { padding: 14 },
  catPill:     { alignSelf: 'flex-start', backgroundColor: BC.orangeLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  catPillTxt:  { fontSize: 10, fontWeight: '800', color: BC.orange, textTransform: 'uppercase' },
  cardTitle:   { fontSize: 15, fontWeight: '800', color: BC.dark, lineHeight: 21, marginBottom: 6 },
  cardExcerpt: { fontSize: 13, color: BC.muted, lineHeight: 19, marginBottom: 12 },
  cardFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate:    { fontSize: 11, color: BC.muted },
  readMore:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreTxt: { fontSize: 12, fontWeight: '700', color: BC.orange },
  subscribeCard: { backgroundColor: BC.dark, borderRadius: BR.lg, padding: 24, alignItems: 'center', marginTop: 4 },
  subscribeTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 10, marginBottom: 6, textAlign: 'center' },
  subscribeSub:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  subscribeBtn:   { backgroundColor: BC.orange, paddingHorizontal: 24, paddingVertical: 11, borderRadius: BR.md },
  subscribeBtnTxt:{ color: '#fff', fontSize: 13, fontWeight: '800' },
});
