import { useEffect } from 'react';
import { Alert, AppState, Linking } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { prepareNotifications } from '@/services/notifications';

type Permission = { granted: boolean; canAskAgain: boolean };
type Request = { name: string; reason: string; get: () => Promise<Permission>; request: () => Promise<Permission> };
const requests: Request[] = [
  { name: 'Notificações', reason: 'As notificações avisam quando um registro foi salvo.', get: async () => { await prepareNotifications(); return Notifications.getPermissionsAsync(); }, request: () => Notifications.requestPermissionsAsync() },
  { name: 'Câmera', reason: 'A câmera permite fotografar os animais encontrados.', get: Camera.getCameraPermissionsAsync, request: Camera.requestCameraPermissionsAsync },
  { name: 'Localização', reason: 'A localização marca onde você encontrou o animal. Sem ela, não é possível salvar um registro.', get: Location.getForegroundPermissionsAsync, request: Location.requestForegroundPermissionsAsync },
  { name: 'Fotos', reason: 'O acesso às fotos permite escolher uma imagem da sua galeria.', get: ImagePicker.getMediaLibraryPermissionsAsync, request: () => ImagePicker.requestMediaLibraryPermissionsAsync() },
];

function explain(permission: Permission, item: Request): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(item.name, `${item.reason} ${permission.canAskAgain ? 'Deseja permitir o acesso?' : 'Para permitir o acesso, abra as configurações do aplicativo.'}`, [
      { text: 'Agora não', style: 'cancel', onPress: () => resolve(false) },
      { text: permission.canAskAgain ? 'Tentar novamente' : 'Abrir configurações', onPress: () => resolve(true) },
    ], { cancelable: false });
  });
}

async function openSettingsAndWait() {
  let subscription: ReturnType<typeof AppState.addEventListener> | undefined;
  const returned = new Promise<void>((resolve) => {
    let leftApp = false;
    subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') leftApp = true;
      if (state === 'active' && leftApp) resolve();
    });
  });
  try {
    await Linking.openSettings();
    await returned;
  } finally {
    subscription?.remove();
  }
}

let started = false;
export function StartupPermissions() {
  useEffect(() => {
    if (started) return;
    started = true;
    void (async () => {
      for (const item of requests) {
        try {
          let permission = await item.get();
          if (permission.granted) continue;
          if (permission.canAskAgain) permission = await item.request();
          if (permission.granted || !(await explain(permission, item))) continue;
          if (permission.canAskAgain) {
            permission = await item.request();
            if (!permission.granted && !permission.canAskAgain && await explain(permission, item)) {
              await openSettingsAndWait();
            }
          } else {
            await openSettingsAndWait();
          }
        } catch (error) {
          console.warn(`Falha ao solicitar permissão: ${item.name}`, error);
          Alert.alert(item.name, 'Ocorreu uma falha ao consultar ou solicitar esta permissão. Tente novamente após reiniciar o aplicativo.');
        }
      }
    })().catch(() => Alert.alert('Permissões', 'Não foi possível preparar as permissões. Confira as configurações do aplicativo.'));
  }, []);
  return null;
}
