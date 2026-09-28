import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AnimalRecord } from '@/@types/animal';
import { colors } from '@/constants/colors';

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function formatCoordinate(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(5)}° ${value >= 0 ? positive : negative}`;
}

export function AnimalCard({ record, onPress, width }: { record: AnimalRecord; onPress: () => void; width: number }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}>
      <Image source={{ uri: record.imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <View style={styles.metaRow}><Ionicons name="calendar-outline" size={14} color={colors.muted} /><Text style={styles.date}>{formatDate(record.createdAt)}</Text></View>
        <Text style={styles.title}>Encontro na natureza</Text>
        <View style={styles.footer}><View style={styles.location}><Ionicons name="location-outline" size={15} color={colors.green} /><Text numberOfLines={1} style={styles.coords}>{formatCoordinate(record.latitude, 'N', 'S')}, {formatCoordinate(record.longitude, 'L', 'O')}</Text></View><Ionicons name="arrow-forward" size={17} color={colors.forest} /></View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, marginBottom: 20, shadowColor: colors.forest, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, elevation: 2 },
  pressed: { opacity: 0.87, transform: [{ scale: 0.99 }] },
  image: { width: '100%', height: 216, backgroundColor: colors.sage },
  body: { padding: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginTop: 10, marginBottom: 17 },
  footer: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  location: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  coords: { fontSize: 11, fontWeight: '700', color: colors.green, flex: 1 },
});
