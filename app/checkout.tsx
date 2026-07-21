import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { api, uploadImage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { formatINR } from '@/lib/format';
import { theme } from '@/lib/theme';
import type { Order } from '@/lib/types';

// UPI handle shown for online payments — override in .env with EXPO_PUBLIC_UPI_ID.
const UPI_ID = process.env.EXPO_PUBLIC_UPI_ID || 'besqaa@upi';

export default function Checkout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { summary, refresh } = useCart();
  const [line1, setLine1] = useState(user?.addresses?.[0]?.line1 || '');
  const [landmark, setLandmark] = useState(user?.addresses?.[0]?.landmark || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.pincode || '');
  const [phone, setPhone] = useState(normalizeIndianMobile(user?.phone));
  const [payment, setPayment] = useState<'cod' | 'online'>('cod');
  const [proofUrl, setProofUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  async function pickPaymentScreenshot() {
    setError('');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadingProof(true);
    try {
      const res = await uploadImage<{ url: string }>(
        '/upload/payment-proof',
        'proof',
        result.assets[0].uri
      );
      setProofUrl(res.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploadingProof(false);
    }
  }

  async function placeOrder() {
    setError('');
    if (!line1 || !city || !state || !pincode) {
      setError('Please complete your delivery address');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError('Pincode must be exactly 6 digits');
      return;
    }
    if (!isValidIndianMobile(phone)) {
      setError('Enter a valid 10-digit mobile number for delivery updates');
      return;
    }
    if (payment === 'online' && !proofUrl) {
      setError('Please upload your payment screenshot to continue');
      return;
    }
    setPlacing(true);
    try {
      const res = await api.post<{ order: Order }>('/orders', {
        shippingAddress: {
          line1,
          landmark: landmark.trim(),
          city,
          state,
          pincode: pincode.trim(),
          phone: `+91${phone}`,
        },
        paymentMethod: payment,
        paymentProofUrl: payment === 'online' ? proofUrl : '',
      });
      await refresh();
      const eta = res.order.estimatedDelivery
        ? new Date(res.order.estimatedDelivery).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
          })
        : '';
      router.replace({
        pathname: '/order-success',
        params: {
          orderNumber: res.order.orderNumber,
          total: String(res.order.total),
          eta,
          method: payment,
        },
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.section}>Delivery address</Text>
        <Field label="Address line" placeholder="House / street" value={line1} onChangeText={setLine1} />
        <Field
          label="Landmark (optional)"
          icon="location-outline"
          placeholder="e.g. Near City Mall, opposite SBI Bank"
          value={landmark}
          onChangeText={setLandmark}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="City" placeholder="City" value={city} onChangeText={setCity} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="State" placeholder="State" value={state} onChangeText={setState} />
          </View>
        </View>
        <Field
          label="Pincode"
          placeholder="6-digit pincode"
          keyboardType="number-pad"
          maxLength={6}
          value={pincode}
          onChangeText={(t) => setPincode(t.replace(/\D/g, ''))}
        />
        <PhoneField label="Phone (for delivery updates)" value={phone} onChangeText={setPhone} />

        <Text style={styles.section}>Payment method</Text>
        <PayOption
          active={payment === 'cod'}
          icon="cash-outline"
          label="Cash on delivery"
          onPress={() => setPayment('cod')}
        />
        <PayOption
          active={payment === 'online'}
          icon="card-outline"
          label="Pay online (UPI / Card)"
          onPress={() => setPayment('online')}
        />

        {/* Online payment: pay via UPI, then upload the screenshot as proof.
            COD skips this entirely. */}
        {payment === 'online' && (
          <View style={styles.onlineBox}>
            <View style={styles.upiRow}>
              <Ionicons name="qr-code-outline" size={22} color={theme.colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={styles.upiLabel}>Pay {formatINR(summary.total)} via UPI to</Text>
                <Text style={styles.upiId}>{UPI_ID}</Text>
              </View>
            </View>
            <Text style={styles.upiHint}>
              After paying, upload the payment screenshot below. Our team verifies it and
              confirms your order — you&apos;ll get an email once it&apos;s approved.
            </Text>

            {proofUrl ? (
              <View style={styles.proofRow}>
                <Image source={{ uri: proofUrl }} style={styles.proofThumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.proofDone}>✓ Screenshot uploaded</Text>
                  <Pressable onPress={pickPaymentScreenshot} disabled={uploadingProof}>
                    <Text style={styles.proofChange}>Change screenshot</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={styles.proofUploader}
                onPress={pickPaymentScreenshot}
                disabled={uploadingProof}
              >
                {uploadingProof ? (
                  <ActivityIndicator color={theme.colors.gold} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.gold} />
                    <Text style={styles.proofUploaderText}>Upload payment screenshot *</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.summary}>
          <Row label="Subtotal" value={formatINR(summary.subtotal)} />
          <Row label="GST (18%)" value={formatINR(summary.gst)} />
          <Row label="Delivery" value={formatINR(summary.deliveryFee)} />
          <View style={styles.divider} />
          <Row label="Total" value={formatINR(summary.total)} bold />
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton title={`Place order · ${formatINR(summary.total)}`} onPress={placeOrder} loading={placing} />
      </View>
    </KeyboardAvoidingView>
  );
}

function PayOption({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.payOption, active && styles.payActive]} onPress={onPress}>
      <Ionicons name={icon} size={22} color={active ? theme.colors.gold : theme.colors.textMuted} />
      <Text style={[styles.payLabel, active && { color: theme.colors.white }]}>{label}</Text>
      <Ionicons
        name={active ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={active ? theme.colors.gold : theme.colors.textDim}
      />
    </Pressable>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && { color: theme.colors.white, fontWeight: '800', fontSize: 17 }]}>
        {label}
      </Text>
      <Text style={bold ? styles.totalValue : styles.rowValue}>{value}</Text>
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
  error: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  section: { color: theme.colors.white, fontSize: 18, fontWeight: '800', marginBottom: 14, marginTop: 8 },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 12,
  },
  payActive: { borderColor: theme.colors.gold },
  payLabel: { flex: 1, color: theme.colors.textMuted, fontSize: 15, fontWeight: '700' },
  onlineBox: {
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 12,
  },
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upiLabel: { color: theme.colors.textMuted, fontSize: 13 },
  upiId: { color: theme.colors.gold, fontSize: 18, fontWeight: '800', marginTop: 2 },
  upiHint: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 12 },
  proofUploader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: theme.radius.md,
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: 'rgba(212,175,55,0.5)',
    marginTop: 14,
  },
  proofUploaderText: { color: theme.colors.gold, fontWeight: '800', fontSize: 14 },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  proofThumb: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  proofDone: { color: theme.colors.success, fontWeight: '800', fontSize: 14 },
  proofChange: { color: theme.colors.gold, fontWeight: '700', fontSize: 13, marginTop: 4 },
  summary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    padding: 18,
    marginTop: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  rowLabel: { color: theme.colors.textMuted, fontSize: 15 },
  rowValue: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  totalValue: { color: theme.colors.gold, fontWeight: '800', fontSize: 20 },
  divider: { height: 1, backgroundColor: theme.colors.cardBorder, marginVertical: 8 },
  bar: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.bg,
  },
});
