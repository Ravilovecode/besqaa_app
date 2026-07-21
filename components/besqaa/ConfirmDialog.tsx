import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/lib/theme';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
};

// App-styled confirmation popup (replaces the default OS Alert) — dark card,
// gold/danger accents, matching the Besqaa theme.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
  icon,
  onConfirm,
  onCancel,
}: Props) {
  const accent = destructive ? theme.colors.danger : theme.colors.gold;
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: destructive ? theme.colors.dangerSoft : theme.colors.goldSoft },
            ]}
          >
            <Ionicons name={icon || (destructive ? 'log-out-outline' : 'help-circle-outline')} size={30} color={accent} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, destructive ? styles.dangerBtn : styles.confirmBtn]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={destructive ? theme.colors.white : '#1a1400'} />
              ) : (
                <Text style={destructive ? styles.dangerText : styles.confirmText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 18, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { color: theme.colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  message: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.cardBorder },
  cancelText: { color: theme.colors.text, fontWeight: '700', fontSize: 15 },
  confirmBtn: { backgroundColor: theme.colors.gold },
  confirmText: { color: '#1a1400', fontWeight: '800', fontSize: 15 },
  dangerBtn: { backgroundColor: theme.colors.danger },
  dangerText: { color: theme.colors.white, fontWeight: '800', fontSize: 15 },
});
