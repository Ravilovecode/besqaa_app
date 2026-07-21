import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { theme } from '@/lib/theme';

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { summary } = useCart();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.gold,
        tabBarInactiveTintColor: theme.colors.textDim,
        tabBarStyle: {
          backgroundColor: theme.colors.bgElevated,
          borderTopColor: theme.colors.cardBorder,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      {/* Center "Besqaa Query" button — replaces the old Scanner. */}
      <Tabs.Screen
        name="query"
        options={{
          title: 'Query',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerBtn, focused && styles.centerBtnActive]}>
              <Ionicons name="chatbubble-ellipses" size={26} color="#1a1400" />
            </View>
          ),
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 6 },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" size={size} color={color} />,
          tabBarBadge: summary.count > 0 ? summary.count : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.colors.gold, color: '#1a1400', fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  centerBtn: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  centerBtnActive: { backgroundColor: theme.colors.goldBright },
});
