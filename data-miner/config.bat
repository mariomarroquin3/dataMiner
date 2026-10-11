@echo off
rem ============================================================
rem  Configuracion de Data Miner. Lo usan iniciar-web.bat, demo-consola.bat y alerta-stock.bat.
rem  Las KEYS NO VAN AQUI: van en config.local.bat (git lo ignora), que se lee al final y gana.
rem ============================================================

rem --- Proveedor de IA ---------------------------------------
rem claude = Anthropic (recomendado) / gemini = Google AI Studio / mock = demo sin IA
set "AI_PROVIDER=claude"
rem Marcadores: tus keys reales van en config.local.bat
rem   Anthropic: https://console.anthropic.com/settings/keys
rem   Gemini:    https://aistudio.google.com/apikey
set "ANTHROPIC_API_KEY=PEGA_AQUI_TU_KEY_DE_ANTHROPIC"
set "GEMINI_API_KEY=PEGA_AQUI_TU_KEY_DE_GEMINI"
rem Modelo principal (Coordinador, Analista, Cientifico ML) y modelo ligero (agente Datos).
rem   Con claude: claude-sonnet-5-5 y claude-haiku-5-5
rem   Con gemini: gemini-3.7-flash y gemini-3.5-flash-lite (si uno se queda sin cuota, pasa solo al siguiente)
set "AI_MODEL=claude-sonnet-5-5"
set "AI_MODEL_LIGERO=claude-haiku-5-5"
rem Esfuerzo de Claude (low / medium / high). Vacio = medium en Sonnet y low en Haiku. Mas alto = mas lento y caro
set "AI_ESFUERZO="
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
rem Para no subir tus keys a git: copia config.local.ejemplo.bat como config.local.bat
rem y pon ahi las keys y la frase secreta. git ignora config.local.bat.
if exist "%~dp0config.local.bat" call "%~dp0config.local.bat"

rem --- Key que usa el proveedor elegido ----------------------
set "KEY_ACTIVA="
if /i "%AI_PROVIDER%"=="claude" set "KEY_ACTIVA=%ANTHROPIC_API_KEY%"
if /i "%AI_PROVIDER%"=="anthropic" set "KEY_ACTIVA=%ANTHROPIC_API_KEY%"
if /i "%AI_PROVIDER%"=="gemini" set "KEY_ACTIVA=%GEMINI_API_KEY%"
set "KEY_ORIGEN=config.local.bat"
rem Si cambias a gemini sin cambiar los modelos, se usan los de gemini
if /i "%AI_PROVIDER%"=="gemini" if /i "%AI_MODEL:~0,6%"=="claude" set "AI_MODEL=gemini-3.7-flash"
if /i "%AI_PROVIDER%"=="gemini" if /i "%AI_MODEL_LIGERO:~0,6%"=="claude" set "AI_MODEL_LIGERO=gemini-3.5-flash-lite"

rem --- Sin key: modo demo ------------------------------------
if /i "%AI_PROVIDER%"=="mock" goto :fin
if "%KEY_ACTIVA%"=="" goto :sinkey
if "%KEY_ACTIVA:~0,9%"=="PEGA_AQUI" goto :sinkey
goto :fin
:sinkey
echo [AVISO] No hay key de %AI_PROVIDER% en config.local.bat: arranca en MODO DEMO, sin IA real.
set "AI_PROVIDER=mock"
set "KEY_ORIGEN=ninguna"
:fin
exit /b 0
