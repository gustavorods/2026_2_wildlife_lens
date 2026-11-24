import { Redirect, Slot, type Href } from 'expo-router';
import { PageShell } from '@/components/PageShell';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/constants/colors';

export default function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={colors.forest} /></View>;
  if (!user) return <Redirect href={'/login' as Href} />;
  return <PageShell><Slot /></PageShell>;
}
