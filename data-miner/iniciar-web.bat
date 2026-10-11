@echo off
cd /d "%~dp0"
call "%~dp0config.bat"
echo.
echo Data Miner: proveedor %AI_PROVIDER%, modo %EQUIPO_MODO%, anonimizar %ANONIMIZAR%
echo Abriendo http://localhost:8080 ... ^(si sale en blanco, espera unos segundos y recarga^)
echo Para detener el servidor: Ctrl+C
echo.
start "" "http://localhost:8080/?reload=1"
call boxlang-miniserver
pause
