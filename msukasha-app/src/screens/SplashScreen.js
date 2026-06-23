import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoAnim  = useRef(new Animated.Value(0)).current;
  const textAnim  = useRef(new Animated.Value(0)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(circleAnim, {
        toValue: 1, duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1, duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1, duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#1a2332', '#2d4a6e', '#1a3a5c']}
      style={styles.container}
    >
      {/* Background circles */}
      <Animated.View style={[
        styles.circleBg1,
        { opacity: circleAnim, transform: [{ scale: circleAnim }] }
      ]} />
      <Animated.View style={[
        styles.circleBg2,
        { opacity: circleAnim, transform: [{ scale: circleAnim }] }
      ]} />

      {/* Logo */}
      <Animated.View style={[
        styles.logoWrap,
        {
          opacity: logoAnim,
          transform: [{ translateY: logoAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0]
          })}]
        }
      ]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.brandName}>
          M<Text style={{ color: COLORS.orange }}>Sukasha</Text>
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[
        styles.taglineWrap,
        {
          opacity: textAnim,
          transform: [{ translateY: textAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })}]
        }
      ]}>
        <Text style={styles.tagline}>Pakistan's #1 B2B & C2C Marketplace</Text>
        <View style={styles.tagRow}>
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>🇵🇰 Made in Pakistan</Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom */}
      <Animated.View style={[styles.bottom, { opacity: textAnim }]}>
        <Text style={styles.bottomText}>Buy Wholesale. Sell Locally. Trade Confidently.</Text>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBg1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255,102,0,0.08)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circleBg2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255,102,0,0.06)',
    bottom: -width * 0.1,
    left: -width * 0.1,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  taglineWrap: {
    alignItems: 'center',
    marginBottom: 60,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 14,
  },
  tagRow: {
    flexDirection: 'row',
  },
  tagPill: {
    backgroundColor: 'rgba(255,102,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagPillText: {
    color: '#ffaa66',
    fontSize: 12,
    fontWeight: '700',
  },
  bottom: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 16,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: COLORS.orange,
    width: 20,
  },
});
