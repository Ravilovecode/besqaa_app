import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AppDrawer } from '@/components/besqaa/AppDrawer';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { DrawerProvider } from '@/lib/drawer';
import { theme } from '@/lib/theme';

// Force the Besqaa dark theme everywhere (the app is dark-only by design).
const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.bg,
    text: theme.colors.text,
    primary: theme.colors.gold,
    border: theme.colors.cardBorder,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <DrawerProvider>
              <ThemeProvider value={navTheme}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.bg },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
                  <Stack.Screen name="checkout" />
                  <Stack.Screen name="order-success" />
                  <Stack.Screen name="orders" />
                  <Stack.Screen name="saved" />
                  <Stack.Screen name="about" />
                  <Stack.Screen name="settings" />
                  <Stack.Screen name="buyback" />
                </Stack>
                {/* Global slide-in drawer, available on every logged-in screen. */}
                <AppDrawer />
                <StatusBar style="light" />
              </ThemeProvider>
            </DrawerProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
