# Scripts do Projeto Mercadinho

Esta pasta contém todos os scripts organizados por categoria.

## Estrutura

### `build/`
Scripts relacionados à construção e build do aplicativo:
- `build-alternativo.ps1` - Build alternativo
- `build-como-admin.bat` - Build executado como administrador
- `build-completo-automatico.ps1` - Build completo automatizado
- `build-instalador-admin.ps1` - Build do instalador como admin
- `build-instalador-completo.ps1` - Build completo do instalador
- `build-instalador.ps1` - Build básico do instalador

### `dev/`
Scripts para desenvolvimento e execução local:
- `iniciar-com-backend.ps1` - Inicia o app com backend
- `iniciar-electron.ps1` - Inicia apenas o Electron
- `iniciar-postgres.ps1` - Inicia o PostgreSQL
- `executar-app-com-logs-completos.ps1` - Executa app com logs completos
- `executar-com-logs.ps1` - Executa com logs
- `start-all.ps1` - Inicia todos os serviços
- `testar-electron.ps1` - Testa o Electron

### `diagnostico/`
Scripts de diagnóstico e troubleshooting:
- `diagnostico-app-instalado.ps1` - Diagnóstico do app instalado
- `diagnostico-executavel.ps1` - Diagnóstico do executável
- `diagnostico-rapido.ps1` - Diagnóstico rápido

### `db/`
Scripts relacionados ao banco de dados:
- `fix-pg-password.bat` - Corrige senha do PostgreSQL
- `redefinir-senha-postgres.ps1` - Redefine senha do PostgreSQL

### Raiz da pasta `scripts/`
Scripts gerais:
- `prepare-node-portable.ps1` - Prepara Node.js portable

## Uso

Para executar um script, navegue até a pasta apropriada ou use o caminho completo:

```powershell
# Exemplo: executar script de build
.\scripts\build\build-instalador-admin.ps1

# Exemplo: executar script de desenvolvimento
.\scripts\dev\iniciar-electron.ps1

# Exemplo: executar diagnóstico
.\scripts\diagnostico\diagnostico-rapido.ps1
```

