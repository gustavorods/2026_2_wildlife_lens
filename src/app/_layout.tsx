import { StartupPermissions } from '@/components/StartupPermissions';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RecordsProvider } from '@/contexts/RecordsContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return <AuthProvider><RecordsProvider><StartupPermissions /><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, animation: 'fade' }} /></RecordsProvider></AuthProvider>;
}
