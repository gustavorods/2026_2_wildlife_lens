import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AnimalCard } from '@/components/AnimalCard';
import { AppButton } from '@/components/AppButton';
import { InfoBanner } from '@/components/InfoBanner';
import { useRecords } from '@/contexts/RecordsContext';
import { colors } from '@/constants/colors';

export default function GalleryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { records, loading, error, reload } = useRecords();
  const available = Math.min(width - (desktop ? 258 + 96 : 40), 1144);
  const columns = available >= 900 ? 3 : available >= 580 ? 2 : 1;
  const cardWidth = Math.max(0, (available - (columns - 1) * 20) / columns);

  return <View>
    <View style={styles.eyebrowRow}><View style={styles.eyebrowDot} /><Text style={styles.eyebrow}>SEU DIÁRIO DA NATUREZA</Text></View>
    <View style={[styles.headingRow, !desktop && { alignItems: 'flex-start' }]}>
      <View><Text style={[styles.title, !desktop && styles.mobileTitle]}>Minha galeria<Text style={styles.titleAccent}>.</Text></Text><Text style={styles.subtitle}>Um lugar para guardar cada encontro especial.</Text></View>
      {desktop && <AppButton label="Novo registro" icon="add" onPress={() => router.push('/capture')} />}
    </View>

    <LinearGradient colors={[colors.forest, '#2D664B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, !desktop && styles.mobileHero]}>
      <View style={styles.heroCircleOne} /><View style={styles.heroCircleTwo} />
      <View style={styles.heroTextWrap}><View style={styles.heroTag}><Ionicons name="sparkles-outline" size={13} color="#E8C99F" /><Text style={styles.heroTagText}>COLECIONE MOMENTOS</Text></View><Text style={[styles.heroTitle, !desktop && styles.mobileHeroTitle]}>A natureza está{ '\n' }logo ali fora.</Text><Text style={styles.heroSubtitle}>Fotografe os animais que encontrar e crie um mapa pessoal das suas descobertas.</Text><Pressable onPress={() => router.push('/capture')} style={styles.heroLink}><Text style={styles.heroLinkText}>Começar um registro</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></Pressable></View>
      {desktop && <View style={styles.heroSymbol}><Ionicons name="paw" size={105} color="#D7E9D7" /></View>}
    </LinearGradient>

    <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Seus registros</Text><Text style={styles.sectionSubtitle}>{records.length === 0 ? 'Sua coleção começa aqui' : `${records.length} ${records.length === 1 ? 'encontro registrado' : 'encontros registrados'}`}</Text></View>{records.length > 0 && <View style={styles.countPill}><Text style={styles.countText}>{records.length.toString().padStart(2, '0')}</Text></View>}</View>
    {error && <View style={styles.errorWrap}><InfoBanner message={error} retry={() => void reload()} /></View>}
    {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={colors.forest} /><Text style={styles.loadingText}>Carregando seus encontros...</Text></View> : records.length === 0 && !error ? <EmptyState onAdd={() => router.push('/capture')} /> : <View style={styles.grid}>{records.map((record) => <AnimalCard key={record.id} record={record} width={cardWidth} onPress={() => router.push(`/animal/${record.id}`)} />)}</View>}
  </View>;
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return <View style={styles.empty}><View style={styles.emptyArt}><View style={styles.emptyOrbBack} /><View style={styles.emptyOrb}><Ionicons name="paw" size={56} color={colors.green} /></View><View style={styles.emptySpark}><Ionicons name="sparkles" size={19} color={colors.accent} /></View></View><Text style={styles.emptyTitle}>Sua aventura começa aqui</Text><Text style={styles.emptyText}>Ainda não há animais na galeria. Registre seu primeiro encontro e comece a guardar suas descobertas.</Text><AppButton label="Registrar meu primeiro animal" icon="camera-outline" onPress={onAdd} /></View>;
}

const styles = StyleSheet.create({
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }, eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }, eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 28 },
  title: { color: colors.forestDark, fontSize: 37, fontWeight: '800', letterSpacing: -1.8 }, mobileTitle: { fontSize: 30 }, titleAccent: { color: colors.accent }, subtitle: { color: colors.muted, fontSize: 14, marginTop: 5 },
  hero: { borderRadius: 24, minHeight: 244, overflow: 'hidden', padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 38 }, mobileHero: { padding: 24, minHeight: 265, marginBottom: 32 },
  heroCircleOne: { position: 'absolute', width: 330, height: 330, borderRadius: 165, borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)', right: -50, top: -130 }, heroCircleTwo: { position: 'absolute', width: 230, height: 230, borderRadius: 115, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', right: 115, bottom: -130 },
  heroTextWrap: { maxWidth: 530, zIndex: 1 }, heroTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 }, heroTagText: { color: '#E8C99F', fontSize: 10, letterSpacing: 1.5, fontWeight: '800' },
  heroTitle: { color: '#fff', fontSize: 31, lineHeight: 37, fontWeight: '800', letterSpacing: -1.1 }, mobileHeroTitle: { fontSize: 27, lineHeight: 33 }, heroSubtitle: { color: '#D4E6DA', fontSize: 13, lineHeight: 20, marginTop: 12, maxWidth: 420 }, heroLink: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 20 }, heroLinkText: { color: '#fff', fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' }, heroSymbol: { width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 42 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, sectionTitle: { color: colors.forestDark, fontSize: 22, fontWeight: '800', letterSpacing: -0.6 }, sectionSubtitle: { color: colors.muted, fontSize: 13, marginTop: 3 }, countPill: { backgroundColor: colors.sage, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9 }, countText: { color: colors.forest, fontSize: 13, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 }, errorWrap: { marginBottom: 20 }, loading: { minHeight: 230, alignItems: 'center', justifyContent: 'center', gap: 14 }, loadingText: { color: colors.muted, fontSize: 13 },
  empty: { minHeight: 310, padding: 25, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emptyArt: { height: 116, width: 150, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, emptyOrbBack: { position: 'absolute', width: 107, height: 107, borderRadius: 54, backgroundColor: '#F1F5E9', transform: [{ translateX: 22 }, { translateY: 5 }] }, emptyOrb: { width: 93, height: 93, borderRadius: 47, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, emptySpark: { position: 'absolute', top: 7, right: 11 },
  emptyTitle: { color: colors.forest, fontSize: 20, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' }, emptyText: { color: colors.muted, maxWidth: 380, fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 8, marginBottom: 22 },
});
