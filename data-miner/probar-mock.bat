@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
rem ============================================================
rem  Prueba todo Data Miner en modo demo (mock), sin llamar APIs:
rem  ni Gemini, ni Kaggle real, ni MySQL, ni Slack.
rem  Uso: probar-mock.bat        corre las pruebas por consola
rem       probar-mock.bat web    ademas abre la web en modo demo
rem ============================================================
chcp 65001 >nul

rem Se ignoran las keys de config.local.bat: todo queda apagado
set "AI_PROVIDER=mock"
set "GEMINI_API_KEY="
set "MYSQL_DB="
set "MYSQL_URL="
set "SLACK_WEBHOOK_URL="
set "MCP_DB_URL="
rem Kaggle apunta al servidor falso local de pruebas\kaggle_falso.py
set "KAGGLE_API_URL=http://127.0.0.1:8799/api/v1"
set "KAGGLE_USERNAME=mario"
set "KAGGLE_KEY=k123"
if not defined ANON_SALT set "ANON_SALT=sal-de-prueba"

where boxlang >nul 2>&1
if errorlevel 1 (
  echo [FALTA] BoxLang no esta en el PATH. Corre instalar.bat y abre una terminal nueva.
  pause
  exit /b 1
)

set OK=0
set FALLOS=0
set "LISTA_FALLOS="
if not exist salidas mkdir salidas

rem Kaggle falso (solo si hay Python); sin el, el paso de Kaggle de la demo falla pero el resto sigue
set "PY="
where py >nul 2>&1 && set "PY=py -3"
if not defined PY ( python --version >nul 2>&1 && set "PY=python" )
if defined PY (
  if not exist pruebas\ds.zip !PY! pruebas\crear_zip_demo.py >nul 2>&1
  start "Kaggle falso" /min !PY! pruebas\kaggle_falso.py
)

rem La demo reescribe informe-demo.html: se guarda una copia y se restaura al final
if exist informe-demo.html copy /y informe-demo.html salidas\informe-demo.respaldo.html >nul

echo.
echo ============================================================
echo  Data Miner - pruebas en modo demo (sin APIs)
echo ============================================================
call :prueba "Anonimizacion"                 probar-anonimizacion.bxs
call :prueba "Normalizacion de tablas"        probar-normalizacion.bxs
call :prueba "Verificacion de cifras"         probar-verificador.bxs
call :prueba "Stock P50/P90 por cuantiles"    probar-cuantiles.bxs
call :prueba "Equipo de agentes (mock)"       demo-equipo.bxs

if exist salidas\informe-demo.respaldo.html (
  copy /y informe-demo.html salidas\informe-demo-prueba.html >nul
  copy /y salidas\informe-demo.respaldo.html informe-demo.html >nul
)
taskkill /fi "WINDOWTITLE eq Kaggle falso*" /f >nul 2>&1

echo.
echo ============================================================
echo  Resultado: !OK! OK, !FALLOS! con fallo
if !FALLOS! GTR 0 echo  Fallaron:!LISTA_FALLOS!
echo  Salida completa de cada prueba en salidas\mock-*.log
echo  Informe HTML de la demo: salidas\informe-demo-prueba.html
echo ============================================================

rem Web en modo demo: con "web" abre directo; si no, pregunta (30 s, por defecto No)
set "ABRIR="
if /i "%~1"=="web" set "ABRIR=1"
if not defined ABRIR (
  echo.
  choice /c SN /t 30 /d N /m "Abrir la web en modo demo"
  if not errorlevel 2 set "ABRIR=1"
)
if defined ABRIR (
  if defined PY start "Kaggle falso" /min !PY! pruebas\kaggle_falso.py
  echo.
  echo Web en modo demo: http://localhost:8080  ^(Ctrl+C para apagar^)
  echo  - Landing: http://localhost:8080/   Agente: /app.html   Tablero: /tablero.html ^(necesita MySQL^)
  echo  - Prueba Drive: en el agente escribe "Descarga https://drive.google.com/drive/folders/... y dime que tablas trae"
  echo    ^(Drive no es una API con key: solo necesita internet y la carpeta compartida con el enlace^)
  start "" /b powershell -NoProfile -Command "Start-Sleep 8; Start-Process 'http://localhost:8080/app.html?reload=1'"
  call boxlang-miniserver
  taskkill /fi "WINDOWTITLE eq Kaggle falso*" /f >nul 2>&1
)
echo.
pause
endlocal & exit /b %FALLOS%

rem ---------------------------------------------------------------
:prueba
set "NOMBRE=%~1"
set "SCRIPT=%~2"
set "LOG=salidas\mock-%~n2.log"
<nul set /p "=- %NOMBRE% ... "
if not exist "%SCRIPT%" (
  echo [NO EXISTE] %SCRIPT%
  set /a FALLOS+=1
  set "LISTA_FALLOS=!LISTA_FALLOS! %SCRIPT%"
  exit /b 0
)
call boxlang "%SCRIPT%" > "%LOG%" 2>&1
set "RC=!errorlevel!"
findstr /c:"Exception" /c:"[ERROR] [EXCEPTION]" "%LOG%" >nul 2>&1
if !RC! NEQ 0 (set "MAL=1") else (if not errorlevel 1 (set "MAL=1") else (set "MAL=0"))
if "!MAL!"=="1" (
  echo [FALLO]  ver %LOG%
  set /a FALLOS+=1
  set "LISTA_FALLOS=!LISTA_FALLOS! %SCRIPT%"
) else (
  echo [OK]
  set /a OK+=1
)
exit /b 0
