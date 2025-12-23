# Sistema de Licenciamento SaaS Híbrido

## Visão Geral

O sistema de licenciamento híbrido permite que o Mercadinho PDV funcione **offline** enquanto mantém controle de **licenciamento e pagamentos** na nuvem.

### Conceito Principal

> O sistema não bloqueia se cair a internet, mas bloqueia se ficar muito tempo sem validar o pagamento.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS (Nuvem - Seu Servidor)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tabela: licenses                                     │   │
│  │  - license_key (chave única por cliente)             │   │
│  │  - cnpj                                               │   │
│  │  - status (ACTIVE, SUSPENDED, CANCELLED, TRIAL)      │   │
│  │  - valid_until (vencimento da mensalidade)           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ POST /licenses/verify
                              │ (Valida chave, retorna JWT)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 PC do Cliente (Local)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tabela: license_local                               │   │
│  │  - token (JWT com validade de 30 dias)               │   │
│  │  - token_expiry                                      │   │
│  │  - grace_days (dias em atraso)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tabela: users                                        │   │
│  │  - Usuários locais (Caixa, Gerente, Admin)           │   │
│  │  - Controlados pelo dono do mercadinho               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Fluxos

### 1. Primeira Ativação

1. Cliente instala o sistema
2. Tela de "Ativação" solicita a **Chave de Licença**
3. Sistema envia chave para VPS → `POST /licenses/verify`
4. VPS valida e retorna JWT com validade de 30 dias
5. Sistema salva token localmente
6. Cliente cria usuários locais (Caixa, Gerente)

### 2. Uso Diário (Offline-First)

1. Ao abrir, sistema verifica token local
2. **Token válido?** → Libera login local (sem internet)
3. **Token expirado?** → Tenta renovar com VPS
   - Se online e licença OK → Renova token
   - Se offline → Usa grace period

### 3. Renovação Silenciosa (Background)

O Electron executa a cada 1 hora:
1. Verifica se há conexão
2. Chama `POST /license/retry`
3. Se sucesso, atualiza token local

### 4. Grace Period e Bloqueio

| Dias após vencimento | Status   | Comportamento |
|---------------------|----------|---------------|
| 1-5 dias            | Warning  | Tarja amarela no rodapé |
| 6-14 dias           | Critical | Modal vermelho ao abrir |
| 15+ dias            | Blocked  | Modo leitura (sem vendas) |

## Arquivos Criados/Modificados

### Backend

```
backend/
├── prisma/
│   └── schema.prisma              # + models License e LicenseLocal
├── src/
│   ├── routes/
│   │   ├── licenses.js            # API do VPS (criar, listar, suspender)
│   │   └── license-local.js       # API local (ativar, status, retry)
│   ├── services/
│   │   ├── licenseService.js      # Lógica do VPS
│   │   └── licenseLocalService.js # Lógica local
│   ├── middleware/
│   │   └── license.js             # Middleware de verificação
│   └── server.js                  # + rotas registradas
└── tests/
    └── license.test.js            # Testes do sistema
```

### Frontend

```
frontend/
├── pages/
│   ├── activate.vue               # Tela de ativação
│   └── blocked.vue                # Tela de modo leitura
├── components/
│   └── LicenseWarning.vue         # Banner/Modal de aviso
├── composables/
│   └── useLicense.js              # Estado e métodos de licença
├── middleware/
│   └── license.js                 # Verificação de rota
└── layouts/
    └── default.vue                # + LicenseWarning incluído
```

### Electron

```
electron/
├── main.js                        # + verificação e renovação silenciosa
└── preload.js                     # + APIs de licença expostas
```

## APIs

### VPS - `/licenses`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/licenses/verify` | Validar chave e obter token | Não |
| GET | `/licenses/:key/status` | Consultar status | Não |
| GET | `/licenses` | Listar todas | Admin |
| POST | `/licenses` | Criar nova | Admin |
| PUT | `/licenses/:id` | Atualizar | Admin |
| POST | `/licenses/:key/renew` | Renovar (add tempo) | Admin |
| POST | `/licenses/:key/suspend` | Suspender | Admin |
| POST | `/licenses/:key/reactivate` | Reativar | Admin |

### Local - `/license`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/license/status` | Status atual |
| POST | `/license/activate` | Ativar com chave |
| POST | `/license/retry` | Tentar renovar |
| GET | `/license/check` | Verificar se pode operar |
| DELETE | `/license/deactivate` | Remover licença |

## Configuração

### Backend (.env)

```env
# Secret para tokens de licença
JWT_LICENSE_SECRET=chave_secreta_para_licencas_32_caracteres

# URL do VPS (para sistemas locais)
VPS_API_URL=https://seu-servidor.com
```

## Como Testar

### 1. Executar Migration

```bash
cd backend
$env:DATABASE_URL='postgresql://postgres:postgres123@localhost:5432/mercadinho_local'
npx prisma db push
```

### 2. Criar Licença de Teste (como Admin)

```bash
# Login como admin
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mercadinho.com","password":"admin123"}'

# Criar licença
curl -X POST http://localhost:3001/licenses \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj": "12345678000199",
    "companyName": "Mercado Teste",
    "email": "teste@teste.com",
    "validMonths": 1
  }'
```

### 3. Ativar no Frontend

1. Abrir o app
2. Ir para `/activate`
3. Inserir a chave gerada

### 4. Executar Testes

```bash
cd backend
npm test -- --testPathPattern=license
```

## Segurança

- Tokens JWT assinados com secret separado
- Grace period de 15 dias (proteção jurídica)
- Modo leitura preserva dados do cliente
- Renovação silenciosa não expõe chave
- Token local não pode ser modificado

## Próximos Passos (Opcional)

1. **Dashboard Admin**: Tela para gerenciar licenças no VPS
2. **Notificações Email**: Avisar antes do vencimento
3. **Integração Pagamento**: Gateway (Stripe, PagSeguro)
4. **Multi-tenant**: Separar dados por licença no VPS

