import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field } from '@/components/besqaa/Field';
import { PrimaryButton } from '@/components/besqaa/PrimaryButton';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';
import type { User } from '@/lib/types';

// Parses DD/MM/YYYY into an ISO date string, or null if invalid/past.
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

export default function Buyback() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refresh } = useAuth();

  const existing = user?.buybackDate ? new Date(user.buybackDate) : null;
  const [date, setDate] = useState(
    existing
      ? `${String(existing.getDate()).padStart(2, '0')}/${String(existing.getMonth() + 1).padStart(2, '0')}/${existing.getFullYear()}`
      : ''
  );
  const [amount, setAmount] = useState(user?.buybackAmount ? String(user.buybackAmount) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    setError('');
    const iso = parseBuybackDate(date);
    if (!iso) {
      setError('Enter a valid date as DD/MM/YYYY');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Enter the buyback amount from your furniture card');
      return;
    }
    setSaving(true);
    try {
      await api.put<{ user: User }>('/auth/me/buyback', { date: iso, amount: Number(amount) });
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
        <Text style={styles.doneTitle}>Buyback locked in! 🎉</Text>
        <Text style={styles.doneSub}>
          We&apos;ll make sure you get maximum benefits when your buyback date arrives.
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
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>The Ultimate Buyback Bonanza!</Text>
          <Text style={styles.heroSub}>
            Enter your next buyback date and amount from your furniture card to secure explosive
            returns.
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Field
          label="Next buyback date (from your furniture card)"
          icon="calendar-outline"
          placeholder="DD/MM/YYYY"
          keyboardType="numbers-and-punctuation"
          value={date}
          onChangeText={setDate}
        />
        <Field
          label="Buyback amount (₹)"
          icon="cash-outline"
          placeholder="e.g. 25000"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <PrimaryButton
          title="Secure my buyback  🎇"
          onPress={save}
          loading={saving}
          style={{ marginTop: 10 }}
        />
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
    marginBottom: 24,
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
  error: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
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
  doneTitle: { color: theme.colors.white, fontSize: 26, fontWeight: '800', marginTop: 26 },
  doneSub: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
});
