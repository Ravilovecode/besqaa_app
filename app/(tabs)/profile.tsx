import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/besqaa/Avatar';
import { ConfirmDialog } from '@/components/besqaa/ConfirmDialog';
import { uploadImage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';
import type { User } from '@/lib/types';

type Row = { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void };

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut, refresh } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  async function changePhoto() {
    setAvatarError('');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadingAvatar(true);
    try {
      await uploadImage<{ user: User }>('/auth/me/avatar', 'avatar', result.assets[0].uri);
      await refresh();
    } catch (e: any) {
      setAvatarError(e.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  const rows: Row[] = [
    { icon: 'cube-outline', label: 'My orders', onPress: () => router.push('/orders') },
    { icon: 'heart-outline', label: 'Saved products', onPress: () => router.push('/saved') },
    { icon: 'location-outline', label: 'Addresses' },
    { icon: 'card-outline', label: 'Payments & GST' },
    { icon: 'information-circle-outline', label: 'About Besqaa', onPress: () => router.push('/about') },
  ];

  async function doLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      setConfirmLogout(false);
      router.replace('/(auth)/login');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: 40 }}
    >
      <View style={styles.avatarWrap}>
        {/* Tap the avatar to change the profile photo (uploads to S3). */}
        <Pressable onPress={changePhoto} disabled={uploadingAvatar}>
          <Avatar user={user} size={110} rounded={55} />
          <View style={styles.cameraBadge}>
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color="#1a1400" />
            ) : (
              <Ionicons name="camera" size={16} color="#1a1400" />
            )}
          </View>
        </Pressable>
        {avatarError ? <Text style={styles.avatarError}>{avatarError}</Text> : null}
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.gstVerified ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>GST VERIFIED SELLER</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statCard}>
        <Stat num={user?.addresses?.length ?? 0} label="Addresses" />
        <View style={styles.statDivider} />
        <Stat num={user?.savedProducts?.length ?? 0} label="Saved" />
        <View style={styles.statDivider} />
        <Stat num="4.8" label="Rating" />
      </View>

      <View style={styles.menu}>
        {rows.map((r, i) => (
          <Pressable
            key={r.label}
            style={[styles.menuRow, i < rows.length - 1 && styles.menuBorder]}
            onPress={r.onPress}
          >
            <Ionicons name={r.icon} size={22} color={theme.colors.gold} />
            <Text style={styles.menuLabel}>{r.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textDim} />
          </Pressable>
        ))}
        <Pressable style={styles.menuRow} onPress={() => setConfirmLogout(true)}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
          <Text style={[styles.menuLabel, { color: theme.colors.danger }]}>Sign out</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textDim} />
        </Pressable>
      </View>

      <ConfirmDialog
        visible={confirmLogout}
        destructive
        icon="log-out-outline"
        title="Log out?"
        message="Do you really want to log out of your Besqaa account?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        loading={loggingOut}
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </ScrollView>
  );
}

function Stat({ num, label }: { num: number | string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.statNum}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.gold,
    borderWidth: 2.5,
    borderColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarError: {
    color: theme.colors.danger,
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  name: { color: theme.colors.white, fontSize: 26, fontWeight: '800', marginTop: 16 },
  email: { color: theme.colors.textMuted, fontSize: 15, marginTop: 4 },
  badge: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  badgeText: { color: theme.colors.gold, fontWeight: '800', letterSpacing: 1, fontSize: 12 },
  statCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 20,
    marginBottom: 20,
  },
  statDivider: { width: 1, backgroundColor: theme.colors.cardBorder },
  statNum: { color: theme.colors.gold, fontSize: 26, fontWeight: '800' },
  statLabel: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  menu: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 18,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 18 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
  menuLabel: { flex: 1, color: theme.colors.white, fontSize: 16, fontWeight: '700' },
});
