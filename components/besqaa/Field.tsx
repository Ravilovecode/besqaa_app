import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '@/lib/theme';

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  // Trailing icon inside the tile (e.g. password eye) — always vertically centered.
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
};

export function Field({ label, icon, rightIcon, onRightIconPress, style, ...rest }: Props) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.wrap}>
        {icon ? (
          <Ionicons name={icon} size={20} color={theme.colors.gold} style={{ marginRight: 10 }} />
        ) : null}
        <TextInput
          placeholderTextColor={theme.colors.textDim}
          style={[styles.input, style]}
          {...rest}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={10} style={{ marginLeft: 10 }}>
            <Ionicons name={rightIcon} size={22} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 8, fontWeight: '600' },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: { flex: 1, color: theme.colors.text, fontSize: 16, paddingVertical: 14 },
});
