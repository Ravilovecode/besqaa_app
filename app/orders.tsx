import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { theme } from '@/lib/theme';
import type { Order } from '@/lib/types';

const statusColor: Record<string, string> = {
  placed: theme.colors.gold,
  confirmed: theme.colors.gold,
  shipped: theme.colors.gold,
  delivered: theme.colors.success,
  cancelled: theme.colors.danger,
};

export default function Orders() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ orders: Order[] }>('/orders')
      .then((res) => setOrders(res.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>My orders</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.gold} style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={60} color={theme.colors.textDim} />
          <Text style={styles.emptyText}>You have no orders yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
          {orders.map((o) => (
            <View key={o._id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.orderNum}>#{o.orderNumber}</Text>
                <View style={[styles.statusBadge, { borderColor: statusColor[o.status] }]}>
                  <Text style={[styles.statusText, { color: statusColor[o.status] }]}>
                    {o.status}
                  </Text>
                </View>
              </View>

              {/* Online payments: verified tick once admin approves the screenshot */}
              {o.paymentMethod === 'online' &&
                (o.paymentStatus === 'paid' ? (
                  <View style={styles.payRow}>
                    <Ionicons name="checkmark-circle" size={15} color={theme.colors.success} />
                    <Text style={styles.payVerified}>Payment verified</Text>
                  </View>
                ) : (
                  <View style={styles.payRow}>
                    <Ionicons name="time-outline" size={15} color={theme.colors.textDim} />
                    <Text style={styles.payPending}>Payment verification pending</Text>
                  </View>
                ))}

              <Text style={styles.items}>
                {o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
              </Text>
              <View style={styles.cardFoot}>
                <Text style={styles.date}>
                  {new Date(o.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.total}>{formatINR(o.total)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyText: { color: theme.colors.textMuted, fontSize: 16 },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 14,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { color: theme.colors.white, fontWeight: '800', fontSize: 16 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: { fontWeight: '800', fontSize: 12, textTransform: 'capitalize' },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  payVerified: { color: theme.colors.success, fontSize: 13, fontWeight: '800' },
  payPending: { color: theme.colors.textDim, fontSize: 13, fontWeight: '600' },
  items: { color: theme.colors.textMuted, fontSize: 14, marginTop: 10, lineHeight: 20 },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    paddingTop: 12,
  },
  date: { color: theme.colors.textDim, fontSize: 13 },
  total: { color: theme.colors.gold, fontWeight: '800', fontSize: 18 },
});
