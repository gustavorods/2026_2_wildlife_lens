import * as Notifications from 'expo-notifications';
import { isRunningInExpoGo } from 'expo';
import { Alert, Linking, Platform } from 'react-native';

const CHANNEL = 'saved-records';
let activeChannel: string | undefined = CHANNEL;
let preparation: Promise<void> | undefined;
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
  handleError: (id, error) => {
    console.warn('Falha ao exibir notificação:', id, error);
    showNotificationFailure();
  },
});

function showNotificationFailure() {
  Alert.alert('Registro salvo', 'Sua foto foi salva, mas ocorreu uma falha ao exibir a notificação. Você pode continuar usando a galeria normalmente.');
}

function settingsButtons() {
  return [
    { text: 'Agora não', style: 'cancel' as const },
    { text: 'Abrir configurações', onPress: () => {
      void Linking.openSettings().catch(() => Alert.alert('Configurações', 'Abra as configurações do celular e permita as notificações deste aplicativo. Se estiver usando o Expo Go, confira as permissões dele.'));
    } },
  ];
}

export function prepareNotifications(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  // Compartilha a preparação entre a abertura do app e o salvamento de registros.
  if (!preparation) {
    preparation = (async () => {
      try {
        await Notifications.setNotificationChannelAsync(CHANNEL, {
          name: 'Registros salvos', importance: Notifications.AndroidImportance.HIGH, sound: 'default',
        });
      } catch (error) {
        if (!isRunningInExpoGo()) throw error;
        // Alguns ambientes Expo Go falham ao criar canais personalizados.
        // Um trigger null usa o canal padrão gerenciado pelo expo-notifications.
        activeChannel = undefined;
        console.warn('Canal personalizado indisponível no Expo Go; usando o canal padrão:', error);
      }
    })().catch((error) => {
      preparation = undefined;
      throw error;
    });
  }
  return preparation;
}

function canNotify(permission: Notifications.NotificationPermissionsStatus) {
  return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function notifyRecordSaved(id: string): Promise<void> {
  try {
    // O canal precisa existir antes de consultar/solicitar permissão no Android.
    await prepareNotifications();
    const permission = await Notifications.getPermissionsAsync();
    if (!canNotify(permission)) {
      Alert.alert('Registro salvo — notificações desativadas',
        'Sua foto foi salva! Permita as notificações para receber o aviso. No Expo Go, a permissão pertence ao Expo Go.',
        permission.canAskAgain ? [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Permitir notificações', onPress: () => {
            void (async () => {
              const updated = await Notifications.requestPermissionsAsync();
              if (canNotify(updated)) await notifyRecordSaved(id);
              else Alert.alert('Notificações desativadas', 'Você pode ativá-las nas configurações do aplicativo.', settingsButtons());
            })().catch((error) => {
              console.warn('Falha ao solicitar notificações:', error);
              showNotificationFailure();
            });
          } },
        ] : settingsButtons());
      return;
    }
    if (Platform.OS === 'android' && activeChannel) {
      const channel = await Notifications.getNotificationChannelAsync(activeChannel);
      if (channel?.importance === Notifications.AndroidImportance.NONE) {
        Alert.alert('Registro salvo — avisos bloqueados', 'Ative a categoria “Registros salvos” nas configurações de notificações do aplicativo.', settingsButtons());
        return;
      }
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Registro salvo! 🎉',
        body: 'Eba! Mais um encontro guardado na sua galeria.',
        sound: 'default', data: { recordId: id },
      },
      trigger: Platform.OS === 'android' && activeChannel ? { channelId: activeChannel } : null,
    });
  } catch (error) {
    console.warn('Falha ao enviar notificação de registro salvo:', error);
    showNotificationFailure();
  }
}
