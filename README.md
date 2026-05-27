# INVITA

SaaS mobile/web para convites digitais inteligentes com eventos, QR Code unico por convidado, check-in por camera, album colaborativo, planos pagos e paineis por perfil.

## Stack

- Next.js 16 + React 19
- Autenticacao backend-first com Firestore, cookie HTTP-only e senhas com hash
- Firestore e Storage via Firebase Admin SDK
- APIs Node.js via Route Handlers
- Mercado Pago Checkout + webhook
- QR Code com token assinado e hash antifraude
- Leitor QR por camera com `html5-qrcode`
- Download de fotos em ZIP com `jszip`

## Rodar localmente

```bash
npm install
npm run dev
```

O app abre em `http://localhost:3000`. Sem credenciais, ele roda em modo demo com dados de exemplo.

## Configuracao

1. Copie `.env.example` para `.env.local`.
2. Preencha as credenciais do Firebase Admin SDK.
3. Crie segredos fortes em `AUTH_SESSION_SECRET` e `QR_TOKEN_SECRET`.
4. Preencha `MERCADO_PAGO_ACCESS_TOKEN`.
5. Configure a URL publica em `NEXT_PUBLIC_APP_URL`.
6. Preencha as chaves Web SDK do Firebase apenas se usar recursos publicos do cliente.

## Perfis

- `ADMIN`: painel administrativo, usuarios, pagamentos, metricas e planos.
- `HOST`: cria eventos, gerencia convidados, QR Codes, fotos e check-ins.
- `GUEST`: acessa convite individual e album.
- `RECEPTIONIST`: valida QR Code e registra entrada.

## Colecoes Firestore

- `users`
- `events`
- `guests`
- `checkins`
- `photos`
- `plans`
- `payments`
- `notifications`

As regras estao em `firestore.rules` e `storage.rules`. Os indices principais estao em `firestore.indexes.json`.

## Mercado Pago

Fluxo implementado:

1. Host escolhe plano em `/planos`.
2. API `/api/checkout` cria a preferencia.
3. Usuario paga no checkout Mercado Pago.
4. Webhook `/api/webhooks/mercadopago` recebe o evento.
5. O pagamento e lido pela API do Mercado Pago.
6. Apenas `status = approved` ativa o plano.
7. O plano e associado ao usuario com data, tipo e pagamento de origem.

## QR Code e check-in

Cada convidado recebe um token assinado com HMAC. O banco guarda o hash do token, nao o segredo. Na leitura, a API valida assinatura, confere hash, registra o check-in em transacao e muda o convidado para `checked_in`, impedindo reuso.

## Deploy

Vercel e o caminho mais direto para Next.js:

```bash
npm run build
vercel
```

Para Firebase Hosting com SSR, use um adaptador Next/Firebase adequado ao seu ambiente ou Firebase App Hosting. Os arquivos `firebase.json`, `firestore.rules`, `storage.rules` e `firestore.indexes.json` ja ficam prontos para o projeto Firebase.
## Autenticacao

Login, cadastro, recuperacao e sessao passam por APIs em `/api/auth/*`.
O navegador nao valida senha nem grava usuario direto no Firestore. A senha e transformada em hash no backend e a sessao fica em cookie HTTP-only assinado. Em producao, Firestore fica fechado para acesso direto do frontend; as rotas do servidor acessam o banco com Firebase Admin SDK.

### Primeiro administrador

O cadastro publico cria apenas anfitrioes. Para criar o primeiro admin em producao:

1. Configure `ADMIN_SETUP_SECRET` na hospedagem.
2. Chame `POST /api/auth/bootstrap-admin` com `setupSecret`, `name`, `email` e `password`.
3. A rota so funciona se ainda nao existir nenhum admin.
4. Depois de criar o admin, remova ou troque `ADMIN_SETUP_SECRET`.
