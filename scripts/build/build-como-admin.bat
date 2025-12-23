@echo off
:: Build do Instalador - Executa como Administrador
:: Este script solicita elevacao automaticamente

echo ================================================
echo   MERCADINHO PDV - BUILD DO INSTALADOR
echo ================================================
echo.
echo Este script precisa ser executado como Administrador
echo para criar o instalador corretamente.
echo.

:: Verificar se ja eh admin
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Executando como Administrador...
    goto :run_build
) else (
    echo Solicitando elevacao...
    goto :request_admin
)

:request_admin
:: Criar script VBS para solicitar elevacao
echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
echo UAC.ShellExecute "cmd.exe", "/c cd /d ""%~dp0"" && ""%~f0""", "", "runas", 1 >> "%temp%\getadmin.vbs"
"%temp%\getadmin.vbs"
del "%temp%\getadmin.vbs"
exit /B

:run_build
cd /d "%~dp0"

echo.
echo Limpando cache do electron-builder...
rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>nul

echo.
echo Executando build...
echo.

set CSC_IDENTITY_AUTO_DISCOVERY=false
call npm run build:electron

echo.
echo ================================================
if %errorLevel% == 0 (
    echo   BUILD CONCLUIDO COM SUCESSO!
    echo.
    echo   Instalador em: C:\temp-mercadinho-dist\
) else (
    echo   ERRO NO BUILD
)
echo ================================================
echo.

pause

