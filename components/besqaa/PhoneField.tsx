import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '@/lib/theme';

// Valid Indian mobile: exactly 10 digits, starting 6-9.
export function isValidIndianMobile(digits: string): boolean {
  return /^[6-9]\d{9}$/.test(digits);
}

// Strips formatting / country code, keeping the local 10 digits for editing.
export function normalizeIndianMobile(raw?: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

type Props = Omit<TextInputProps, 'value' | 'onChangeText' | 'style'> & {
  label?: string;
  value: string; // 10 local digits only — caller submits as +91<value>
  onChangeText: (digits: string) => void;
};

// Phone input with a fixed +91 prefix and live 10-digit validation.
export function PhoneField({ label, value, onChangeText, ...rest }: Props) {
  const valid = isValidIndianMobile(value);
  const showInvalid = value.length === 10 && !valid;

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrap, showInvalid && styles.wrapInvalid]}>
        <Ionicons name="call-outline" size={20} color={theme.colors.gold} />
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+91</Text>
        </View>
        <TextInput
          keyboardType="number-pad"
          maxLength={10}
          placeholder="10-digit mobile number"
          placeholderTextColor={theme.colors.textDim}
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/\D/g, '').slice(0, 10))}
          style={styles.input}
          {...rest}
        />
        {value.length > 0 && (
          <Ionicons
            name={valid ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={
              valid
                ? theme.colors.success
                : showInvalid
                  ? theme.colors.danger
                  : theme.colors.textDim
            }
          />
        )}
      </View>
      {showInvalid ? (
        <Text style={styles.hint}>Indian mobile numbers start with 6, 7, 8 or 9</Text>
      ) : value.length > 0 && value.length < 10 ? (
        <Text style={styles.hintMuted}>{10 - value.length} more digit{10 - value.length === 1 ? '' : 's'}</Text>
      ) : null}
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
    gap: 10,
  },
  wrapInvalid: { borderColor: 'rgba(239,106,106,0.6)' },
  prefix: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: theme.colors.cardBorder,
  },
  prefixText: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  input: { flex: 1, color: theme.colors.text, fontSize: 16, paddingVertical: 14, letterSpacing: 0.5 },
  hint: { color: theme.colors.danger, fontSize: 12, marginTop: 6 },
  hintMuted: { color: theme.colors.textDim, fontSize: 12, marginTop: 6 },
});
