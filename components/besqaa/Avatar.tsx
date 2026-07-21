import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/lib/theme';
import type { User } from '@/lib/types';

type Props = {
  user: User | null;
  size?: number;
  rounded?: number;
};

// Profile avatar: S3 photo when set, gold initial tile otherwise.
export function Avatar({ user, size = 56, rounded }: Props) {
  const radius = rounded ?? Math.round(size * 0.3);
  if (user?.avatarUrl) {
    return (
      <Image
        source={{ uri: user.avatarUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
        transition={150}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
        {user?.name?.[0]?.toUpperCase() || 'B'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { color: '#1a1400', fontWeight: '800' },
});
