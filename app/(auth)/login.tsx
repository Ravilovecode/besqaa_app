import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
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
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Field } from '@/components/besqaa/Field';
import { PrimaryButton } from '@/components/besqaa/PrimaryButton';
import { useAuth } from '@/lib/auth';
import { saveCredentials, loadCredentials, clearCredentials } from '@/lib/credentials';
import { theme } from '@/lib/theme';

const GLOW = 440;

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prefill saved credentials (stored securely on-device via Keychain/Keystore).
  useEffect(() => {
    loadCredentials().then((saved) => {
      if (saved) {
        setEmail(saved.email);
        setPassword(saved.password);
      }
    });
  }, []);

  async function handleLogin() {
    setError('');
    if (!email || !password) {
      setError('Please enter your email or phone number, and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      if (remember) await saveCredentials(email.trim(), password);
      else await clearCredentials();
      router.replace('/(tabs)');
    } catch (e: any) {
      // Account exists but isn't verified yet → continue to OTP verification.
      if (e.data?.requiresVerification) {
        router.push({
          pathname: '/(auth)/verify',
          params: {
            pendingId: e.data.pendingId,
            email: e.data.email,
            phone: e.data.phone,
            devEmailOtp: e.data.devOtps?.email ?? '',
            devPhoneOtp: e.data.devOtps?.phone ?? '',
          },
        });
        return;
      }
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
      <ScrollView
        // Safe-area aware: keeps the footer clear of Android nav buttons / iOS home bar.
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 46, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand header — big B mark + BESQAA wordmark over a golden radial glow */}
        <View style={styles.brandWrap}>
          <View style={styles.glowWrap} pointerEvents="none">
            <Svg width={GLOW} height={GLOW}>
              <Defs>
                <RadialGradient id="loginGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={theme.colors.goldBright} stopOpacity="0.42" />
                  <Stop offset="30%" stopColor={theme.colors.gold} stopOpacity="0.22" />
                  <Stop offset="60%" stopColor={theme.colors.gold} stopOpacity="0.08" />
                  <Stop offset="100%" stopColor={theme.colors.gold} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width={GLOW} height={GLOW} fill="url(#loginGlow)" />
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
          <Text style={styles.subtitle}>Sign in to continue to Besqaa</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ marginTop: 18 }}>
          <Field
            icon="mail-outline"
            placeholder="Email or mobile number"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            icon="lock-closed-outline"
            placeholder="Password"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
            rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPass((s) => !s)}
          />
        </View>

        <View style={styles.optionsRow}>
          <Pressable style={styles.rememberRow} onPress={() => setRemember((r) => !r)}>
            <View style={[styles.checkbox, remember && styles.checkboxOn]}>
              {remember && <Ionicons name="checkmark" size={14} color="#1a1400" />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>
          <Text style={styles.forgot}>Forgot password?</Text>
        </View>

        <PrimaryButton
          title="Sign in  →"
          onPress={handleLogin}
          loading={loading}
          style={{ marginTop: 8 }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Besqaa? </Text>
          <Link href="/(auth)/register" style={styles.footerLink}>
            Sign up
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 26, flexGrow: 1, backgroundColor: theme.colors.bg },
  brandWrap: { alignItems: 'center', marginBottom: 8 },
  glowWrap: {
    position: 'absolute',
    // Center the glow over the B logo + wordmark block (~200px tall).
    top: 100 - GLOW / 2,
    alignItems: 'center',
  },
  // besqq_b_logo.png is 886×836 (≈1.06:1)
  logoB: { width: 150, height: 142 },
  // besqaa_text.png is 1961×336 (≈5.84:1)
  wordmark: { width: 250, height: 43, marginTop: 18 },
  subtitle: { color: theme.colors.textMuted, fontSize: 15, marginTop: 14 },
  error: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 2,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: theme.colors.gold },
  rememberText: { color: theme.colors.textMuted, fontWeight: '600', fontSize: 14 },
  forgot: {
    color: theme.colors.gold,
    fontWeight: '700',
  },
  // Sits right under the sign-in button (not pinned to the screen bottom) so
  // it can never hide behind phone navigation buttons.
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerText: { color: theme.colors.textMuted },
  footerLink: { color: theme.colors.gold, fontWeight: '800' },
});
