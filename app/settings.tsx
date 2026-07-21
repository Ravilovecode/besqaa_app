import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';

type ToggleRow = { icon: keyof typeof Ionicons.glyphMap; label: string; key: string };

const TOGGLES: ToggleRow[] = [
  { icon: 'notifications-outline', label: 'Push notifications', key: 'push' },
  { icon: 'mail-outline', label: 'Order email updates', key: 'email' },
  { icon: 'pricetag-outline', label: 'Deal alerts', key: 'deals' },
];

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, boolean>>({
    push: true,
    email: true,
    deals: false,
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.section}>Notifications</Text>
        <View style={styles.card}>
          {TOGGLES.map((t, i) => (
            <View key={t.key} style={[styles.row, i < TOGGLES.length - 1 && styles.rowBorder]}>
              <Ionicons name={t.icon} size={22} color={theme.colors.gold} />
              <Text style={styles.rowLabel}>{t.label}</Text>
              <Switch
                value={values[t.key]}
                onValueChange={(v) => setValues((s) => ({ ...s, [t.key]: v }))}
                trackColor={{ true: theme.colors.gold, false: theme.colors.surface }}
                thumbColor={theme.colors.white}
              />
            </View>
          ))}
        </View>

        <Text style={styles.section}>Preferences</Text>
        <View style={styles.card}>
          <LinkRow icon="globe-outline" label="Language" value="English" />
          <LinkRow icon="cash-outline" label="Currency" value="₹ INR" last />
        </View>

        <Text style={styles.hint}>More settings coming soon.</Text>
      </ScrollView>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Ionicons name={icon} size={22} color={theme.colors.gold} />
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
  section: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
  rowLabel: { flex: 1, color: theme.colors.white, fontSize: 16, fontWeight: '600' },
  rowValue: { color: theme.colors.textMuted, fontSize: 15, fontWeight: '600' },
  hint: { color: theme.colors.textDim, fontSize: 13, textAlign: 'center', marginTop: 20 },
});
