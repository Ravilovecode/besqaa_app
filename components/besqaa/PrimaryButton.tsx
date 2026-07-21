import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/lib/theme';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'gold' | 'outline' | 'ghost';
  style?: ViewStyle;
};

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'gold',
  style,
}: Props) {
  const isGold = variant === 'gold';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isGold && styles.gold,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGold ? '#1a1400' : theme.colors.gold} />
      ) : (
        <Text
          style={[
            styles.text,
            isGold ? styles.textGold : { color: theme.colors.gold },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gold: {
    backgroundColor: theme.colors.gold,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: { opacity: 0.5 },
  text: { fontSize: 17, fontWeight: '700' },
  textGold: { color: '#1a1400' },
});
