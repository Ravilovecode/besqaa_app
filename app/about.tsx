import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';

export default function About() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const version = Constants.expoConfig?.version || '1.0.0';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>About Besqaa</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <View style={styles.logoBox}>
          <Image
            source={require('@/assets/images/besqaalogo.png')}
            style={{ width: 150, height: 150 }}
            contentFit="contain"
          />
        </View>
        <Text style={styles.tagline}>SCAN · SOURCE · SUPPLY</Text>

        <Text style={styles.body}>
          Besqaa is a B2B sourcing marketplace — scan, source and supply electronics and home
          essentials with GST-verified sellers, fast fulfilment and transparent pricing.
        </Text>

        <View style={styles.card}>
          <Row label="Version" value={version} />
          <Row label="Website" value="besqaa.in" />
          <Row label="Support" value="support@besqaa.in" last />
        </View>

        <Text style={styles.memory}>E-Commerce Company{'\n'}In the memory of Sundaram Shyamal</Text>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
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
  logoBox: {
    width: 170,
    height: 170,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    overflow: 'hidden',
  },
  tagline: {
    color: theme.colors.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 20,
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 18,
    marginTop: 24,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
  rowLabel: { color: theme.colors.textMuted, fontSize: 15 },
  rowValue: { color: theme.colors.white, fontSize: 15, fontWeight: '700' },
  memory: {
    color: theme.colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 20,
  },
});
