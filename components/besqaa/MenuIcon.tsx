import { StyleSheet, View } from 'react-native';
import { theme } from '@/lib/theme';

type Props = {
  size?: number;
  color?: string;
  accent?: string;
};

// Sleek iOS-style drawer icon: staggered rounded bars (SF-Symbol-like),
// with a gold accent on the middle bar.
export function MenuIcon({ size = 22, color = theme.colors.text, accent = theme.colors.gold }: Props) {
  const barHeight = Math.max(2, Math.round(size * 0.12));
  const gap = Math.round(size * 0.24);
  return (
    <View style={{ width: size, justifyContent: 'center' }}>
      <View
        style={[
          styles.bar,
          { width: size, height: barHeight, borderRadius: barHeight, backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.bar,
          {
            width: size * 0.66,
            height: barHeight,
            borderRadius: barHeight,
            backgroundColor: accent,
            marginTop: gap,
          },
        ]}
      />
      <View
        style={[
          styles.bar,
          {
            width: size * 0.4,
            height: barHeight,
            borderRadius: barHeight,
            backgroundColor: color,
            marginTop: gap,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { alignSelf: 'flex-start' },
});
