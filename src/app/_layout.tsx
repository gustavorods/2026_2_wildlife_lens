import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RecordsProvider } from '@/contexts/RecordsContext';

export default function RootLayout() {
  return <RecordsProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, animation: 'fade' }} /></RecordsProvider>;
}
