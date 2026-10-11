@echo off
rem ============================================================
rem  Configuracion de Data Miner. Lo usan iniciar-web.bat, demo-consola.bat y alerta-stock.bat.
rem  La KEY NO VA AQUI: va en config.local.bat (git lo ignora), que se lee al final y gana.
rem ============================================================

rem --- Proveedor de IA ---------------------------------------
rem Este valor es solo el marcador: tu key real esta en config.local.bat
rem (crea una en https://aistudio.google.com/apikey)
set "GEMINI_API_KEY=PEGA_AQUI_TU_KEY_DE_GEMINI"
set "AI_PROVIDER=gemini"
rem Modelo principal (Coordinador, Analista, Cientifico ML) y modelo ligero (agente Datos).
rem Cada modelo tiene su propia cuota gratis por dia; si uno se agota, la app pasa sola al siguiente
rem (3.8 -> 3.7 -> 3.6 -> 3.5 -> lite) y lo dice en logs\ai.log.
set "AI_MODEL=gemini-3.7-flash"
set "AI_MODEL_LIGERO=gemini-3.5-flash-lite"
rem compacto = coordinador + 3 agentes (recomendado) / completo = 7 agentes
set "EQUIPO_MODO=compacto"
rem Tablas de ejemplo (creditos, precios, clientes_sv, operaciones_sv): auto = solo en modo demo / si / no
set "DATOS_EJEMPLO=auto"

rem --- Privacidad --------------------------------------------
rem si = anonimiza DUI, NIT, nombres, telefonos... al entrar (no lo apagues con datos reales)
set "ANONIMIZAR=si"
rem Frase secreta para que los pseudonimos no cambien entre reinicios (tambien en config.local.bat)
set "ANON_SALT=cambia-esta-frase-secreta"

rem --- Opcionales --------------------------------------------
rem Base de datos por MCP: descomenta si corres iniciar-mcp.bat
rem set "MCP_DB_URL=http://localhost:8766/mcp"
rem Kaggle (opcional): https://www.kaggle.com/settings  ->  Create New Token
rem set "KAGGLE_USERNAME=tu_usuario"
rem set "KAGGLE_KEY=tu_key"
rem MySQL (la misma conexion de Workbench) y alerta de Slack: van en config.local.bat
rem set "MYSQL_DB=tienda_sv"  /  MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
rem set "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/..."

rem --- Secretos locales -------------------------------------
rem Para no subir tu key a git: copia config.local.ejemplo.bat como config.local.bat
rem y pon ahi la key y la frase secreta. git ignora config.local.bat.
set "KEY_ORIGEN=config.bat"
if exist "%~dp0config.local.bat" (
  findstr /i /r /c:"^ *set .GEMINI_API_KEY=" "%~dp0config.local.bat" >nul 2>&1 && set "KEY_ORIGEN=config.local.bat"
  call "%~dp0config.local.bat"
)

rem --- Sin key: modo demo ------------------------------------
if "%GEMINI_API_KEY%"=="PEGA_AQUI_TU_KEY_DE_GEMINI" (
  echo [AVISO] No hay key de Gemini en config.local.bat: arranca en MODO DEMO, sin IA real.
  set "AI_PROVIDER=mock"
  set "GEMINI_API_KEY="
  set "KEY_ORIGEN=ninguna"
)
exit /b 0
