@echo off
rem ============================================================
rem  Configuracion de Data Miner. La key va en config.local.bat (ver abajo).
rem  Lo usan iniciar-web.bat y demo-consola.bat.
rem ============================================================

rem --- Proveedor de IA ---------------------------------------
rem Pega tu key de Google AI Studio (https://aistudio.google.com/apikey)
set "GEMINI_API_KEY=PEGA_AQUI_TU_KEY_DE_GEMINI"
set "AI_PROVIDER=gemini"
rem Modelo (revisa los nombres vigentes en AI Studio). Vacio = el default de bx-ai
set "AI_MODEL="
rem Opcional: un modelo mas barato para el agente Datos (cada modelo tiene su cuota)
set "AI_MODEL_LIGERO="
rem compacto = coordinador + 3 agentes (recomendado) / completo = 7 agentes
set "EQUIPO_MODO=compacto"

rem --- Privacidad --------------------------------------------
rem si = anonimiza DUI, NIT, nombres, telefonos... al entrar (no lo apagues con datos reales)
set "ANONIMIZAR=si"
rem Frase secreta para que los pseudonimos no cambien entre reinicios
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
if exist "%~dp0config.local.bat" call "%~dp0config.local.bat"

rem --- Sin key: modo demo ------------------------------------
if "%GEMINI_API_KEY%"=="PEGA_AQUI_TU_KEY_DE_GEMINI" (
  echo [AVISO] No pusiste tu key de Gemini en config.bat: arranca en MODO DEMO, sin IA real.
  set "AI_PROVIDER=mock"
  set "GEMINI_API_KEY="
)
exit /b 0
