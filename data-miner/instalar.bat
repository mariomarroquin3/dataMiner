@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
echo ============================================================
echo   Data Miner - instalar lo que falte
echo   Usa winget ^(viene con Windows 10/11^). Puede pedir permisos.
echo ============================================================
net session >nul 2>&1 || echo [AVISO] Conviene correr este archivo como Administrador ^(clic derecho - Ejecutar como administrador^).

rem --- Java 21 ---
set "JMAYOR=0"
where java >nul 2>&1
if not errorlevel 1 (
  for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i /c:" version "') do set "JV=%%~v"
  for /f "tokens=1 delims=." %%m in ("!JV!") do set "JMAYOR=%%m"
)
if !JMAYOR! GEQ 21 (
  echo [OK] Java !JV! ya instalado
) else (
  echo Instalando Java 21 ^(Eclipse Temurin^)...
  winget install -e --id EclipseAdoptium.Temurin.21.JDK --accept-package-agreements --accept-source-agreements
  echo.
  echo Java instalado: CIERRA esta ventana y vuelve a correr instalar.bat para seguir con BoxLang.
  pause
  exit /b 1
)

rem --- BoxLang ---
where boxlang >nul 2>&1
if errorlevel 1 (
  echo Instalando BoxLang ^(instalador oficial de Ortus^)...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
) else (
  echo [OK] BoxLang ya instalado
)

rem Si BoxLang se acaba de instalar, esta ventana aun no lo ve en el PATH
where install-bx-module >nul 2>&1
if errorlevel 1 (
  echo.
  echo BoxLang recien instalado: CIERRA esta ventana y vuelve a correr instalar.bat
  echo para terminar ^(modulo bx-ai y jars^).
  pause
  exit /b 1
)

rem --- Modulo bx-ai ---
if exist "%USERPROFILE%\.boxlang\modules\bxai\ModuleConfig.bx" (
  echo [OK] Modulo bx-ai ya instalado
) else (
  echo Instalando el modulo bx-ai...
  call install-bx-module bx-ai
)

rem --- Jars para la demo por consola ---
if not exist "%USERPROFILE%\.boxlang\lib" mkdir "%USERPROFILE%\.boxlang\lib"
copy /y lib\*.jar "%USERPROFILE%\.boxlang\lib\" >nul && echo [OK] Jars copiados a %USERPROFILE%\.boxlang\lib

rem --- Opcionales: Python y Node (solo para MCP y demo-consola completa) ---
echo.
set /p OPC="Instalar tambien Python 3 y Node.js (opcionales, para la base de datos MCP)? [s/N]: "
if /i "!OPC!"=="s" (
  where py >nul 2>&1 || winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
  where npx >nul 2>&1 || winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
)

echo.
echo Listo. Abre una terminal NUEVA y corre revisar-requisitos.bat para confirmar.
pause
