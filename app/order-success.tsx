import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/besqaa/PrimaryButton';
import { formatINR } from '@/lib/format';
import { theme } from '@/lib/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CONFETTI = ['🎉', '✨', '🎊', '⭐', '🥳', '💛'];
// Deterministic pseudo-random per particle (no Math.random → stable renders).
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  emoji: CONFETTI[i % CONFETTI.length],
  x: ((i * 61) % 100) / 100, // 0..1 across the width
  delay: (i * 137) % 900,
  size: 18 + ((i * 53) % 14),
  drift: ((i % 2 === 0 ? 1 : -1) * ((i * 29) % 40)) / 2,
}));

function ConfettiPiece({ p }: { p: (typeof PARTICLES)[number] }) {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fall, {
      toValue: 1,
      duration: 2600,
      delay: p.delay,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fall, p.delay]);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: p.x * (SCREEN_W - 30),
        top: -40,
        fontSize: p.size,
        opacity: fall.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_H * 0.9] }) },
          { translateX: fall.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
          { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '260deg'] }) },
        ],
      }}
    >
      {p.emoji}
    </Animated.Text>
  );
}

export default function OrderSuccess() {
  const router = useRouter();
  const { orderNumber, total, eta, method } = useLocalSearchParams<{
    orderNumber: string;
    total: string;
    eta: string;
    method: string;
  }>();
  const isOnline = method === 'online';

  const scale = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Celebratory haptics: success notification, then a double gold-tap.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const t1 = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 260);
    const t2 = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 420);

    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [scale, contentFade]);

  return (
    <View style={styles.container}>
      {/* Confetti rain */}
      {PARTICLES.map((p, i) => (
        <ConfettiPiece key={i} p={p} />
      ))}

      <View style={styles.iconGlow} />
      <Animated.View style={[styles.icon, { transform: [{ scale }] }]}>
        <Ionicons name="checkmark" size={64} color="#1a1400" />
      </Animated.View>

      <Animated.View style={{ opacity: contentFade, alignItems: 'center' }}>
        <Text style={styles.title}>{isOnline ? 'Order received!' : 'Order placed!'}</Text>
        <Text style={styles.sub}>
          Order #{orderNumber}
          {!isOnline && eta ? ` · Estimated delivery ${eta}` : ''}
        </Text>
        <Text style={styles.total}>{formatINR(Number(total))}</Text>

        {isOnline ? (
          <View style={styles.verifyCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.gold} />
            <Text style={styles.verifyText}>
              We&apos;re verifying your payment. You&apos;ll receive a confirmation email as soon
              as it&apos;s approved{eta ? ` — delivery expected by ${eta}` : ''}.
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          title="Continue shopping"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: 34, minWidth: 260 }}
        />
        <Pressable onPress={() => router.replace('/orders')} style={{ marginTop: 20 }}>
          <Text style={styles.track}>Track in My orders</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    overflow: 'hidden',
  },
  iconGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: theme.colors.gold,
    opacity: 0.18,
    top: '26%',
  },
  icon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 10,
  },
  title: { color: theme.colors.white, fontSize: 32, fontWeight: '800', marginTop: 32 },
  sub: { color: theme.colors.textMuted, fontSize: 15, marginTop: 12, textAlign: 'center' },
  total: { color: theme.colors.gold, fontSize: 22, fontWeight: '800', marginTop: 14 },
  verifyCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    borderRadius: theme.radius.md,
    padding: 14,
    marginTop: 22,
    maxWidth: 340,
  },
  verifyText: { flex: 1, color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 },
  track: { color: theme.colors.gold, fontWeight: '800', fontSize: 16 },
});
