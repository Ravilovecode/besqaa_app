import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { useDrawer } from '@/lib/drawer';
import { theme } from '@/lib/theme';
import { Avatar } from './Avatar';
import { ConfirmDialog } from './ConfirmDialog';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(340, width * 0.84);

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
};

// Two groups, matching the mockup (Scanner → Besqaa Query for consistency).
const PRIMARY: Item[] = [
  { icon: 'home-outline', label: 'Home', href: '/(tabs)' },
  { icon: 'grid-outline', label: 'Products', href: '/(tabs)/products' },
  { icon: 'chatbubble-ellipses-outline', label: 'Besqaa Query', href: '/(tabs)/query' },
  { icon: 'bag-outline', label: 'My Cart', href: '/(tabs)/cart' },
];
const SECONDARY: Item[] = [
  { icon: 'cube-outline', label: 'My Orders', href: '/orders' },
  { icon: 'heart-outline', label: 'Saved Products', href: '/saved' },
  { icon: 'information-circle-outline', label: 'About Besqaa', href: '/about' },
  { icon: 'settings-outline', label: 'Settings', href: '/settings' },
];

export function AppDrawer() {
  const { open, closeDrawer } = useDrawer();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const translateX = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  useEffect(() => {
    if (open) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      translateX.setValue(-PANEL_WIDTH);
    }
  }, [open, translateX]);

  function go(href: string) {
    closeDrawer();
    // Let the drawer close before navigating for a smoother transition.
    setTimeout(() => router.push(href as never), 60);
  }

  async function doLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      setConfirmLogout(false);
      closeDrawer();
      router.replace('/(auth)/login');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <Modal
      visible={open}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={closeDrawer}
    >
      {/* Backdrop — tap to close */}
      <Pressable style={styles.backdrop} onPress={closeDrawer} />

      <Animated.View
        style={[
          styles.panel,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16, transform: [{ translateX }] },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.avatarShadow}>
            <Avatar user={user} size={66} rounded={18} />
          </View>
          <Pressable style={styles.closeBtn} onPress={closeDrawer} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.colors.text} />
          </Pressable>
        </View>

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.gstVerified ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>GST VERIFIED SELLER</Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        {/* Primary menu */}
        {PRIMARY.map((item) => (
          <Row key={item.label} item={item} onPress={() => go(item.href)} />
        ))}

        <View style={styles.dividerThin} />

        {/* Secondary menu */}
        {SECONDARY.map((item) => (
          <Row key={item.label} item={item} onPress={() => go(item.href)} />
        ))}

        <View style={{ flex: 1 }} />

        {/* Log out */}
        <View style={styles.dividerThin} />
        <Pressable style={styles.logoutBtn} onPress={() => setConfirmLogout(true)}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </Animated.View>

      <ConfirmDialog
        visible={confirmLogout}
        destructive
        icon="log-out-outline"
        title="Log out?"
        message="Do you really want to log out of your Besqaa account?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        loading={loggingOut}
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </Modal>
  );
}

function Row({ item, onPress }: { item: Item; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <Ionicons name={item.icon} size={22} color={theme.colors.gold} />
      <Text style={styles.rowLabel}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textDim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4, 7, 18, 0.6)' },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: theme.colors.bgElevated,
    borderRightWidth: 1,
    borderRightColor: theme.colors.cardBorder,
    paddingHorizontal: 22,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  avatarShadow: {
    borderRadius: 18,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: theme.colors.white, fontSize: 24, fontWeight: '800', marginTop: 16 },
  email: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 14,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  badgeText: { color: theme.colors.gold, fontWeight: '800', letterSpacing: 1, fontSize: 11 },
  divider: { height: 1, backgroundColor: theme.colors.cardBorder, marginVertical: 18 },
  dividerThin: { height: 1, backgroundColor: theme.colors.cardBorder, marginVertical: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 15,
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  rowPressed: { backgroundColor: theme.colors.surface },
  rowLabel: { flex: 1, color: theme.colors.white, fontSize: 17, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 106, 106, 0.4)',
    backgroundColor: theme.colors.dangerSoft,
    marginTop: 6,
  },
  logoutText: { color: theme.colors.danger, fontSize: 17, fontWeight: '800' },
});
