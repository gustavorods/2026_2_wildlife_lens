# Olhar Selvagem

Galeria pessoal de animais encontrados, feita com React Native, Expo, TypeScript e Expo Router para Android, iOS e Web.

## Executar

```bash
npm install
npm run start
```

No terminal do Expo, pressione `a` para Android, `i` para iOS (em macOS) ou `w` para Web. Também é possível usar `npm run android`, `npm run ios` e `npm run web`.

## Fluxo

1. Abra **Novo registro** e fotografe com a câmera ou escolha uma imagem.
2. Autorize a localização. Confira foto e coordenadas; use **Atualizar localização** se necessário.
3. Toque em **Salvar registro** e confirme.
4. Encontre o animal na galeria e abra o card para ver a foto ampliada, data, coordenadas e ID.

## Organização

- `src/app`: rotas e layouts do Expo Router.
- `src/components`: componentes de interface compartilhados.
- `src/contexts/RecordsContext.tsx`: estado da galeria e ações de carregar/salvar.
- `src/services/camera.ts`: seleção de imagens; `CameraPanel.tsx` usa `expo-camera`.
- `src/services/location.ts`: permissão e posição atual com `expo-location`.
- `src/services/recordsStorage.native.ts`: fotos em `documentDirectory/animals` e metadados em AsyncStorage.
- `src/services/recordsStorage.web.ts`: registros e imagens em IndexedDB.
- `src/@types/animal.ts`: tipos dos registros.

## Permissões e armazenamento

As descrições de permissão estão em `app.json`. Android e iOS solicitam acesso à câmera e à localização durante o uso. A galeria de fotos é solicitada ao escolher uma imagem. No navegador, câmera e GPS precisam de **HTTPS ou localhost** e dependem do suporte do browser e da autorização do usuário.

Os dados ficam somente na instalação local do aplicativo ou no perfil do navegador. Limpar dados do aplicativo ou do site também remove os registros. A exportação web usa o modo SPA (`web.output: single`); o servidor de hospedagem deve redirecionar rotas como `/animal/ID` para `index.html`.
