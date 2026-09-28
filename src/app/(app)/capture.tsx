import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { CameraPanel } from '@/components/CameraPanel';
import { InfoBanner } from '@/components/InfoBanner';
import { formatCoordinate } from '@/components/AnimalCard';
import { colors } from '@/constants/colors';
import { useRecords } from '@/contexts/RecordsContext';
import { chooseAnimalPhoto } from '@/services/camera';
import { getAnimalLocation } from '@/services/location';

type Coordinates = { latitude: number; longitude: number };

export default function CaptureScreen() {
  const router = useRouter();
  const desktop = useWindowDimensions().width >= 900;
  const { addRecord } = useRecords();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function locate() {
    setCoordinates(null);
    setLocationLoading(true);
    setError(null);
    try { setCoordinates(await getAnimalLocation()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível obter a localização.'); }
    finally { setLocationLoading(false); }
  }

  function onPhoto(uri: string) {
    setImageUri(uri);
    setCameraOpen(false);
    void locate();
  }

  async function choosePhoto() {
    setError(null);
    try { const uri = await chooseAnimalPhoto(); if (uri) onPhoto(uri); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível abrir a galeria.'); }
  }

  async function save() {
    if (!imageUri || !coordinates || saving) return;
    setSaving(true);
    setError(null);
    try {
      const record = await addRecord({ imageUri, ...coordinates });
      setConfirmOpen(false);
      router.replace(`/animal/${record.id}`);
    } catch {
      setConfirmOpen(false);
      setError('Não foi possível salvar o registro. Verifique o espaço disponível e tente novamente.');
    } finally { setSaving(false); }
  }

  return <View>
    <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={17} color={colors.green} /><Text style={styles.backText}>Voltar à galeria</Text></Pressable>
    <View style={styles.eyebrow}><View style={styles.stepDot} /><Text style={styles.eyebrowText}>NOVO ENCONTRO</Text></View>
    <Text style={[styles.title, !desktop && styles.mobileTitle]}>Registre uma descoberta<Text style={styles.accent}>.</Text></Text>
    <Text style={styles.subtitle}>Uma foto e a localização são tudo o que você precisa.</Text>

    <View style={[styles.columns, !desktop && styles.mobileColumns]}>
      <View style={[styles.photoColumn, !desktop && styles.fullWidth]}>
        <View style={styles.sectionLabel}><View style={styles.step}><Text style={styles.stepText}>01</Text></View><Text style={styles.sectionTitle}>Foto do animal</Text></View>
        {cameraOpen ? <CameraPanel onPhoto={onPhoto} onClose={() => setCameraOpen(false)} /> : imageUri ? <View style={styles.previewWrap}><Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" /><View style={styles.previewBadge}><Ionicons name="checkmark-circle" size={15} color={colors.green} /><Text style={styles.previewBadgeText}>FOTO SELECIONADA</Text></View></View> : <View style={styles.placeholder}><View style={styles.photoIcon}><Ionicons name="camera-outline" size={32} color={colors.green} /></View><Text style={styles.placeholderTitle}>Seu próximo encontro começa com uma foto</Text><Text style={styles.placeholderText}>Use a câmera ou escolha uma imagem que já está no dispositivo.</Text></View>}
        {!cameraOpen && <View style={styles.photoActions}><AppButton label={imageUri ? 'Tirar outra foto' : 'Abrir câmera'} icon="camera-outline" onPress={() => { setError(null); setCameraOpen(true); }} style={styles.actionButton} /><AppButton label="Escolher da galeria" icon="images-outline" variant="secondary" onPress={() => void choosePhoto()} style={styles.actionButton} /></View>}
      </View>

      <View style={[styles.detailsColumn, !desktop && styles.fullWidth]}>
        <View style={styles.sectionLabel}><View style={styles.step}><Text style={styles.stepText}>02</Text></View><Text style={styles.sectionTitle}>Localização</Text></View>
        <View style={styles.locationCard}><View style={styles.locationIcon}><Ionicons name="location-outline" size={27} color={colors.green} /></View><Text style={styles.locationTitle}>{coordinates ? 'Localização encontrada' : locationLoading ? 'Buscando sua localização...' : 'Onde você encontrou este animal?'}</Text><Text style={styles.locationDescription}>{coordinates ? 'Confira as coordenadas antes de salvar.' : 'Usaremos sua localização atual para marcar o lugar deste encontro.'}</Text>
          {locationLoading ? <ActivityIndicator color={colors.green} style={styles.locationLoader} /> : coordinates ? <View style={styles.coordinates}><Coordinate label="LATITUDE" value={formatCoordinate(coordinates.latitude, 'N', 'S')} /><View style={styles.coordinateDivider} /><Coordinate label="LONGITUDE" value={formatCoordinate(coordinates.longitude, 'L', 'O')} /></View> : null}
          {imageUri && !locationLoading && <Pressable onPress={() => void locate()} style={styles.refresh}><Ionicons name="refresh-outline" size={15} color={colors.green} /><Text style={styles.refreshText}>{coordinates ? 'Atualizar localização' : 'Tentar obter localização'}</Text></Pressable>}
        </View>
        {error && <View style={styles.error}><InfoBanner message={error} /></View>}
        <View style={styles.saveCard}><View style={styles.saveTop}><Ionicons name="shield-checkmark-outline" size={20} color={colors.green} /><Text style={styles.saveTitle}>Pronto para guardar?</Text></View><Text style={styles.saveDescription}>Seu registro ficará salvo somente neste dispositivo ou navegador.</Text><AppButton label="Salvar registro" icon="checkmark" disabled={!imageUri || !coordinates || locationLoading} onPress={() => setConfirmOpen(true)} style={styles.saveButton} /></View>
      </View>
    </View>

    <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => !saving && setConfirmOpen(false)}><View style={styles.modalOverlay}><View style={styles.modalCard}><View style={styles.modalIcon}><Ionicons name="paw" size={28} color={colors.green} /></View><Text style={styles.modalTitle}>Salvar este encontro?</Text><Text style={styles.modalDescription}>A foto, as coordenadas e a data serão adicionadas à sua galeria.</Text><View style={styles.modalActions}><AppButton label="Cancelar" variant="secondary" onPress={() => setConfirmOpen(false)} disabled={saving} style={styles.modalButton} /><AppButton label="Confirmar e salvar" onPress={() => void save()} loading={saving} style={styles.modalButton} /></View></View></View></Modal>
  </View>;
}

function Coordinate({ label, value }: { label: string; value: string }) { return <View style={styles.coordinate}><Text style={styles.coordinateLabel}>{label}</Text><Text style={styles.coordinateValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 30, alignSelf: 'flex-start' }, backText: { color: colors.green, fontSize: 13, fontWeight: '700' }, eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }, stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }, eyebrowText: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.7 }, title: { color: colors.forestDark, fontSize: 36, fontWeight: '800', letterSpacing: -1.5 }, mobileTitle: { fontSize: 29 }, accent: { color: colors.accent }, subtitle: { color: colors.muted, fontSize: 14, marginTop: 6, marginBottom: 32 },
  columns: { flexDirection: 'row', gap: 30, alignItems: 'flex-start' }, mobileColumns: { flexDirection: 'column', gap: 30 }, photoColumn: { flex: 1, minWidth: 0 }, detailsColumn: { flex: 0.8, minWidth: 0 }, fullWidth: { width: '100%' }, sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }, step: { width: 31, height: 31, borderRadius: 10, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }, stepText: { color: colors.green, fontSize: 11, fontWeight: '800' }, sectionTitle: { color: colors.forest, fontSize: 17, fontWeight: '800' },
  placeholder: { minHeight: 350, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 28 }, photoIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 17 }, placeholderTitle: { color: colors.forest, fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center', maxWidth: 260 }, placeholderText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 270 },
  previewWrap: { height: 440, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.sage }, preview: { width: '100%', height: '100%' }, previewBadge: { position: 'absolute', top: 17, left: 17, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 5 }, previewBadgeText: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  photoActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }, actionButton: { flexGrow: 1 },
  locationCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 25, alignItems: 'flex-start' }, locationIcon: { width: 54, height: 54, backgroundColor: colors.mint, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, locationTitle: { color: colors.forest, fontSize: 18, fontWeight: '800' }, locationDescription: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 6 }, locationLoader: { marginTop: 22 }, coordinates: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.mint, borderRadius: 14, padding: 14, marginTop: 20, width: '100%' }, coordinate: { flex: 1 }, coordinateLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }, coordinateValue: { color: colors.forest, fontSize: 13, fontWeight: '800', marginTop: 6 }, coordinateDivider: { width: 1, height: 35, backgroundColor: colors.line, marginHorizontal: 12 }, refresh: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 18 }, refreshText: { color: colors.green, fontSize: 12, fontWeight: '800' }, error: { marginTop: 15 },
  saveCard: { marginTop: 18, padding: 23, backgroundColor: colors.sage, borderRadius: 20 }, saveTop: { flexDirection: 'row', alignItems: 'center', gap: 9 }, saveTitle: { color: colors.forest, fontSize: 16, fontWeight: '800' }, saveDescription: { color: colors.green, fontSize: 12, lineHeight: 19, marginTop: 8 }, saveButton: { marginTop: 19 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(14,34,27,0.57)', padding: 20, alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 430, backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center' }, modalIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, modalTitle: { color: colors.forest, fontSize: 22, fontWeight: '800', textAlign: 'center' }, modalDescription: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 9, marginBottom: 24 }, modalActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' }, modalButton: { flexGrow: 1 },
});
