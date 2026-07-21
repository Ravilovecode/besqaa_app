import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/besqaa/PrimaryButton';
import { ProductImage } from '@/components/besqaa/ProductImage';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { discountPercent, formatINR } from '@/lib/format';
import { theme } from '@/lib/theme';
import type { Product } from '@/lib/types';

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .get<{ product: Product }>(`/products/${id}`, false)
      .then((res) => setProduct(res.product))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function addToCart() {
    if (!product) return;
    setAdding(true);
    try {
      await add(product._id, qty);
      router.push('/(tabs)/cart');
    } catch {
      /* ignore */
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.gold} />
      </View>
    );
  }
  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.textMuted }}>Product not found.</Text>
      </View>
    );
  }

  const off = discountPercent(product.price, product.compareAtPrice);
  const categoryName = typeof product.category === 'object' ? product.category?.name : '';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Product details</Text>
        <Pressable style={styles.iconBtn} onPress={() => setSaved((s) => !s)}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={22}
            color={theme.colors.gold}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }}>
        <View>
          {off > 0 && (
            <View style={styles.dealBadge}>
              <Text style={styles.dealBadgeText}>-{off}% DEAL</Text>
            </View>
          )}
          <ProductImage uri={product.images?.[0]} style={styles.hero} label="Product photo" />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.name}>{product.name}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.price}>{formatINR(product.price)}</Text>
            {product.compareAtPrice ? (
              <Text style={styles.strike}>{formatINR(product.compareAtPrice)}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.meta}>
          {categoryName} · {product.stock > 0 ? 'In stock' : 'Out of stock'} · Ships in{' '}
          {product.shipsInDays} days
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color={theme.colors.gold} />
          <Text style={styles.rating}>{product.rating || 0}</Text>
          <Text style={styles.reviews}>· {product.reviewCount || 0} reviews</Text>
        </View>

        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        {product.specs?.length > 0 && (
          <View style={styles.specs}>
            {product.specs.map((s, i) => (
              <View
                key={i}
                style={[styles.specRow, i < product.specs.length - 1 && styles.specBorder]}
              >
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.qtyBox}>
          <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} hitSlop={8}>
            <Ionicons name="remove" size={20} color={theme.colors.white} />
          </Pressable>
          <Text style={styles.qtyText}>{qty}</Text>
          <Pressable onPress={() => setQty((q) => q + 1)} hitSlop={8}>
            <Ionicons name="add" size={20} color={theme.colors.white} />
          </Pressable>
        </View>
        <PrimaryButton
          title="Add to cart"
          onPress={addToCart}
          loading={adding}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
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
  dealBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 2,
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
  },
  dealBadgeText: { color: '#1a1400', fontWeight: '800', fontSize: 12 },
  hero: {
    width: '100%',
    height: 300,
    borderRadius: theme.radius.md,
    borderColor: theme.colors.gold,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 12,
  },
  name: { color: theme.colors.white, fontSize: 26, fontWeight: '800', flex: 1 },
  price: { color: theme.colors.gold, fontSize: 26, fontWeight: '800' },
  strike: { color: theme.colors.strike, textDecorationLine: 'line-through', fontSize: 15 },
  meta: { color: theme.colors.textMuted, fontSize: 14, marginTop: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  rating: { color: theme.colors.gold, fontWeight: '800' },
  reviews: { color: theme.colors.textMuted },
  description: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 22, marginTop: 16 },
  specs: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 18,
    marginTop: 20,
  },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  specBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
  specLabel: { color: theme.colors.textMuted, fontSize: 15 },
  specValue: { color: theme.colors.white, fontSize: 15, fontWeight: '700' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 18,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  qtyText: { color: theme.colors.white, fontWeight: '800', fontSize: 16, minWidth: 20, textAlign: 'center' },
});
