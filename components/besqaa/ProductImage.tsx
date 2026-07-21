import { Image } from 'expo-image';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/lib/theme';

type Props = {
  // Callers pass layout styles (width/height/margin/borderRadius) valid for both
  // the Image and the placeholder View.
  uri?: string | null;
  style?: ViewStyle;
  rounded?: number;
  label?: string;
};

// Renders the product image or a branded placeholder when none exists yet.
export function ProductImage({ uri, style, rounded = theme.radius.md, label }: Props) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ borderRadius: rounded }, style as object]}
        contentFit="cover"
        transition={200}
      />
    );
  }
  return (
    <View style={[styles.placeholder, { borderRadius: rounded }, style]}>
      <Ionicons name="image-outline" size={26} color={theme.colors.textDim} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: { color: theme.colors.textDim, fontSize: 12 },
});
