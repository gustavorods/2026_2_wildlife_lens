import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

type IconName = keyof typeof Ionicons.glyphMap;

interface Props {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'light';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function AppButton({ label, onPress, icon, variant = 'primary', disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, variant === 'primary' ? styles.primary : variant === 'light' ? styles.light : styles.secondary, isDisabled && styles.disabled, pressed && styles.pressed, style]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : colors.forest} /> : icon ? <Ionicons name={icon} size={18} color={variant === 'primary' ? '#fff' : colors.forest} /> : null}
        <Text style={[styles.label, variant === 'primary' ? styles.primaryLabel : styles.otherLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 15, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  light: { backgroundColor: colors.mint },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: { fontSize: 15, fontWeight: '700' },
  primaryLabel: { color: '#fff' },
  otherLabel: { color: colors.forest },
});
