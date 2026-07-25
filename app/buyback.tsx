import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field } from '@/components/besqaa/Field';
import { PrimaryButton } from '@/components/besqaa/PrimaryButton';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { allBuybacks, MAX_BUYBACKS } from '@/lib/buyback';
import { theme } from '@/lib/theme';
import type { User } from '@/lib/types';

// Parses DD/MM/YYYY into an ISO date string, or null if invalid.
function parseBuybackDate(input: string): string | null {
  const m = input.trim().match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  ) {
    return null;
  }
  return date.toISOString();
}

function toDisplayDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

type Draft = { key: number; date: string; amount: string };

// Pulsing dashed "add next buyback" button — the gentle heartbeat nudges the
// user to keep adding entries.
function AddBuybackButton({ nextNumber, onPress }: { nextNumber: number; onPress: () => void }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1
    );
  }, [pulse]);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.025 }],
    shadowOpacity: 0.15 + pulse.value * 0.35,
    borderColor: `rgba(212,175,55,${0.45 + pulse.value * 0.4})`,
  }));

  return (
    <Animated.View layout={LinearTransition.springify()} style={[styles.addBtn, animStyle]}>
      <Pressable style={styles.addBtnInner} onPress={onPress}>
        <View style={styles.addIconWrap}>
          <Ionicons name="add" size={20} color="#1a1400" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.addBtnTitle}>Add buyback #{nextNumber}</Text>
          <Text style={styles.addBtnSub}>One more date = even more benefits ✨</Text>
        </View>
        <Text style={{ fontSize: 20 }}>🎁</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function Buyback() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refresh } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const nextKey = useRef(0);

  const [drafts, setDrafts] = useState<Draft[]>(() => {
    const existing = allBuybacks(user).map((b) => ({
      key: nextKey.current++,
      date: toDisplayDate(b.date),
      amount: b.amount ? String(b.amount) : '',
    }));
    return existing.length ? existing : [{ key: nextKey.current++, date: '', amount: '' }];
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function addDraft() {
    if (drafts.length >= MAX_BUYBACKS) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDrafts((d) => [...d, { key: nextKey.current++, date: '', amount: '' }]);
    // Let the new tile mount, then bring it into view.
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }

  function removeDraft(key: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDrafts((d) => d.filter((x) => x.key !== key));
  }

  function updateDraft(key: number, patch: Partial<Draft>) {
    setDrafts((d) => d.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }

  async function save() {
    setError('');
    const buybacks: { date: string; amount: number }[] = [];
    for (let i = 0; i < drafts.length; i++) {
      const { date, amount } = drafts[i];
      const iso = parseBuybackDate(date);
      if (!iso) {
        setError(`Buyback #${i + 1}: enter a valid date as DD/MM/YYYY`);
        return;
      }
      if (!amount || Number(amount) <= 0) {
        setError(`Buyback #${i + 1}: enter the amount from your furniture card`);
        return;
      }
      buybacks.push({ date: iso, amount: Number(amount) });
    }
    setSaving(true);
    try {
      await api.put<{ user: User }>('/auth/me/buyback', { buybacks });
      await refresh();
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <View style={[styles.doneWrap, { paddingTop: insets.top }]}>
        <View style={styles.doneIcon}>
          <Ionicons name="gift" size={50} color="#1a1400" />
        </View>
        <Text style={styles.doneTitle}>
          {drafts.length > 1 ? `${drafts.length} buybacks locked in! 🎉` : 'Buyback locked in! 🎉'}
        </Text>
        <Text style={styles.doneSub}>
          We&apos;ll make sure you get maximum benefits when your buyback dates arrive.
        </Text>
        <PrimaryButton
          title="Back to home"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: 30, minWidth: 220 }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Buyback</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>The Ultimate Buyback Bonanza!</Text>
          <Text style={styles.heroSub}>
            Add every buyback date and amount from your furniture card — the more you add, the
            bigger your benefits.
          </Text>
        </View>

        {/* Progress — how many of the 15 slots are filled */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {drafts.length} of {MAX_BUYBACKS} buybacks added
          </Text>
          <View style={styles.progressTrack}>
            <Animated.View
              layout={LinearTransition.springify()}
              style={[styles.progressFill, { width: `${(drafts.length / MAX_BUYBACKS) * 100}%` }]}
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {drafts.map((draft, i) => (
          <Animated.View
            key={draft.key}
            entering={FadeInDown.springify().damping(16)}
            exiting={FadeOutUp.duration(180)}
            layout={LinearTransition.springify()}
            style={styles.tile}
          >
            <View style={styles.tileHead}>
              <View style={styles.tileBadge}>
                <Text style={styles.tileBadgeText}>#{i + 1}</Text>
              </View>
              <Text style={styles.tileTitle}>Buyback {i + 1}</Text>
              {drafts.length > 1 && (
                <Pressable onPress={() => removeDraft(draft.key)} hitSlop={10} style={styles.trash}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
                </Pressable>
              )}
            </View>
            <Field
              label="Buyback date (from your furniture card)"
              icon="calendar-outline"
              placeholder="DD/MM/YYYY"
              keyboardType="numbers-and-punctuation"
              value={draft.date}
              onChangeText={(t) => updateDraft(draft.key, { date: t })}
            />
            <Field
              label="Buyback amount (₹)"
              icon="cash-outline"
              placeholder="e.g. 25000"
              keyboardType="numeric"
              value={draft.amount}
              onChangeText={(t) => updateDraft(draft.key, { amount: t })}
            />
          </Animated.View>
        ))}

        {drafts.length < MAX_BUYBACKS ? (
          <AddBuybackButton nextNumber={drafts.length + 1} onPress={addDraft} />
        ) : (
          <Animated.View layout={LinearTransition.springify()} style={styles.fullBanner}>
            <Text style={styles.fullBannerText}>All {MAX_BUYBACKS} slots filled — legend! 🏆</Text>
          </Animated.View>
        )}

        <Animated.View layout={LinearTransition.springify()}>
          <PrimaryButton
            title={
              drafts.length > 1 ? `Secure my ${drafts.length} buybacks  🎇` : 'Secure my buyback  🎇'
            }
            onPress={save}
            loading={saving}
            style={{ marginTop: 18 }}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  heroCard: {
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    borderRadius: theme.radius.lg,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
  },
  heroEmoji: { fontSize: 40 },
  heroTitle: {
    color: theme.colors.gold,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },
  heroSub: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  progressRow: { marginBottom: 18 },
  progressText: {
    color: theme.colors.gold,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.gold,
  },
  error: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  tile: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    padding: 16,
    paddingBottom: 4,
    marginBottom: 14,
  },
  tileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  tileBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBadgeText: { color: '#1a1400', fontWeight: '800', fontSize: 13 },
  tileTitle: { flex: 1, color: theme.colors.white, fontSize: 16, fontWeight: '800' },
  trash: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    borderWidth: 1.6,
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    shadowColor: theme.colors.gold,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    backgroundColor: theme.colors.goldSoft,
    marginTop: 4,
  },
  addBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  addIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnTitle: { color: theme.colors.gold, fontSize: 15, fontWeight: '800' },
  addBtnSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 3 },
  fullBanner: {
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    borderRadius: theme.radius.md,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  fullBannerText: { color: theme.colors.gold, fontWeight: '800', fontSize: 14 },
  doneWrap: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  doneIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 8,
  },
  doneTitle: {
    color: theme.colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 26,
    textAlign: 'center',
  },
  doneSub: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
});
