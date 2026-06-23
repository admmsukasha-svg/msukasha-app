import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { COLORS } from './src/constants';
import { getUser, getToken } from './src/services/api';

/* ── Screens ── */
import SplashScreenView  from './src/screens/SplashScreen';
import HomeScreen        from './src/screens/HomeScreen';
import ShopScreen        from './src/screens/ShopScreen';
import ProductDetail     from './src/screens/ProductDetail';
import C2CScreen         from './src/screens/C2CScreen';
import CategoriesScreen  from './src/screens/CategoriesScreen';
import SearchScreen      from './src/screens/SearchScreen';
import CartScreen        from './src/screens/CartScreen';
import WishlistScreen    from './src/screens/WishlistScreen';
import CheckoutScreen    from './src/screens/CheckoutScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import TrackOrderScreen  from './src/screens/TrackOrderScreen';
import LoginScreen       from './src/screens/LoginScreen';
import RegisterScreen    from './src/screens/RegisterScreen';
import MyAccountScreen   from './src/screens/MyAccountScreen';
import PostAdScreen      from './src/screens/PostAdScreen';
import MessagesScreen    from './src/screens/MessagesScreen';
import ChatScreen        from './src/screens/ChatScreen';
import AboutScreen       from './src/screens/AboutScreen';
import ContactScreen     from './src/screens/ContactScreen';
import BlogScreen        from './src/screens/BlogScreen';
import CareersScreen     from './src/screens/CareersScreen';
import HelpScreen        from './src/screens/HelpScreen';
import TradeAssuranceScreen    from './src/screens/TradeAssuranceScreen';
import VerifiedSuppliersScreen from './src/screens/VerifiedSuppliersScreen';
import LogisticsScreen         from './src/screens/LogisticsScreen';
import SafetyTipsScreen        from './src/screens/SafetyTipsScreen';
import BuyingGuidesScreen      from './src/screens/BuyingGuidesScreen';

SplashScreen.preventAutoHideAsync();

const Stack  = createNativeStackNavigator();
const Tab    = createBottomTabNavigator();

/* ── Bottom Tab Navigator ── */
function MainTabs({ user }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.orange,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor:  COLORS.border,
          borderTopWidth:  1,
          height:          60,
          paddingBottom:   8,
          paddingTop:      6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:     focused ? 'home'           : 'home-outline',
            Shop:     focused ? 'grid'           : 'grid-outline',
            PostAd:   focused ? 'add-circle'     : 'add-circle-outline',
            Messages: focused ? 'chatbubbles'    : 'chatbubbles-outline',
            Account:  focused ? 'person'         : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Shop"     component={ShopScreen} />
      <Tab.Screen
        name="PostAd"
        component={user ? PostAdScreen : LoginScreen}
        options={{ title: 'Post Ad' }}
      />
      <Tab.Screen
        name="Messages"
        component={user ? MessagesScreen : LoginScreen}
      />
      <Tab.Screen
        name="Account"
        component={user ? MyAccountScreen : LoginScreen}
      />
    </Tab.Navigator>
  );
}

/* ── Main App ── */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [user,    setUser]    = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        const u = await getUser();
        const t = await getToken();
        if (u && t) setUser(u);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
        /* Show custom splash for 2 seconds */
        setTimeout(() => setShowSplash(false), 2000);
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex:1, backgroundColor: COLORS.dark, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  if (showSplash) return <SplashScreenView />;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Main Tabs */}
        <Stack.Screen name="MainTabs">
          {(props) => <MainTabs {...props} user={user} />}
        </Stack.Screen>

        {/* Auth Screens */}
        <Stack.Screen name="Login"    component={LoginScreen}    options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_bottom' }} />

        {/* Product Screens */}
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="C2C"           component={C2CScreen} />
        <Stack.Screen name="Categories"    component={CategoriesScreen} />
        <Stack.Screen name="Search"        component={SearchScreen} />

        {/* Cart & Order Screens */}
        <Stack.Screen name="Cart"         component={CartScreen} />
        <Stack.Screen name="Wishlist"     component={WishlistScreen} />
        <Stack.Screen name="Checkout"     component={CheckoutScreen} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        <Stack.Screen name="TrackOrder"   component={TrackOrderScreen} />

        {/* Chat */}
        <Stack.Screen name="Chat" component={ChatScreen} />

        {/* Info Screens */}
        <Stack.Screen name="About"            component={AboutScreen} />
        <Stack.Screen name="Contact"          component={ContactScreen} />
        <Stack.Screen name="Blog"             component={BlogScreen} />
        <Stack.Screen name="Careers"          component={CareersScreen} />
        <Stack.Screen name="Help"             component={HelpScreen} />
        <Stack.Screen name="TradeAssurance"   component={TradeAssuranceScreen} />
        <Stack.Screen name="VerifiedSuppliers" component={VerifiedSuppliersScreen} />
        <Stack.Screen name="Logistics"        component={LogisticsScreen} />
        <Stack.Screen name="SafetyTips"       component={SafetyTipsScreen} />
        <Stack.Screen name="BuyingGuides"     component={BuyingGuidesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
