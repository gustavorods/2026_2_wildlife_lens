import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';

export default function LoginScreen() {
  const { user, loading, signIn, signInDemo } = useAuth();
  const { width } = useWindowDimensions();
  const desktop = width >= 820;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.forest} /></View>;
  if (user) return <Redirect href="/" />;

  async function submit() {
    if (submitting) return;
    const missingUsername = !username.trim();
    const missingPassword = !password;
    setUsernameError(missingUsername ? 'Informe seu usuário.' : '');
    setPasswordError(missingPassword ? 'Informe sua senha.' : '');
    setFormError('');
    if (missingUsername || missingPassword) return;

    setSubmitting(true);
    try {
      await signIn(username, password);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível realizar o login.');
    } finally {
      setSubmitting(false);
    }
  }

  async function enterDemo() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signInDemo();
    } catch {
      setFormError('Não foi possível abrir a demonstração. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return <SafeAreaView style={styles.root}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, desktop && styles.desktopScroll]} keyboardShouldPersistTaps="handled">
        {desktop && <View style={styles.brandPanel}>
          <View style={styles.brand}><View style={styles.brandMark}><Ionicons name="paw" size={26} color="#fff" /></View><Text style={styles.brandName}>olhar<Text style={styles.brandAccent}>.</Text></Text></View>
          <View><Text style={styles.brandEyebrow}>SUA GALERIA DA NATUREZA</Text><Text style={styles.brandTitle}>Cada encontro começa com um olhar.</Text><Text style={styles.brandDescription}>Entre para guardar suas descobertas e continuar sua jornada pela natureza.</Text></View>
          <Ionicons name="leaf-outline" size={120} color="rgba(255,255,255,0.18)" style={styles.brandArt} />
        </View>}

        <View style={[styles.formPanel, desktop && styles.desktopFormPanel]}>
          <View style={styles.formCard}>
            {!desktop && <View style={styles.mobileBrand}><View style={styles.mobileBrandMark}><Ionicons name="paw" size={22} color="#fff" /></View><Text style={styles.mobileBrandName}>olhar<Text style={styles.brandAccent}>.</Text></Text></View>}
            <Text style={styles.eyebrow}>BEM-VINDO DE VOLTA</Text>
            <Text style={styles.title}>Acesse sua conta</Text>
            <Text style={styles.subtitle}>Informe suas credenciais para continuar.</Text>

            <Text style={styles.label}>Usuário</Text>
            <View style={[styles.inputWrap, !!usernameError && styles.inputInvalid]}>
              <Ionicons name="person-outline" size={19} color={colors.muted} />
              <TextInput accessibilityLabel="Usuário" autoCapitalize="none" autoComplete="username" autoCorrect={false} value={username} onChangeText={(value) => { setUsername(value); setUsernameError(''); setFormError(''); }} placeholder="Digite seu usuário" placeholderTextColor="#9AA89D" returnKeyType="next" style={styles.input} />
            </View>
            {!!usernameError && <Text style={styles.fieldError}>{usernameError}</Text>}

            <Text style={[styles.label, styles.passwordLabel]}>Senha</Text>
            <View style={[styles.inputWrap, !!passwordError && styles.inputInvalid]}>
              <Ionicons name="lock-closed-outline" size={19} color={colors.muted} />
              <TextInput accessibilityLabel="Senha" autoCapitalize="none" autoComplete="current-password" value={password} onChangeText={(value) => { setPassword(value); setPasswordError(''); setFormError(''); }} placeholder="Digite sua senha" placeholderTextColor="#9AA89D" secureTextEntry={!showPassword} returnKeyType="go" onSubmitEditing={() => void submit()} style={styles.input} />
              <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setShowPassword((current) => !current)} hitSlop={8}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.muted} /></Pressable>
            </View>
            {!!passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}

            {!!formError && <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={18} color={colors.error} /><Text accessibilityRole="alert" style={styles.formError}>{formError}</Text></View>}

            <Pressable accessibilityRole="button" accessibilityLabel="Entrar" disabled={submitting} onPress={() => void submit()} style={({ pressed }) => [styles.submit, submitting && styles.submitDisabled, pressed && styles.submitPressed]}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="log-in-outline" size={20} color="#fff" />}
              <Text style={styles.submitText}>{submitting ? 'Entrando...' : 'Entrar'}</Text>
            </Pressable>
            {!!formError && <View>
              <Text style={styles.subtitle}>Você também pode usar a demonstração local, sem uma conta na API.</Text>
              <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void enterDemo()} style={({ pressed }) => [styles.submit, submitting && styles.submitDisabled, pressed && styles.submitPressed]}>
                <Text style={styles.submitText}>Entrar em modo demonstração</Text>
              </Pressable>
            </View>}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' }, root: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, justifyContent: 'center' }, desktopScroll: { flexDirection: 'row' },
  brandPanel: { flex: 1, minHeight: 620, backgroundColor: colors.forest, padding: 52, justifyContent: 'space-between', overflow: 'hidden' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 12 }, brandMark: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }, brandName: { color: '#fff', fontSize: 31, fontWeight: '800', letterSpacing: -1.5 }, brandAccent: { color: colors.accent }, brandEyebrow: { color: '#C8DFC9', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 17 }, brandTitle: { color: '#fff', fontSize: 46, lineHeight: 53, fontWeight: '800', letterSpacing: -1.6, maxWidth: 480 }, brandDescription: { color: '#D4E6DA', fontSize: 16, lineHeight: 25, maxWidth: 420, marginTop: 18 }, brandArt: { alignSelf: 'flex-end' },
  formPanel: { padding: 24, alignItems: 'center', justifyContent: 'center' }, desktopFormPanel: { flex: 1, minHeight: 620 }, formCard: { width: '100%', maxWidth: 410 }, mobileBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 48 }, mobileBrandMark: { width: 39, height: 39, borderRadius: 12, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }, mobileBrandName: { color: colors.forest, fontSize: 29, fontWeight: '800', letterSpacing: -1.5 }, eyebrow: { color: colors.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 11 }, title: { color: colors.forestDark, fontSize: 31, fontWeight: '800', letterSpacing: -1 }, subtitle: { color: colors.muted, fontSize: 14, marginTop: 9, marginBottom: 34 }, label: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 9 }, passwordLabel: { marginTop: 21 }, inputWrap: { minHeight: 54, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 }, inputInvalid: { borderColor: colors.error }, input: { flex: 1, minWidth: 0, height: 52, fontSize: 15, color: colors.text }, fieldError: { color: colors.error, fontSize: 12, marginTop: 6 }, errorBox: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', padding: 13, borderRadius: 11, backgroundColor: colors.errorBackground, marginTop: 23 }, formError: { color: colors.error, flex: 1, fontSize: 13, lineHeight: 18 }, submit: { height: 54, borderRadius: 13, backgroundColor: colors.forest, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', marginTop: 29 }, submitDisabled: { opacity: 0.65 }, submitPressed: { opacity: 0.85 }, submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
