import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

export function InfoBanner({ message, retry }: { message: string; retry?: () => void }) {
  return <View style={styles.box}><Ionicons name="alert-circle-outline" size={21} color={colors.error} /><Text style={styles.message}>{message}</Text>{retry && <Pressable onPress={retry}><Text style={styles.retry}>Tentar novamente</Text></Pressable>}</View>;
}

const styles = StyleSheet.create({ box: { padding: 15, borderRadius: 14, backgroundColor: colors.errorBackground, flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, message: { color: colors.error, fontSize: 13, lineHeight: 19, flex: 1, minWidth: 170 }, retry: { color: colors.error, fontSize: 13, fontWeight: '800' } });
