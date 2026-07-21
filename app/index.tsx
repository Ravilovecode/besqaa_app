import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';

const GLOW = 460;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const progress = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.55)).current;

  const [pct, setPct] = useState(0);
  const [minDone, setMinDone] = useState(false); // guarantees a brief, smooth reveal
  const [forceDone, setForceDone] = useState(false); // safety net if auth stalls
  const navigatedRef = useRef(false);

  // Mount: creep the bar to 90% while the app "loads", pulse the glow,
  // and mirror the animated value into a % counter.
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0.9,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.55, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    const id = progress.addListener(({ value }) => setPct(Math.round(value * 100)));
    const minTimer = setTimeout(() => setMinDone(true), 900);
    const safety = setTimeout(() => setForceDone(true), 6000);

    return () => {
      progress.removeListener(id);
      clearTimeout(minTimer);
      clearTimeout(safety);
    };
  }, [glow, progress]);

  // When the auth check has resolved (or the safety timeout fired) and the
  // minimum reveal time has passed, fill to 100% and route automatically.
  useEffect(() => {
    const ready = (!loading || forceDone) && minDone;
    if (!ready || navigatedRef.current) return;
    navigatedRef.current = true;

    Animated.timing(progress, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) router.replace(user ? '/(tabs)' : '/(auth)/login');
    });
  }, [loading, forceDone, minDone, user, progress, router]);

  return (
    <View style={styles.container}>
      {/* Full-screen gradient backdrop: navy depth + warm gold ambient blooms
          in the corners, matching the design mockup. */}
      <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0d1330" />
            <Stop offset="45%" stopColor={theme.colors.bg} />
            <Stop offset="100%" stopColor="#070b1a" />
          </LinearGradient>
          <RadialGradient id="bloomTR" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#e8b64c" stopOpacity="0.34" />
            <Stop offset="55%" stopColor="#d4a13c" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#d4a13c" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="bloomBL" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#c99b35" stopOpacity="0.22" />
            <Stop offset="60%" stopColor="#c99b35" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#c99b35" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="bloomTL" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#3a4a8c" stopOpacity="0.28" />
            <Stop offset="100%" stopColor="#3a4a8c" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#bgSheen)" />
        {/* cool blue wash top-left for depth */}
        <Ellipse cx={SCREEN_W * 0.08} cy={SCREEN_H * 0.1} rx={SCREEN_W * 0.7} ry={SCREEN_H * 0.3} fill="url(#bloomTL)" />
        {/* warm gold bloom top-right */}
        <Ellipse cx={SCREEN_W * 0.92} cy={SCREEN_H * 0.16} rx={SCREEN_W * 0.75} ry={SCREEN_H * 0.32} fill="url(#bloomTR)" />
        {/* soft gold bloom bottom-left */}
        <Ellipse cx={SCREEN_W * 0.06} cy={SCREEN_H * 0.9} rx={SCREEN_W * 0.65} ry={SCREEN_H * 0.28} fill="url(#bloomBL)" />
      </Svg>

      <View style={styles.center}>
        {/* Soft radial glow behind the logo. */}
        <Animated.View style={[styles.glowWrap, { opacity: glow }]} pointerEvents="none">
          <Svg width={GLOW} height={GLOW}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={theme.colors.gold} stopOpacity="0.55" />
                <Stop offset="38%" stopColor={theme.colors.gold} stopOpacity="0.22" />
                <Stop offset="65%" stopColor={theme.colors.gold} stopOpacity="0.06" />
                <Stop offset="100%" stopColor={theme.colors.gold} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width={GLOW} height={GLOW} fill="url(#glow)" />
          </Svg>
        </Animated.View>

        <View style={styles.logoBox}>
          <Image
            source={require('@/assets/images/besqq_b_logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <Image
          source={require('@/assets/images/besqaa_text.png')}
          style={styles.brandImage}
          contentFit="contain"
        />
        <Text style={styles.tagline}>SCAN · SOURCE · SUPPLY</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.hint}>Loading… {pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center' },
  center: { alignItems: 'center' },
  glowWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100 - GLOW / 2, // center the glow on the logo box
    alignItems: 'center',
  },
  logoBox: {
    width: 200,
    height: 200,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.28)',
  },
  logo: { width: 150, height: 142 },
  // BESQAA wordmark image (1961×336 ≈ 5.84:1 aspect ratio).
  brandImage: {
    width: 268,
    height: 46,
    marginTop: 32,
  },
  tagline: {
    color: theme.colors.gold,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 12,
  },
  bottom: { position: 'absolute', bottom: 60, left: 40, right: 40, alignItems: 'center' },
  track: {
    height: 4,
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { height: 4, backgroundColor: theme.colors.gold, borderRadius: 2 },
  hint: { color: theme.colors.textMuted, marginTop: 22, fontWeight: '600', letterSpacing: 1 },
});
