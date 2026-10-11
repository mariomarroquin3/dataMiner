@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
echo ============================================================
echo   Data Miner - revision de requisitos
echo ============================================================
set FALTA=0
set "JMAYOR=0"

rem --- Java 21 o mayor ---
set "JV="
where java >nul 2>&1
if errorlevel 1 (
  echo [FALTA] Java 21 no esta instalado.  Arreglo: instalar.bat
  set FALTA=1
) else (
  for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i /c:" version "') do set "JV=%%~v"
  for /f "tokens=1 delims=." %%m in ("!JV!") do set "JMAYOR=%%m"
  if !JMAYOR! GEQ 21 (
    echo [OK]    Java !JV!
  ) else (
    echo [FALTA] Java !JV! es muy viejo: se necesita 21 o mayor.  Arreglo: instalar.bat
    set FALTA=1
  )
)

rem --- BoxLang ---
where boxlang >nul 2>&1
if errorlevel 1 (
  echo [FALTA] BoxLang no esta instalado ^(o abre una terminal nueva despues de instalarlo^).  Arreglo: instalar.bat
  set FALTA=1
) else (
  for /f "delims=" %%b in ('call boxlang --version 2^>^&1 ^| findstr /r /c:"v[0-9]"') do if not defined BLV set "BLV=%%b"
  echo [OK]    BoxLang !BLV!
)
where boxlang-miniserver >nul 2>&1
if errorlevel 1 (
  echo [FALTA] boxlang-miniserver ^(servidor web^).  Arreglo: instalar.bat
  set FALTA=1
) else (
  echo [OK]    boxlang-miniserver
)

rem --- Modulo bx-ai ---
rem El instalador de BoxLang puede fijar BOXLANG_HOME (p. ej. C:\boxlang\home); si no, es %USERPROFILE%\.boxlang
set "BXH=%USERPROFILE%\.boxlang"
if defined BOXLANG_HOME set "BXH=%BOXLANG_HOME%"
set "BXAI="
if exist "%USERPROFILE%\.boxlang\modules\bxai\ModuleConfig.bx" set BXAI=1
if exist "%BXH%\modules\bxai\ModuleConfig.bx" set BXAI=1
rem install-bx-module deja la carpeta como bx-ai
if exist "%BXH%\modules\bx-ai\ModuleConfig.bx" set BXAI=1
if exist "%USERPROFILE%\.boxlang\modules\bx-ai\ModuleConfig.bx" set BXAI=1
if defined BXAI (
  echo [OK]    Modulo bx-ai
) else (
  echo [FALTA] Modulo bx-ai.  Arreglo: instalar.bat  ^(o: install-bx-module bx-ai^)
  set FALTA=1
)

rem --- Jars del proyecto ---
set NJ=0
for %%f in (lib\*.jar) do set /a NJ+=1
if !NJ! GEQ 40 (
  echo [OK]    lib\ tiene !NJ! jars ^(Tribuo para ML y POI para Excel^)
) else (
  echo [FALTA] lib\ tiene !NJ! jars, se esperan 40. Vuelve a descomprimir el zip completo.
  set FALTA=1
)
set NG=0
for %%f in ("%BXH%\lib\*.jar") do set /a NG+=1
if !NG! GEQ 40 (
  echo [OK]    Jars copiados a %BXH%\lib ^(para la demo por consola^)
) else (
  echo [FALTA] Jars en %BXH%\lib ^(solo para demo-consola.bat^).  Arreglo: instalar.bat
  set FALTA=1
)

rem --- Key de Gemini (en config.bat o en config.local.bat) ---
call "%~dp0config.bat" >nul 2>&1
if /i "!AI_PROVIDER!"=="mock" (
  echo [AVISO] Falta tu key de Gemini en config.local.bat: sin ella todo corre en modo demo.
) else (
  echo [OK]    Key de Gemini puesta ^(proveedor: !AI_PROVIDER!^)
)

rem --- Opcionales ---
echo.
echo Opcionales ^(solo para la base de datos MCP y la demo por consola completa^):
set "PYOK="
where py >nul 2>&1 && set "PYOK=py -3"
if not defined PYOK ( python --version >nul 2>&1 && set "PYOK=python" )
if defined PYOK (
  for /f "delims=" %%p in ('!PYOK! --version 2^>^&1') do echo [OK]    %%p
) else (
  echo [--]    Python 3 no encontrado ^(opcional^).  Arreglo: instalar.bat
)
where npx >nul 2>&1
if errorlevel 1 (
  echo [--]    Node.js / npx no encontrado ^(opcional^).  Arreglo: instalar.bat
) else (
  for /f "delims=" %%n in ('node --version 2^>^&1') do echo [OK]    Node.js %%n
)
where curl >nul 2>&1 && echo [OK]    curl || echo [--]    curl no encontrado ^(opcional^)

echo.
if !FALTA!==0 (
  echo LISTO: tienes todo lo obligatorio. Corre iniciar-web.bat
) else (
  echo FALTAN COSAS: corre instalar.bat y despues vuelve a correr este archivo en una terminal NUEVA.
)
echo.
pause
