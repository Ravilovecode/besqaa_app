import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/lib/theme';
import { formatINR } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const [adding, setAdding] = useState(false);
  const categoryName =
    typeof product.category === 'object' ? product.category?.name : undefined;

  async function handleAdd() {
    setAdding(true);
    try {
      await add(product._id, 1);
    } catch {
      /* surfaced elsewhere */
    } finally {
      setAdding(false);
    }
  }

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product._id } })}
    >
      <ProductImage
        uri={product.images?.[0]}
        label="Product photo"
        style={styles.image}
        rounded={theme.radius.sm}
      />
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      {categoryName ? <Text style={styles.category}>{categoryName}</Text> : null}
      <View style={styles.footer}>
        <Text style={styles.price}>{formatINR(product.price)}</Text>
        <Pressable style={styles.addBtn} onPress={handleAdd} disabled={adding}>
          <Ionicons name="add" size={22} color="#1a1400" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: 12,
  },
  image: { width: '100%', height: 130, marginBottom: 12 },
  name: { color: theme.colors.white, fontWeight: '700', fontSize: 15, minHeight: 40 },
  category: { color: theme.colors.textMuted, fontSize: 13, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: { color: theme.colors.gold, fontWeight: '800', fontSize: 16 },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
