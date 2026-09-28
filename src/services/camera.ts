import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export async function chooseAnimalPhoto(): Promise<string | null> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted && permission.accessPrivileges !== 'limited') {
      throw new Error('Acesso à galeria negado. Autorize fotos nas configurações do dispositivo.');
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0]?.uri ?? null;
}
