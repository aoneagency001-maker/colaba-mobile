import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth';
import { UserRole } from '../types';
import { colors } from '../theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Customer screens
import WalletScreen from '../screens/customer/WalletScreen';
import HistoryScreen from '../screens/customer/HistoryScreen';
import QrCodeScreen from '../screens/customer/QrCodeScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ExpiringScreen from '../screens/customer/ExpiringScreen';
import CatalogScreen from '../screens/customer/CatalogScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import NewsScreen from '../screens/customer/NewsScreen';
import NewsDetailScreen from '../screens/customer/NewsDetailScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import NotificationSettingsScreen from '../screens/customer/NotificationSettingsScreen';

// Seller screens
import ScannerScreen from '../screens/seller/ScannerScreen';
import OperationsScreen from '../screens/seller/OperationsScreen';
import SellerProfileScreen from '../screens/seller/SellerProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CatalogStackNav = createNativeStackNavigator();
const WalletStackNav = createNativeStackNavigator();
const CartStackNav = createNativeStackNavigator();
const NewsStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

// ─── Catalog Stack ───
function CatalogStack() {
  return (
    <CatalogStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CatalogStackNav.Screen name="CatalogMain" component={CatalogScreen} />
      <CatalogStackNav.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Товар', headerTintColor: colors.primary }}
      />
      <CatalogStackNav.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: true, title: 'Корзина', headerTintColor: colors.primary }}
      />
      <CatalogStackNav.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: true, title: 'Оформление заказа', headerTintColor: colors.primary }}
      />
    </CatalogStackNav.Navigator>
  );
}

// ─── Wallet Stack ───
function WalletStack() {
  return (
    <WalletStackNav.Navigator screenOptions={{ headerShown: false }}>
      <WalletStackNav.Screen name="WalletMain" component={WalletScreen} />
      <WalletStackNav.Screen
        name="QrCode"
        component={QrCodeScreen}
        options={{ headerShown: true, title: 'QR-код', headerTintColor: colors.primary }}
      />
      <WalletStackNav.Screen
        name="Expiring"
        component={ExpiringScreen}
        options={{ headerShown: true, title: 'Сгорающие бонусы', headerTintColor: colors.primary }}
      />
      <WalletStackNav.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerShown: true, title: 'История', headerTintColor: colors.primary }}
      />
    </WalletStackNav.Navigator>
  );
}

// ─── Cart Stack ───
function CartStack() {
  return (
    <CartStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CartStackNav.Screen name="CartMain" component={CartScreen} />
      <CartStackNav.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: true, title: 'Оформление заказа', headerTintColor: colors.primary }}
      />
    </CartStackNav.Navigator>
  );
}

// ─── News Stack ───
function NewsStack() {
  return (
    <NewsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <NewsStackNav.Screen name="NewsMain" component={NewsScreen} />
      <NewsStackNav.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{ headerShown: true, title: 'Новость', headerTintColor: colors.primary }}
      />
    </NewsStackNav.Navigator>
  );
}

// ─── Profile Stack ───
function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStackNav.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ headerShown: true, title: 'Мои заказы', headerTintColor: colors.primary }}
      />
      <ProfileStackNav.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: true, title: 'Редактировать профиль', headerTintColor: colors.primary }}
      />
      <ProfileStackNav.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ headerShown: true, title: 'Уведомления', headerTintColor: colors.primary }}
      />
    </ProfileStackNav.Navigator>
  );
}

// ─── Customer Tabs (5 tabs) ───
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        tabBarStyle: { height: 60, paddingBottom: 6 },
      }}
    >
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStack}
        options={{
          headerShown: false,
          title: 'Каталог',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="store" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletStack}
        options={{
          headerShown: false,
          title: 'Бонусы',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QRTab"
        component={QrCodeScreen}
        options={{
          title: 'QR-код',
          headerShown: true,
          headerTintColor: colors.primary,
          tabBarLabel: '',
          tabBarIcon: () => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.accent,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <MaterialCommunityIcons name="qrcode" size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="NewsTab"
        component={NewsStack}
        options={{
          headerShown: false,
          title: 'Новости',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="newspaper" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function SellerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Сканер',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Operations"
        component={OperationsScreen}
        options={{
          title: 'Операции',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SellerProfile"
        component={SellerProfileScreen}
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, role, login, checkAuth } = useAuthStore();

  // TODO: убрать автологин, вернуть авторизацию
  useEffect(() => {
    if (!isAuthenticated) {
      login('+77001234567', 'test123').catch(() => {});
    }
  }, []);

  return <CustomerTabs />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
