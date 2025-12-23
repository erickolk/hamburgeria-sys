@echo off
echo ================================================
echo   REDEFINIR SENHA DO POSTGRESQL
echo ================================================
echo.
echo Este script precisa de Administrador!
echo.

:: Verificar admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando elevacao...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo Parando PostgreSQL...
net stop postgresql-x64-16

echo.
echo Editando pg_hba.conf para permitir acesso temporario...
cd /d "C:\Program Files\PostgreSQL\16\data"
copy pg_hba.conf pg_hba.conf.bak

:: Substituir autenticacao por trust
powershell -Command "(Get-Content pg_hba.conf) -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust' | Set-Content pg_hba.conf"

echo Iniciando PostgreSQL...
net start postgresql-x64-16
timeout /t 3

echo.
echo Alterando senha...
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres123';"

echo.
echo Restaurando pg_hba.conf...
net stop postgresql-x64-16
copy pg_hba.conf.bak pg_hba.conf
net start postgresql-x64-16

echo.
echo ================================================
echo   CONCLUIDO!
echo   Nova senha: postgres123
echo ================================================
echo.
pause

