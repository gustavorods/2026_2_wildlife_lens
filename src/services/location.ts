import * as Location from 'expo-location';
import { Platform } from 'react-native';

export async function getAnimalLocation(): Promise<{ latitude: number; longitude: number }> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      throw new Error('A localização no navegador requer HTTPS ou localhost.');
    }
    if (!navigator.geolocation) {
      throw new Error('Este navegador não oferece acesso à localização.');
    }
  }

  if (Platform.OS !== 'web' && !(await Location.hasServicesEnabledAsync())) {
    throw new Error('Ative o GPS do dispositivo para registrar a localização.');
  }

  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Acesso à localização negado. Autorize-o nas configurações e tente novamente.');
  }

  try {
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    throw new Error('Não foi possível obter sua localização. Verifique o sinal de GPS e tente novamente.');
  }
}
