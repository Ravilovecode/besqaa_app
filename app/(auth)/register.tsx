import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
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
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Field } from '@/components/besqaa/Field';
import { PhoneField, isValidIndianMobile } from '@/components/besqaa/PhoneField';
import { PrimaryButton } from '@/components/besqaa/PrimaryButton';
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';

// Compact glow — the signup form needs the vertical space.
const GLOW = 320;

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isValidIndianMobile(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!agree) {
      setError('Please accept the Terms & Privacy Policy');
      return;
    }
    setLoading(true);
    try {
      const pending = await signUp(name.trim(), email.trim(), `+91${phone}`, password);
      router.push({
        pathname: '/(auth)/verify',
        params: {
          pendingId: pending.pendingId,
          email: pending.email,
          phone: pending.phone,
          devEmailOtp: pending.devOtps?.email ?? '',
          devPhoneOtp: pending.devOtps?.phone ?? '',
        },
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </Pressable>

        {/* Compact brand header — same identity as login, sized for a long form */}
        <View style={styles.brandWrap}>
          <View style={styles.glowWrap} pointerEvents="none">
            <Svg width={GLOW} height={GLOW}>
              <Defs>
                <RadialGradient id="registerGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={theme.colors.goldBright} stopOpacity="0.38" />
                  <Stop offset="35%" stopColor={theme.colors.gold} stopOpacity="0.16" />
                  <Stop offset="100%" stopColor={theme.colors.gold} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width={GLOW} height={GLOW} fill="url(#registerGlow)" />
            </Svg>
          </View>
          <Image
            source={require('@/assets/images/besqq_b_logo.png')}
            style={styles.logoB}
            contentFit="contain"
          />
          <Image
            source={require('@/assets/images/besqaa_text.png')}
            style={styles.wordmark}
            contentFit="contain"
          />
          <Text style={styles.subtitle}>Create your account — join Besqaa in seconds</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ marginTop: 16 }}>
          <Field icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} />
          <Field
            icon="mail-outline"
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <PhoneField value={phone} onChangeText={setPhone} />
          <Field
            icon="lock-closed-outline"
            placeholder="Password"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
            rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPass((s) => !s)}
          />
          <Field
            icon="shield-checkmark-outline"
            placeholder="Confirm password"
            secureTextEntry={!showConfirm}
            value={confirm}
            onChangeText={setConfirm}
            rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowConfirm((s) => !s)}
          />
        </View>

        <Pressable style={styles.agreeRow} onPress={() => setAgree((a) => !a)}>
          <View style={[styles.checkbox, agree && styles.checkboxOn]}>
            {agree && <Ionicons name="checkmark" size={16} color="#1a1400" />}
          </View>
          <Text style={styles.agreeText}>
            I agree to Besqaa&apos;s <Text style={styles.gold}>Terms</Text> &{' '}
            <Text style={styles.gold}>Privacy Policy</Text>
          </Text>
        </Pressable>

        <PrimaryButton title="Create account  →" onPress={handleRegister} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.footerLink}>
            Sign in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 26, paddingTop: 56, flexGrow: 1, backgroundColor: theme.colors.bg, paddingBottom: 40 },
  back: {
    position: 'absolute',
    top: 56,
    left: 22,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWrap: { alignItems: 'center', marginBottom: 6 },
  glowWrap: {
    position: 'absolute',
    // Center the glow over the compact logo block (~130px tall).
    top: 65 - GLOW / 2,
    alignItems: 'center',
  },
  // Same brand images as login, scaled down for the longer form.
  logoB: { width: 96, height: 91 },
  wordmark: { width: 190, height: 33, marginTop: 12 },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, marginTop: 12, textAlign: 'center' },
  error: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22, marginTop: 4 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: theme.colors.gold },
  agreeText: { color: theme.colors.textMuted, flex: 1 },
  gold: { color: theme.colors.gold, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 26 },
  footerText: { color: theme.colors.textMuted },
  footerLink: { color: theme.colors.gold, fontWeight: '800' },
});
