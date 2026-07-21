import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { theme } from '@/lib/theme';

// Saved products placeholder — wiring uses the same /products data once the
// buyer starts saving items (savedProducts is already on the User model).
export default function Saved() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Saved products</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={60} color={theme.colors.textDim} />
        <Text style={styles.emptyText}>No saved products yet.</Text>
        <Text style={styles.emptySub}>Tap the heart on a product to save it here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: theme.colors.white, fontSize: 18, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 30 },
  emptyText: { color: theme.colors.textMuted, fontSize: 17, fontWeight: '700' },
  emptySub: { color: theme.colors.textDim, fontSize: 14, textAlign: 'center' },
});
