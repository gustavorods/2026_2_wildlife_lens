import { Slot } from 'expo-router';
import { PageShell } from '@/components/PageShell';

export default function AppLayout() {
  return <PageShell><Slot /></PageShell>;
}
