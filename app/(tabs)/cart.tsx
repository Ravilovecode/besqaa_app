import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/besqaa/PrimaryButton';
import { ProductImage } from '@/components/besqaa/ProductImage';
import { useCart } from '@/lib/cart';
import { formatINR } from '@/lib/format';
import { theme } from '@/lib/theme';

export default function Cart() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, summary, setQty, remove, refresh } = useCart();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (items.length === 0) {
    return (
      <View style={[styles.emptyWrap, { paddingTop: insets.top }]}>
        <Ionicons name="bag-outline" size={64} color={theme.colors.textDim} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Browse products and add items to get started.</Text>
        <PrimaryButton
          title="Browse products"
          onPress={() => router.push('/(tabs)/products')}
          style={{ marginTop: 24, minWidth: 220 }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingTop: insets.top + 10 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.count}>{summary.count} items</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }}>
        {items.map(({ product, quantity }) => (
          <View key={product._id} style={styles.item}>
            <ProductImage uri={product.images?.[0]} style={styles.itemImage} rounded={12} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.itemCat}>
                {typeof product.category === 'object' ? product.category?.name : ''}
              </Text>
              <Text style={styles.itemPrice}>{formatINR(product.price)}</Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setQty(product._id, quantity - 1)}
              >
                <Ionicons name="remove" size={18} color={theme.colors.text} />
              </Pressable>
              <Text style={styles.qtyText}>{quantity}</Text>
              <Pressable
                style={[styles.qtyBtn, styles.qtyBtnGold]}
                onPress={() => setQty(product._id, quantity + 1)}
              >
                <Ionicons name="add" size={18} color="#1a1400" />
              </Pressable>
            </View>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summary}>
          <Row label="Subtotal" value={formatINR(summary.subtotal)} />
          <Row label="GST (18%)" value={formatINR(summary.gst)} />
          <Row label="Delivery" value={formatINR(summary.deliveryFee)} />
          <View style={styles.divider} />
          <Row label="Total" value={formatINR(summary.total)} bold />
        </View>
      </ScrollView>

      <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton
          title="Proceed to checkout  →"
          onPress={() => router.push('/checkout')}
        />
      </View>
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[bold ? styles.totalValue : styles.rowValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: { color: theme.colors.white, fontSize: 22, fontWeight: '800', marginTop: 18 },
  emptySub: { color: theme.colors.textMuted, fontSize: 15, marginTop: 8, textAlign: 'center' },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  title: { color: theme.colors.white, fontSize: 30, fontWeight: '800' },
  count: { color: theme.colors.gold, fontWeight: '700', fontSize: 15 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 14,
  },
  itemImage: { width: 76, height: 76 },
  itemName: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  itemCat: { color: theme.colors.textMuted, fontSize: 13, marginTop: 2 },
  itemPrice: { color: theme.colors.gold, fontSize: 16, fontWeight: '800', marginTop: 6 },
  qtyControls: { alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnGold: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  qtyText: { color: theme.colors.white, fontWeight: '800', fontSize: 15 },
  summary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    padding: 18,
    marginTop: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  rowLabel: { color: theme.colors.textMuted, fontSize: 15 },
  rowValue: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  rowBold: { color: theme.colors.white, fontWeight: '800', fontSize: 17 },
  totalValue: { color: theme.colors.gold, fontWeight: '800', fontSize: 20 },
  divider: { height: 1, backgroundColor: theme.colors.cardBorder, marginVertical: 8 },
  checkoutBar: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.bg,
  },
});
