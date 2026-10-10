import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./src/auth";
import { C } from "./src/theme";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProductScreen from "./src/screens/ProductScreen";
import CartScreen from "./src/screens/CartScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import OrderDetailScreen from "./src/screens/OrderDetailScreen";
import PayScreen from "./src/screens/PayScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = (e) => ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{e}</Text>;

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: C.teal }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: icon("🏠") }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: icon("🛒") }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: icon("📦") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: icon("👤") }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color={C.teal} /></View>;
  if (!user) return <AuthScreen />;
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ title: "Product" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order" }} />
      <Stack.Screen name="Pay" component={PayScreen} options={{ title: "JazzCash" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Root />
      </NavigationContainer>
    </AuthProvider>
  );
}
