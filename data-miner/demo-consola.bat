@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
call config.bat
rem La demo por consola usa guiones fijos (sin IA), aunque tengas key
set "AI_PROVIDER=mock"

echo ============================================================
echo  1/2  Anonimizacion ^(sin IA^): clientes salvadorenos sinteticos
echo ============================================================
call boxlang probar-anonimizacion.bxs

echo.
echo ============================================================
echo  2/2  Equipo de agentes completo ^(modo demo^)
echo ============================================================
rem Kaggle falso (necesita Python) y base MCP (necesita Python + Node) para que todos los hechos salgan verificados
set "PY="
where py >nul 2>&1 && set "PY=py -3"
if not defined PY ( python --version >nul 2>&1 && set "PY=python" )
if defined PY (
  start "Kaggle falso" /min !PY! pruebas\kaggle_falso.py
  set "KAGGLE_API_URL=http://127.0.0.1:8799/api/v1"
  set "KAGGLE_USERNAME=mario"
  set "KAGGLE_KEY=k123"
) else (
  echo [AVISO] Sin Python: el paso de Kaggle fallara y algunos hechos saldran sin verificar.
)
where npx >nul 2>&1
if not errorlevel 1 if defined PY (
  echo Levantando la base de datos MCP en otra ventana...
  start "MCP SQLite" /min cmd /c iniciar-mcp.bat
  set "MCP_DB_URL=http://localhost:8766/mcp"
  for /l %%i in (1,1,60) do (
    curl -s -o nul http://localhost:8766/mcp && goto :mcp_listo
    timeout /t 2 /nobreak >nul
  )
  echo [AVISO] La base MCP no respondio a tiempo; sigo sin ella.
  set "MCP_DB_URL="
)
:mcp_listo
call boxlang demo-equipo.bxs
echo.
echo El informe quedo en informe-demo.html. Cierra las ventanas "Kaggle falso" y "MCP SQLite" al terminar.
pause
