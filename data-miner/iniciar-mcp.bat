@echo off
setlocal
cd /d "%~dp0"
rem Base de datos SQLite de ejemplo expuesta por MCP en http://localhost:8766/mcp
rem Uso: iniciar-mcp.bat [ruta\a\tu.db] [puerto]
set "DB=%~1"
if "%DB%"=="" set "DB=%~dp0mcp\tienda.db"
set "PORT=%~2"
if "%PORT%"=="" set "PORT=8766"
set "VENV=%USERPROFILE%\.dataminer-mcp-venv"
set "PY=python"
where py >nul 2>&1 && set "PY=py -3"
rem mcp 1.6.0 y pydantic 2.10.6 no instalan en Python 3.14: preferir 3.12 o 3.13 si estan
py -3.13 --version >nul 2>&1 && set "PY=py -3.13"
py -3.12 --version >nul 2>&1 && set "PY=py -3.12"
if not exist "%VENV%\Scripts\mcp-server-sqlite.exe" (
  echo Instalando mcp-server-sqlite ^(una sola vez^)...
  %PY% -m venv "%VENV%"
  rem Versiones fijadas: con versiones mas nuevas de mcp/pydantic este servidor no arranca
  "%VENV%\Scripts\pip" install -q mcp-server-sqlite "mcp==1.6.0" "pydantic==2.10.6"
)
if not exist "%DB%" %PY% mcp\crear_tienda_db.py
rem Rutas cortas (8.3) para que los espacios en la ruta no rompan el comando de supergateway
for %%I in ("%VENV%\Scripts\mcp-server-sqlite.exe") do set "EXE=%%~sI"
for %%I in ("%DB%") do set "DBC=%%~sI"
echo MCP SQLite en http://localhost:%PORT%/mcp  ^(en config.bat descomenta MCP_DB_URL^)
call npx -y supergateway@3 --stdio "%EXE% --db-path %DBC%" --outputTransport streamableHttp --port %PORT%
