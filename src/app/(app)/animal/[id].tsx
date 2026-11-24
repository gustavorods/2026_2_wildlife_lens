import { useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { formatCoordinate, formatDate } from '@/components/AnimalCard';
import { colors } from '@/constants/colors';
import { useRecords } from '@/contexts/RecordsContext';

export default function AnimalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const desktop = useWindowDimensions().width >= 900;
  const { records, loading, removeRecord } = useRecords();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deletingRef = useRef(false);
  const record = records.find((item) => item.id === id);

  async function handleDelete() {
    if (!record || deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    setDeleteError(null);
    try {
      await removeRecord(record.id);
      router.replace('/');
    } catch (error) {
      console.warn('Falha ao apagar registro:', error);
      setDeleteError('Não foi possível apagar a foto. Tente novamente.');
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.forest} /><Text style={styles.muted}>Carregando registro...</Text></View>;
  if (!record) return <View style={styles.center}><Ionicons name="images-outline" size={42} color={colors.green} /><Text style={styles.missingTitle}>Registro não encontrado</Text><Text style={styles.muted}>Ele pode não existir neste dispositivo ou navegador.</Text><AppButton label="Voltar à galeria" onPress={() => router.replace('/')} style={{ marginTop: 18 }} /></View>;

  return <View>
    <Pressable onPress={() => router.push('/')} style={styles.back}><Ionicons name="arrow-back" size={17} color={colors.green} /><Text style={styles.backText}>Voltar à galeria</Text></Pressable>
    <View style={styles.eyebrow}><View style={styles.dot} /><Text style={styles.eyebrowText}>DETALHES DO ENCONTRO</Text></View>
    <Text style={[styles.title, !desktop && styles.mobileTitle]}>Uma história para lembrar<Text style={styles.accent}>.</Text></Text>
    <Text style={styles.subtitle}>Fotografado em {formatDate(record.createdAt)}</Text>
    <View style={[styles.columns, !desktop && styles.mobileColumns]}>
      <View style={[styles.imageColumn, !desktop && styles.fullWidth]}><Image source={{ uri: record.imageUri }} style={[styles.image, !desktop && styles.mobileImage]} resizeMode="contain" /><View style={styles.imageCaption}><Ionicons name="camera-outline" size={15} color={colors.muted} /><Text style={styles.captionText}>Registro original · {formatDate(record.createdAt)}</Text></View></View>
      <View style={[styles.infoColumn, !desktop && styles.fullWidth]}><View style={styles.infoCard}><View style={styles.cardHeader}><View style={styles.cardIcon}><Ionicons name="location-outline" size={23} color={colors.green} /></View><View><Text style={styles.cardTitle}>Localização</Text><Text style={styles.cardSubtitle}>Onde este animal foi encontrado</Text></View></View><View style={styles.coordinateBox}><DetailRow label="LATITUDE" value={formatCoordinate(record.latitude, 'N', 'S')} /><View style={styles.divider} /><DetailRow label="LONGITUDE" value={formatCoordinate(record.longitude, 'L', 'O')} /></View><Text style={styles.rawCoordinates}>{record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}</Text></View>
        <View style={styles.infoCard}><View style={styles.cardHeader}><View style={styles.cardIcon}><Ionicons name="calendar-outline" size={23} color={colors.green} /></View><View><Text style={styles.cardTitle}>Data do registro</Text><Text style={styles.cardSubtitle}>Momento do encontro</Text></View></View><Text style={styles.dateValue}>{formatDate(record.createdAt)}</Text></View>
        <View style={styles.idCard}><Ionicons name="finger-print-outline" size={18} color={colors.muted} /><View style={{ flex: 1 }}><Text style={styles.idLabel}>IDENTIFICADOR DO REGISTRO</Text><Text selectable style={styles.idValue}>{record.id}</Text></View></View>
        {confirmDelete ? <View style={styles.deleteCard}>
          <Text style={styles.cardTitle}>Apagar esta foto?</Text>
          <Text style={styles.deleteDescription}>A foto e os dados deste encontro serão removidos da galeria do app. Esta ação não pode ser desfeita.</Text>
          {deleteError && <Text accessibilityRole="alert" style={styles.deleteError}>{deleteError}</Text>}
          <AppButton label={deleting ? 'Apagando...' : 'Sim, apagar foto'} icon="trash-outline" loading={deleting} onPress={() => void handleDelete()} style={{ backgroundColor: colors.error }} />
          <AppButton label="Cancelar" variant="secondary" disabled={deleting} onPress={() => { setConfirmDelete(false); setDeleteError(null); }} />
        </View> : <AppButton label="Apagar foto" icon="trash-outline" onPress={() => setConfirmDelete(true)} style={{ backgroundColor: colors.error }} />}
      </View>
    </View>
  </View>;
}

function DetailRow({ label, value }: { label: string; value: string }) { return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  deleteCard: { padding: 20, borderRadius: 16, backgroundColor: colors.errorBackground, gap: 12 },
  deleteDescription: { color: colors.text, fontSize: 14, lineHeight: 21 },
  deleteError: { color: colors.error, fontSize: 14 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 30, alignSelf: 'flex-start' }, backText: { color: colors.green, fontSize: 13, fontWeight: '700' }, eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }, eyebrowText: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.7 }, title: { color: colors.forestDark, fontSize: 36, fontWeight: '800', letterSpacing: -1.5 }, mobileTitle: { fontSize: 29 }, accent: { color: colors.accent }, subtitle: { color: colors.muted, fontSize: 14, marginTop: 6, marginBottom: 30 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 28 }, mobileColumns: { flexDirection: 'column' }, imageColumn: { flex: 1.3, minWidth: 0 }, fullWidth: { width: '100%' }, image: { height: 500, width: '100%', borderRadius: 22, backgroundColor: '#E7ECE5' }, mobileImage: { height: 360 }, imageCaption: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }, captionText: { color: colors.muted, fontSize: 12 }, infoColumn: { flex: 0.8, minWidth: 0, gap: 16 },
  infoCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 22 }, cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 }, cardIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: colors.forest, fontSize: 17, fontWeight: '800' }, cardSubtitle: { color: colors.muted, fontSize: 11, marginTop: 3 }, coordinateBox: { marginTop: 23, backgroundColor: colors.mint, borderRadius: 14, paddingHorizontal: 16 }, detailRow: { paddingVertical: 14 }, detailLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.9 }, detailValue: { color: colors.forest, fontSize: 17, fontWeight: '800', marginTop: 4 }, divider: { height: 1, backgroundColor: colors.line }, rawCoordinates: { color: colors.muted, fontSize: 11, marginTop: 12 }, dateValue: { color: colors.forest, fontSize: 16, fontWeight: '800', marginTop: 23 }, idCard: { flexDirection: 'row', gap: 11, backgroundColor: colors.sage, padding: 17, borderRadius: 16 }, idLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: colors.muted }, idValue: { color: colors.forest, fontSize: 12, fontWeight: '700', marginTop: 5 },
  center: { minHeight: 380, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }, missingTitle: { color: colors.forest, fontSize: 20, fontWeight: '800' }, muted: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
