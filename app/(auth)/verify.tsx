import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';

export default function Verify() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { verifyOtp, resendOtp } = useAuth();
  const params = useLocalSearchParams<{
    pendingId: string;
    email: string;
    phone: string;
    devEmailOtp?: string;
    devPhoneOtp?: string;
  }>();

  // Email is optional at signup — phone-only accounts verify via SMS alone.
  const hasEmail = !!params.email;
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // In development the backend echoes the OTPs (no SMS/email provider yet).
  const [devOtps, setDevOtps] = useState({
    email: params.devEmailOtp || '',
    phone: params.devPhoneOtp || '',
  });

  async function handleVerify() {
    setError('');
    if (!emailOtp.trim() && !phoneOtp.trim()) {
      setError(
        hasEmail
          ? 'Enter the OTP from your email or phone — either one works'
          : 'Enter the OTP sent to your phone'
      );
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(params.pendingId, {
        emailOtp: emailOtp.trim() || undefined,
        phoneOtp: phoneOtp.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      const fresh = await resendOtp(params.pendingId);
      if (fresh) setDevOtps({ email: fresh.email || '', phone: fresh.phone });
      setInfo(hasEmail ? 'New OTPs sent to your email and phone' : 'New OTP sent to your phone');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={40} color={theme.colors.gold} />
        </View>
        <Text style={styles.title}>Verify your account</Text>
        {hasEmail ? (
          <Text style={styles.subtitle}>
            We sent one-time codes to{'\n'}
            <Text style={styles.highlight}>{params.email}</Text> and{' '}
            <Text style={styles.highlight}>{params.phone}</Text>
          </Text>
        ) : (
          <Text style={styles.subtitle}>
            We sent a one-time code to{'\n'}
            <Text style={styles.highlight}>{params.phone}</Text>
          </Text>
        )}

        {hasEmail && (
          <View style={styles.eitherPill}>
            <Ionicons name="flash" size={13} color={theme.colors.gold} />
            <Text style={styles.eitherText}>Entering either one verifies you</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <View style={{ marginTop: 20 }}>
          {hasEmail && (
            <>
              <Field
                label="Email OTP"
                icon="mail-outline"
                placeholder="6-digit code from email"
                keyboardType="number-pad"
                maxLength={6}
                value={emailOtp}
                onChangeText={setEmailOtp}
              />
              <Text style={styles.or}>— OR —</Text>
            </>
          )}
          <Field
            label="Phone OTP"
            icon="call-outline"
            placeholder="6-digit code from SMS"
            keyboardType="number-pad"
            maxLength={6}
            value={phoneOtp}
            onChangeText={setPhoneOtp}
          />
        </View>

        {/* Dev helper — visible only while no SMS/email provider is wired up. */}
        {devOtps.email || devOtps.phone ? (
          <Text style={styles.devHint}>
            DEV ·{devOtps.email ? ` email OTP: ${devOtps.email} ·` : ''} phone OTP: {devOtps.phone}
          </Text>
        ) : null}

        <PrimaryButton
          title="Verify & continue  →"
          onPress={handleVerify}
          loading={loading}
          style={{ marginTop: 16 }}
        />

        <Pressable onPress={handleResend} disabled={resending} style={{ marginTop: 22 }}>
          <Text style={styles.resend}>{resending ? 'Sending…' : "Didn't get a code? Resend"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 26, flexGrow: 1, backgroundColor: theme.colors.bg },
  iconWrap: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  title: { color: theme.colors.white, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  highlight: { color: theme.colors.text, fontWeight: '700' },
  eitherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 14,
    height: 30,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    marginTop: 16,
  },
  eitherText: { color: theme.colors.gold, fontSize: 12, fontWeight: '800' },
  error: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  info: {
    color: theme.colors.success,
    backgroundColor: 'rgba(78,199,142,0.12)',
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  or: { color: theme.colors.textDim, textAlign: 'center', marginBottom: 14, fontWeight: '700', fontSize: 12 },
  devHint: { color: theme.colors.textDim, fontSize: 12, textAlign: 'center', marginTop: 4 },
  resend: { color: theme.colors.gold, fontWeight: '800', textAlign: 'center' },
});
