import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { theme } from '@/lib/theme';

type Props = {
  visible: boolean;
  onFill: () => void;
  onClose: () => void;
};

const CARD_W = 340;

// "Buyback Bonanza" promo popup, shown on every app open.
export function BuybackModal({ visible, onFill, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Gold bloom inside the card */}
          <Svg width={CARD_W} height={220} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <RadialGradient
                id="bbBloom"
                gradientUnits="userSpaceOnUse"
                cx={CARD_W / 2}
                cy={0}
                rx={CARD_W * 0.8}
                ry={200}
              >
                <Stop offset="0%" stopColor={theme.colors.gold} stopOpacity="0.28" />
                <Stop offset="60%" stopColor={theme.colors.gold} stopOpacity="0.08" />
                <Stop offset="100%" stopColor={theme.colors.gold} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width={CARD_W} height={220} fill="url(#bbBloom)" />
          </Svg>

          <Pressable style={styles.close} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={20} color={theme.colors.textMuted} />
          </Pressable>

          <Text style={styles.giftEmoji}>🎁🎁</Text>
          <View style={styles.flashPill}>
            <Text style={styles.flashPillText}>⚡ LIMITED-TIME BENEFITS</Text>
          </View>

          <Text style={styles.title}>The Ultimate{'\n'}Buyback Bonanza!</Text>

          <Text style={styles.body}>
            Enter your next buyback date from your furniture card and secure{' '}
            <Text style={styles.explosive}>EXPLOSIVE</Text> returns.
          </Text>

          <View style={styles.guaranteeRow}>
            <Text style={styles.guaranteeEmoji}>🎇</Text>
            <Text style={styles.guarantee}>Maximum benefits guaranteed!</Text>
            <Text style={styles.guaranteeEmoji}>🎑</Text>
          </View>

          <Pressable style={styles.cta} onPress={onFill}>
            <Text style={styles.ctaText}>Enter buyback date & amount</Text>
            <Ionicons name="arrow-forward" size={18} color="#1a1400" />
          </Pressable>

          <Pressable onPress={onClose} style={{ marginTop: 14 }}>
            <Text style={styles.later}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 18, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
  },
  card: {
    width: '100%',
    maxWidth: CARD_W,
    backgroundColor: theme.colors.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    padding: 26,
    paddingTop: 30,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 12,
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: { fontSize: 44 },
  flashPill: {
    marginTop: 12,
    paddingHorizontal: 14,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    justifyContent: 'center',
  },
  flashPillText: { color: theme.colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: {
    color: theme.colors.white,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 33,
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 12,
  },
  explosive: { color: theme.colors.gold, fontWeight: '800' },
  guaranteeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  guaranteeEmoji: { fontSize: 16 },
  guarantee: { color: theme.colors.goldBright, fontWeight: '800', fontSize: 14 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.gold,
    alignSelf: 'stretch',
    marginTop: 22,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: { color: '#1a1400', fontSize: 16, fontWeight: '800' },
  later: { color: theme.colors.textDim, fontWeight: '700', fontSize: 14 },
});
