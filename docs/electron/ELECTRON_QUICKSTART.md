# ⚡ Início Rápido - Electron Desktop

## 🚀 5 Minutos para Começar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Backend

```bash
cd backend
cp .env.example .env  # Se existir
# Editar .env com suas configurações
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Rodar em Desenvolvimento

```bash
npm run dev
```

Isso inicia:
- ✅ Backend em `http://localhost:3001`
- ✅ Frontend em `http://localhost:3000`
- ✅ Electron (abre janela)

### 4. Build de Produção

```bash
npm run build
```

Gera instalador em `dist/Mercadinho-PDV-Setup-1.0.0.exe`

---

## 📝 Exemplo de Uso - Impressão Térmica

No componente PDV (`frontend/pages/pos.vue`):

```vue
<script setup>
import { useElectron } from '~/composables/useElectron'

const { isElectron, printThermal } = useElectron()

const finalizeSale = async (saleId) => {
  // ... lógica de finalização da venda ...
  
  // Imprimir ticket
  if (isElectron.value) {
    const result = await printThermal({ saleId })
    if (result.success) {
      console.log('Ticket gerado:', result.filename)
    }
  } else {
    // Fallback web: usar API REST
    await $fetch(`/api/sales/${saleId}/ticket`)
  }
}
</script>
```

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento completo
npm run dev

# Apenas Electron (backend/frontend já rodando)
npm run dev:electron-only

# Build frontend
npm run build:frontend

# Build completo
npm run build

# Build Windows
npm run build:electron:win
```

---

## 📚 Documentação Completa

Consulte **[ELECTRON_SETUP.md](./ELECTRON_SETUP.md)** para:
- Estrutura detalhada
- Integração de hardware
- Troubleshooting
- FAQ completo

---

## ✅ Checklist de Validação

- [ ] Backend inicia automaticamente
- [ ] Frontend carrega no Electron
- [ ] Login funciona
- [ ] PDV funciona
- [ ] Vendas finalizam corretamente
- [ ] Impressão térmica funciona (se configurada)
- [ ] Leitor código de barras funciona (HID)

---

**Pronto para usar!** 🎉

