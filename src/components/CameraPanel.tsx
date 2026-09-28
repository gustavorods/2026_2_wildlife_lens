import { useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { AppButton } from './AppButton';

export function CameraPanel({ onPhoto, onClose }: { onPhoto: (uri: string) => void; onClose: () => void }) {
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const permissionRequested = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && !permissionRequested.current) {
      permissionRequested.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission]);

  async function takePhoto() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const photo = await camera.current?.takePictureAsync({ quality: 0.8, shutterSound: true });
      if (!photo?.uri) throw new Error('A câmera não retornou uma foto.');
      onPhoto(photo.uri);
    } catch {
      setError('Não foi possível fotografar. Tente novamente ou escolha uma imagem da galeria.');
    } finally {
      setBusy(false);
    }
  }

  if (!permission) return <View style={styles.fallback}><ActivityIndicator color={colors.forest} /><Text style={styles.fallbackText}>Verificando câmera...</Text></View>;
  if (!permission.granted) return <View style={styles.fallback}><Ionicons name="camera-outline" size={34} color={colors.green} /><Text style={styles.fallbackTitle}>Câmera indisponível</Text><Text style={styles.fallbackText}>Autorize o acesso à câmera nas configurações do dispositivo ou navegador para fotografar.</Text>{permission.canAskAgain && <AppButton label="Permitir câmera" onPress={() => void requestPermission()} variant="secondary" />}<AppButton label="Voltar" onPress={onClose} variant="light" /></View>;

  return <View style={styles.container}>
    <CameraView ref={camera} facing="back" style={styles.preview} onCameraReady={() => setReady(true)} onMountError={() => setError('A câmera não pôde ser iniciada neste dispositivo ou navegador.')} />
    <View style={styles.topBar}><Pressable accessibilityLabel="Fechar câmera" onPress={onClose} style={styles.close}><Ionicons name="close" size={22} color="#fff" /></Pressable><View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>CÂMERA AO VIVO</Text></View></View>
    <View style={styles.bottomBar}><Text style={styles.hint}>{error ?? (ready ? 'Enquadre o animal e toque para capturar' : 'Iniciando câmera...')}</Text><Pressable accessibilityLabel="Tirar foto" disabled={!ready || busy} onPress={() => void takePhoto()} style={[styles.shutter, (!ready || busy) && { opacity: 0.55 }]}><View style={styles.shutterInner}>{busy && <ActivityIndicator color={colors.forest} />}</View></Pressable></View>
  </View>;
}

const styles = StyleSheet.create({
  container: { height: 440, borderRadius: 20, overflow: 'hidden', backgroundColor: '#15251D' },
  preview: { ...StyleSheet.absoluteFill },
  topBar: { position: 'absolute', top: 18, left: 18, right: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 12, paddingVertical: 9 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF8E80' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: 126, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', paddingTop: 14 },
  hint: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center', paddingHorizontal: 14 },
  shutter: { width: 68, height: 68, borderRadius: 34, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  shutterInner: { width: 51, height: 51, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  fallback: { minHeight: 330, borderRadius: 20, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', gap: 13, padding: 26 },
  fallbackTitle: { fontSize: 19, fontWeight: '800', color: colors.forest },
  fallbackText: { fontSize: 14, lineHeight: 21, textAlign: 'center', color: colors.muted },
});
