; ============================================
; Script NSIS Customizado para Mercadinho PDV
; ============================================
; Inclui backup automatico antes de atualizar
; e usa migrate deploy para preservar dados
; ============================================

!macro customInstall
  ; Criar diretorios de dados do usuario
  CreateDirectory "$PROFILE\Mercadinho"
  CreateDirectory "$PROFILE\Mercadinho\logs"
  CreateDirectory "$PROFILE\Mercadinho\backups"
  
  ; Verificar se e atualizacao (banco ja existe)
  nsExec::ExecToStack 'powershell.exe -Command "if (Test-Path \"$PROFILE\Mercadinho\backups\*.sql\") { exit 0 } else { exit 1 }"'
  Pop $1
  
  ; Verificar se PostgreSQL esta instalado
  nsExec::ExecToLog 'sc query postgresql-x64-15'
  Pop $0
  
  ${If} $0 != 0
    ; Tentar outras versoes do PostgreSQL
    nsExec::ExecToLog 'sc query postgresql-x64-16'
    Pop $0
  ${EndIf}
  
  ${If} $0 != 0
    nsExec::ExecToLog 'sc query postgresql-x64-14'
    Pop $0
  ${EndIf}
  
  ${If} $0 != 0
    ; PostgreSQL nao encontrado - mostrar aviso
    MessageBox MB_OK|MB_ICONINFORMATION "IMPORTANTE: PostgreSQL nao foi detectado.$\r$\n$\r$\nPara o Mercadinho PDV funcionar corretamente:$\r$\n$\r$\n1. Execute 'Instalar-Pre-Requisitos.bat' (do pendrive)$\r$\n2. Reinicie o computador$\r$\n3. Abra o Mercadinho PDV$\r$\n$\r$\nSe o PostgreSQL ja esta instalado, ignore esta mensagem."
  ${Else}
    ; PostgreSQL encontrado
    DetailPrint "PostgreSQL detectado!"
    
    ; ============================================
    ; BACKUP AUTOMATICO ANTES DE ATUALIZAR
    ; ============================================
    ; Verificar se ja existe banco (atualizacao)
    nsExec::ExecToStack 'powershell.exe -Command "$env:PGPASSWORD=\"postgres123\"; $result = & \"C:\Program Files\PostgreSQL\15\bin\psql.exe\" -U postgres -h localhost -p 5432 -lqt 2>&1; if ($result -match \"mercadinho_local\") { exit 0 } else { exit 1 }"'
    Pop $2
    
    ${If} $2 == 0
      ; Banco existe - fazer backup antes de atualizar
      DetailPrint "Banco existente detectado - criando backup de seguranca..."
      
      nsExec::ExecToLog 'powershell.exe -ExecutionPolicy Bypass -Command "$env:PGPASSWORD=\"postgres123\"; $timestamp = Get-Date -Format \"yyyy-MM-dd_HH-mm-ss\"; $backupFile = \"$env:USERPROFILE\Mercadinho\backups\pre-update_$timestamp.sql\"; & \"C:\Program Files\PostgreSQL\15\bin\pg_dump.exe\" -U postgres -h localhost -p 5432 -d mercadinho_local -F p -f $backupFile 2>&1; if ($LASTEXITCODE -eq 0) { Write-Host \"Backup criado: $backupFile\" } else { Write-Host \"Aviso: Backup falhou\" }"'
      Pop $3
      
      ${If} $3 == 0
        DetailPrint "Backup de seguranca criado com sucesso!"
      ${Else}
        DetailPrint "Aviso: Nao foi possivel criar backup (dados podem estar seguros)"
      ${EndIf}
    ${Else}
      DetailPrint "Primeira instalacao detectada - backup nao necessario"
    ${EndIf}
    
    ; ============================================
    ; APLICAR MIGRATIONS (PRESERVA DADOS)
    ; ============================================
    DetailPrint "Configurando banco de dados..."
    
    ; Executar auto-setup (agora usa migrate deploy)
    nsExec::ExecToLog 'powershell.exe -ExecutionPolicy Bypass -File "$INSTDIR\resources\installer\auto-setup.ps1" -InstallDir "$INSTDIR" -Silent'
    Pop $0
    
    ${If} $0 == 0
      DetailPrint "Banco de dados configurado com sucesso!"
    ${Else}
      DetailPrint "Aviso: Configuracao do banco sera feita na primeira execucao"
    ${EndIf}
  ${EndIf}
  
  ; Criar flag de instalacao
  FileOpen $0 "$INSTDIR\first-run.flag" w
  FileWrite $0 "installed: $\r$\n"
  FileWrite $0 "timestamp: ${__TIMESTAMP__}$\r$\n"
  FileClose $0
!macroend

!macro customUnInstall
  ; Remover diretorio de dados (opcional - perguntar ao usuario)
  MessageBox MB_YESNO|MB_ICONQUESTION "Deseja remover os dados do usuario (vendas, produtos, etc)?$\r$\n$\r$\nATENCAO: Esta acao NAO pode ser desfeita!" IDNO skip_data_removal
    RMDir /r "$PROFILE\Mercadinho"
  skip_data_removal:
!macroend
