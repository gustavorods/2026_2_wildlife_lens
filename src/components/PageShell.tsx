import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/colors';

export function PageShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const router = useRouter();
  const pathname = usePathname();
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.row}>
        {desktop && (
          <View style={styles.sidebar}>
            <Pressable onPress={() => router.push('/')} style={styles.brandRow}>
              <View style={styles.brandIcon}><Ionicons name="paw" size={23} color="#fff" /></View>
              <View><Text style={styles.brand}>olhar<Text style={styles.brandAccent}>.</Text></Text><Text style={styles.brandCaption}>SUA GALERIA DA NATUREZA</Text></View>
            </Pressable>
            <Text style={styles.navCaption}>MENU PRINCIPAL</Text>
            <NavItem active={pathname === '/'} icon="grid-outline" label="Minha galeria" onPress={() => router.push('/')} />
            <NavItem active={pathname === '/capture'} icon="camera-outline" label="Novo registro" onPress={() => router.push('/capture')} />
            <View style={styles.sidebarBottom}>
              <Ionicons name="leaf-outline" size={22} color={colors.green} />
              <Text style={styles.bottomText}>Cada encontro conta uma história. Guarde a sua.</Text>
            </View>
          </View>
        )}
        <View style={styles.main}>
          {!desktop && (
            <View style={styles.mobileHeader}>
              <Pressable onPress={() => router.push('/')} style={styles.mobileBrand}><View style={styles.mobileBrandIcon}><Ionicons name="paw" size={18} color="#fff" /></View><Text style={styles.mobileBrandText}>olhar<Text style={styles.brandAccent}>.</Text></Text></Pressable>
              <Pressable accessibilityLabel="Novo registro" onPress={() => router.push('/capture')} style={styles.mobileAdd}><Ionicons name="add" size={23} color={colors.forest} /></Pressable>
            </View>
          )}
          <ScrollView contentContainerStyle={[styles.scrollContent, desktop && styles.desktopContent]} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

function NavItem({ active, icon, label, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.navItem, active && styles.navActive]}><Ionicons name={icon} size={20} color={active ? colors.forest : colors.muted} /><Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>{active && <View style={styles.navDot} />}</Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  row: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 258, paddingHorizontal: 22, paddingTop: 38, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: colors.line },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 76 },
  brandIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 27, fontWeight: '800', letterSpacing: -1.7, color: colors.forest, lineHeight: 27 },
  brandAccent: { color: colors.accent },
  brandCaption: { fontSize: 8, fontWeight: '800', letterSpacing: 1.2, color: colors.muted, marginTop: 3 },
  navCaption: { color: '#9AA89D', fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginBottom: 17, paddingLeft: 15 },
  navItem: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 15, borderRadius: 13, marginBottom: 7 },
  navActive: { backgroundColor: colors.mint },
  navText: { color: colors.muted, fontSize: 14, fontWeight: '600', flex: 1 },
  navTextActive: { color: colors.forest, fontWeight: '700' },
  navDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green },
  sidebarBottom: { marginTop: 'auto', marginBottom: 32, padding: 20, borderRadius: 18, backgroundColor: colors.mint, gap: 12 },
  bottomText: { fontSize: 13, lineHeight: 19, fontWeight: '600', color: colors.forest },
  main: { flex: 1 },
  mobileHeader: { height: 68, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.line, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mobileBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mobileBrandIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  mobileBrandText: { fontSize: 24, fontWeight: '800', letterSpacing: -1.5, color: colors.forest },
  mobileAdd: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 27, paddingBottom: 56, width: '100%', maxWidth: 1240, alignSelf: 'center' },
  desktopContent: { paddingHorizontal: 48, paddingTop: 48, paddingBottom: 80 },
});
