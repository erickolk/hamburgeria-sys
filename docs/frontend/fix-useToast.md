# Correção do useToast() em todos os arquivos

## Problema
Vários arquivos usam `useToast()` incorretamente. Deve ser `$toast` do `useNuxtApp()`.

## Arquivos corrigidos
- ✅ `pages/customers/index.vue`
- ✅ `pages/suppliers/index.vue`
- ✅ `components/CustomerForm.vue`
- ✅ `components/SupplierForm.vue`

## Arquivos pendentes
- `pages/pos.vue`
- `pages/products/[id].vue`
- `pages/products/new.vue`
- `pages/settings/index.vue`
- `pages/settings/categories.vue`
- `pages/products/index.vue`
- `pages/cash/index.vue`
- `pages/login.vue`
- `pages/purchases/index.vue`
- `pages/reports/index.vue`
- `pages/sales/index.vue`

## Correção manual
Em cada arquivo acima, faça:

1. Adicionar no início do `<script setup>`:
```javascript
const { $toast } = useNuxtApp()
```

2. Substituir todas as ocorrências:
- `useToast().success(` → `$toast.success(`
- `useToast().error(` → `$toast.error(`
- `useToast().warning(` → `$toast.warning(`
- `useToast().info(` → `$toast.info(`

## Correção automática (PowerShell)
```powershell
# Encontrar todos os arquivos com useToast()
Get-ChildItem -Path frontend -Recurse -Filter *.vue | Select-String -Pattern "useToast\(\)" | Select-Object -Property Path -Unique
```

