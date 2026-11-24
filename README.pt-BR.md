# Olhar Selvagem

[English](README.md) | [Português (Brasil)](README.pt-BR.md) | [Español](README.es.md)

**Resumo:** Registre animais encontrados e organize suas fotos em uma galeria pessoal.

## Descrição

Fotografe um animal ou escolha uma imagem da galeria e salve o registro com data e localização. Desenvolvido com React Native, Expo e TypeScript para Android e Web. Os registros ficam armazenados localmente no dispositivo ou navegador.

## Instalação

O projeto usa Expo SDK 58. No celular, use o Expo Go compatível com SDK 58.

```bash
git clone https://github.com/gustavorods/2026_2_wildlife_lens.git
cd 2026_2_wildlife_lens
npm install
npm run start
```

No terminal do Expo, pressione `a` para abrir no Android ou `w` para abrir no navegador.

## Login

O app autentica com `POST /fatec/login/v1/auth`, enviando `username` e `password` como JSON e usando `credentials: 'include'` para receber e reenviar o cookie emitido pela API. A resposta deve conter `username` e, opcionalmente, `roles` (lista de textos). Apenas esses dados de apresentação são salvos no armazenamento local; a senha e o token não são salvos pelo app.

Por padrão, a URL é `https://login-api-j9cl.onrender.com/fatec/login/v1/auth`. Para usar outra API, defina `EXPO_PUBLIC_LOGIN_API_URL` antes de iniciar o Expo. No navegador, a API precisa permitir CORS com credenciais para a origem do app e emitir um cookie compatível com uso entre sites.

O projeto de referência não fornece um endpoint para consultar a sessão nem para encerrar o cookie. Por isso, a restauração local da tela de usuário não valida se o cookie ainda está ativo no servidor.

Se o login falhar, a tela oferece **Entrar em modo demonstração**. Essa opção usa um usuário mockado chamado `Demonstração`, sem senha, permissões ou autenticação na API. A sessão fica salva localmente até sair. A tentativa de conexão com a API tem limite de 15 segundos para permitir usar a demonstração quando o servidor não responder.

## Uso

1. Abra **Novo registro** e tire uma foto ou escolha uma imagem.
2. Autorize o acesso à localização e confira os dados do registro.
3. Toque em **Salvar registro**.
4. Abra o registro na galeria para ver a foto, a data e a localização.

## Licença

MIT. Consulte o arquivo [LICENSE](LICENSE).

## Armazenamento e permissões no celular

No Android/iOS, os registros são salvos no SQLite (`expo-sqlite`), com as fotos na pasta persistente do aplicativo. Os registros antigos do AsyncStorage são migrados automaticamente. Na web, a galeria continua usando IndexedDB.

Ao abrir o aplicativo mobile, ele solicita notificações, câmera, localização e fotos, em sequência. Se uma permissão for recusada, explica sua finalidade e oferece tentar novamente ou abrir as configurações quando o sistema bloquear novos pedidos. “Agora não” permite continuar sem insistência na mesma abertura. O banco e a pasta privada do app não exigem permissão de armazenamento.

Depois de salvar um registro com sucesso, uma notificação local mostra “Registro salvo! 🎉”. Recusar notificações ou uma falha ao enviá-las não impede salvar. Para testar, autorize as permissões, salve uma foto e reabra o app para conferir a persistência. Em um build nativo próprio, gere um novo binário após instalar as dependências e alterar os plugins.
