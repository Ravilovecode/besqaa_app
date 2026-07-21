import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/besqaa/ProductCard';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';
import type { Category, Product } from '@/lib/types';

export default function Products() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<string>(''); // '' = All
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>('/categories', false)
      .then((res) => setCategories(res.categories))
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const q = activeCat ? `?category=${activeCat}&limit=100` : '?limit=100';
      const res = await api.get<{ products: Product[]; pagination: { total: number } }>(
        `/products${q}`,
        false
      );
      setProducts(res.products);
      setTotal(res.pagination.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [activeCat]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingTop: insets.top + 10 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.sub}>
            {total} items · Electronics &amp; home
          </Text>
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 56 }}
        contentContainerStyle={styles.chips}
      >
        <Chip label="All" active={activeCat === ''} onPress={() => setActiveCat('')} />
        {categories.map((c) => (
          <Chip
            key={c._id}
            label={c.name}
            active={activeCat === c._id}
            onPress={() => setActiveCat(c._id)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={theme.colors.gold} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.gridWrap}>
          <View style={styles.grid}>
            {products.map((p) => (
              <View key={p._id} style={{ width: '48%' }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
          {products.length === 0 && (
            <Text style={styles.empty}>No products in this category yet.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { color: theme.colors.white, fontSize: 30, fontWeight: '800' },
  sub: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4 },
  chips: { paddingHorizontal: 20, gap: 10, alignItems: 'center' },
  chip: {
    paddingHorizontal: 22,
    height: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  chipText: { color: theme.colors.textMuted, fontWeight: '700' },
  chipTextActive: { color: '#1a1400' },
  gridWrap: { padding: 20, paddingBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 40 },
});
