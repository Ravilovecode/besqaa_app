import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Avatar } from '@/components/besqaa/Avatar';
import { BuybackModal } from '@/components/besqaa/BuybackModal';
import { MenuIcon } from '@/components/besqaa/MenuIcon';
import { ProductCard } from '@/components/besqaa/ProductCard';
import { ProductImage } from '@/components/besqaa/ProductImage';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { allBuybacks, nextBuyback } from '@/lib/buyback';
import { useDrawer } from '@/lib/drawer';
import { formatINR, discountPercent } from '@/lib/format';
import { theme } from '@/lib/theme';
import type { Product } from '@/lib/types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatBuybackDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Module-level: the Buyback Bonanza popup shows once per app launch.
let buybackPromptShownThisSession = false;

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const [deals, setDeals] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [heroSize, setHeroSize] = useState({ w: 0, h: 0 });
  const [showBuybackPromo, setShowBuybackPromo] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, r] = await Promise.all([
        api.get<{ products: Product[] }>('/products?deal=true&limit=6', false),
        api.get<{ products: Product[] }>('/products?recommended=true&limit=6', false),
      ]);
      setDeals(d.products);
      setRecommended(r.products);
    } catch {
      /* ignore — pull to retry */
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      // Buyback Bonanza — prompt once every time the app is opened.
      if (!buybackPromptShownThisSession) {
        buybackPromptShownThisSession = true;
        const t = setTimeout(() => setShowBuybackPromo(true), 600);
        return () => clearTimeout(t);
      }
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 10, paddingBottom: 30 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />
      }
    >
      {/* Hero tile — menu, notifications and profile wrapped in one card */}
      <View
        style={styles.hero}
        onLayout={(e) =>
          setHeroSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        {/* Subtle gold bloom inside the tile. Drawn with explicit pixel
            coordinates (userSpaceOnUse) — percentage coords render with hard
            edges on Android. */}
        {heroSize.w > 0 && (
          <Svg
            width={heroSize.w}
            height={heroSize.h}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Defs>
              <RadialGradient
                id="heroBloom"
                gradientUnits="userSpaceOnUse"
                cx={heroSize.w * 0.88}
                cy={0}
                rx={heroSize.w * 0.75}
                ry={heroSize.h * 1.2}
              >
                <Stop offset="0%" stopColor={theme.colors.gold} stopOpacity="0.16" />
                <Stop offset="55%" stopColor={theme.colors.gold} stopOpacity="0.05" />
                <Stop offset="100%" stopColor={theme.colors.gold} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width={heroSize.w} height={heroSize.h} fill="url(#heroBloom)" />
          </Svg>
        )}

        {/* Row 1 — drawer menu · date chip · notifications */}
        <View style={styles.heroTop}>
          <Pressable style={styles.glassBtn} onPress={openDrawer} hitSlop={8}>
            <MenuIcon size={20} />
          </Pressable>
          <View style={styles.datePill}>
            <Ionicons name="sparkles" size={12} color={theme.colors.gold} />
            <Text style={styles.datePillText}>{greeting()}</Text>
          </View>
          <Pressable style={styles.glassBtn}>
            <Ionicons name="notifications-outline" size={21} color={theme.colors.text} />
            <View style={styles.dot} />
          </Pressable>
        </View>

        {/* Row 2 — profile */}
        <View style={styles.heroProfile}>
          <Pressable style={styles.avatarShadow} onPress={openDrawer}>
            <Avatar user={user} size={58} rounded={18} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || 'Guest'}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.verifiedChip}>
                <Ionicons
                  name={user?.gstVerified ? 'shield-checkmark' : 'person'}
                  size={11}
                  color={theme.colors.gold}
                />
                <Text style={styles.verifiedChipText}>
                  {user?.gstVerified ? 'Verified buyer' : 'Buyer'}
                </Text>
              </View>
              <Text style={styles.subInfo}>· Besqaa</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textDim} />
        </View>

        {/* Row 3 — next upcoming buyback / add prompt */}
        {(() => {
          const next = nextBuyback(user);
          const count = allBuybacks(user).length;
          return next ? (
            <Pressable style={styles.buybackChip} onPress={() => router.push('/buyback')}>
              <Text style={{ fontSize: 15 }}>🎁</Text>
              <Text style={styles.buybackChipText} numberOfLines={1}>
                Next buyback · {formatBuybackDate(next.date)} ·{' '}
                <Text style={{ color: theme.colors.goldBright }}>{formatINR(next.amount)}</Text>
              </Text>
              {count > 1 && (
                <View style={styles.morePill}>
                  <Text style={styles.morePillText}>+{count - 1} more</Text>
                </View>
              )}
              <Ionicons name="pencil" size={13} color={theme.colors.textDim} />
            </Pressable>
          ) : (
            <Pressable style={styles.buybackAdd} onPress={() => router.push('/buyback')}>
              <Text style={{ fontSize: 14 }}>🎁</Text>
              <Text style={styles.buybackAddText}>Add your buyback dates & amounts</Text>
              <Ionicons name="add-circle" size={17} color={theme.colors.gold} />
            </Pressable>
          );
        })()}
      </View>

      {/* Best deals */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Best deals</Text>
      </View>
      {deals.length === 0 ? (
        <Text style={styles.empty}>No deals yet — check back soon.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 14 }}>
            {deals.map((p) => {
              const off = discountPercent(p.price, p.compareAtPrice);
              return (
                <Pressable
                  key={p._id}
                  style={styles.dealCard}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: p._id } })}
                >
                  {off > 0 && (
                    <View style={styles.dealBadge}>
                      <Text style={styles.dealBadgeText}>-{off}% DEAL</Text>
                    </View>
                  )}
                  <ProductImage uri={p.images?.[0]} style={styles.dealImage} label="Deal photo" />
                  <Text style={styles.dealName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.dealPrice}>{formatINR(p.price)}</Text>
                    {p.compareAtPrice ? (
                      <Text style={styles.dealStrike}>{formatINR(p.compareAtPrice)}</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Recommended */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Recommended</Text>
        <Pressable onPress={() => router.push('/(tabs)/products')}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {recommended.map((p) => (
          <View key={p._id} style={{ width: '48%' }}>
            <ProductCard product={p} />
          </View>
        ))}
      </View>
      {recommended.length === 0 && (
        <Text style={styles.empty}>No products yet. The admin can add them from the panel.</Text>
      )}

      {/* Buyback Bonanza promo — shown once per app open */}
      <BuybackModal
        visible={showBuybackPromo}
        onClose={() => setShowBuybackPromo(false)}
        onFill={() => {
          setShowBuybackPromo(false);
          router.push('/buyback');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 26,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  glassBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  datePillText: { color: theme.colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  heroProfile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarShadow: {
    borderRadius: 18,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  name: { color: theme.colors.white, fontSize: 22, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 24,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.28)',
  },
  verifiedChipText: { color: theme.colors.gold, fontSize: 11, fontWeight: '800' },
  subInfo: { color: theme.colors.textMuted, fontSize: 13 },
  buybackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  buybackChipText: { flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  morePill: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(212,175,55,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    justifyContent: 'center',
  },
  morePillText: { color: theme.colors.goldBright, fontSize: 11, fontWeight: '800' },
  buybackAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: theme.radius.md,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: 'rgba(212,175,55,0.45)',
  },
  buybackAddText: { flex: 1, color: theme.colors.gold, fontSize: 13, fontWeight: '800' },
  dot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gold,
    borderWidth: 1.5,
    borderColor: theme.colors.card,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: { color: theme.colors.white, fontSize: 22, fontWeight: '800' },
  seeAll: { color: theme.colors.gold, fontWeight: '700', fontSize: 15 },
  dealCard: {
    width: 280,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    padding: 14,
  },
  dealBadge: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 2,
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  dealBadgeText: { color: '#1a1400', fontWeight: '800', fontSize: 12 },
  dealImage: { width: '100%', height: 150, marginBottom: 14 },
  dealName: { color: theme.colors.white, fontSize: 18, fontWeight: '800' },
  dealPrice: { color: theme.colors.gold, fontSize: 18, fontWeight: '800', marginTop: 4 },
  dealStrike: {
    color: theme.colors.strike,
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 24 },
});
