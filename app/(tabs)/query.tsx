import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
import {
  PhoneField,
  isValidIndianMobile,
  normalizeIndianMobile,
} from '@/components/besqaa/PhoneField';
import { PrimaryButton } from '@/components/besqaa/PrimaryButton';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';
import type { Category } from '@/lib/types';

export default function BesqaaQuery() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [budget, setBudget] = useState('');
  const [phone, setPhone] = useState(normalizeIndianMobile(user?.phone));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>('/categories', false)
      .then((res) => setCategories(res.categories))
      .catch(() => {});
  }, []);

  async function submit() {
    setError('');
    if (!subject.trim() || !message.trim()) {
      setError('Please add a subject and describe what you need');
      return;
    }
    if (phone && !isValidIndianMobile(phone)) {
      setError('Enter a valid 10-digit mobile number, or leave it empty');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/queries', {
        subject: subject.trim(),
        message: message.trim(),
        category: categoryId || undefined,
        quantity: Number(quantity) || 1,
        budget: budget ? Number(budget) : 0,
        phone: phone ? `+91${phone}` : '',
        name: user?.name,
        email: user?.email,
      });
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSubject('');
    setMessage('');
    setQuantity('1');
    setBudget('');
    setCategoryId('');
    setDone(false);
  }

  if (done) {
    return (
      <View style={[styles.successWrap, { paddingTop: insets.top }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={54} color="#1a1400" />
        </View>
        <Text style={styles.successTitle}>Query submitted!</Text>
        <Text style={styles.successSub}>
          Our sourcing team will review your request and get back to you shortly.
        </Text>
        <PrimaryButton title="Submit another" onPress={reset} style={{ marginTop: 30, minWidth: 220 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.bg }}
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 10, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Ionicons name="chatbubble-ellipses" size={26} color={theme.colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Besqaa Query</Text>
            <Text style={styles.sub}>
              Can&apos;t find a product? Tell us what you need and we&apos;ll source it.
            </Text>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Field
          label="Subject"
          placeholder="e.g. Need 50 LED bulbs, 9W"
          value={subject}
          onChangeText={setSubject}
        />

        {/* Category selector */}
        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          style={{ marginBottom: 16 }}
        >
          <Pressable
            style={[styles.chip, categoryId === '' && styles.chipActive]}
            onPress={() => setCategoryId('')}
          >
            <Text style={[styles.chipText, categoryId === '' && styles.chipTextActive]}>Any</Text>
          </Pressable>
          {categories.map((c) => (
            <Pressable
              key={c._id}
              style={[styles.chip, categoryId === c._id && styles.chipActive]}
              onPress={() => setCategoryId(c._id)}
            >
              <Text style={[styles.chipText, categoryId === c._id && styles.chipTextActive]}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Quantity" placeholder="1" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Budget (₹)" placeholder="Optional" keyboardType="numeric" value={budget} onChangeText={setBudget} />
          </View>
        </View>

        <PhoneField label="Phone (optional — for a faster callback)" value={phone} onChangeText={setPhone} />

        <Field
          label="Describe your requirement"
          placeholder="Share specs, brand preferences, delivery location, deadline…"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          style={{ height: 120, textAlignVertical: 'top' }}
        />

        <PrimaryButton
          title="Submit query  →"
          onPress={submit}
          loading={submitting}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    padding: 18,
    marginBottom: 22,
  },
  title: { color: theme.colors.white, fontSize: 24, fontWeight: '800' },
  sub: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4 },
  label: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 8, fontWeight: '600' },
  error: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  chipText: { color: theme.colors.textMuted, fontWeight: '700' },
  chipTextActive: { color: '#1a1400' },
  successWrap: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  successIcon: {
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
  successTitle: { color: theme.colors.white, fontSize: 26, fontWeight: '800', marginTop: 28 },
  successSub: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
});
