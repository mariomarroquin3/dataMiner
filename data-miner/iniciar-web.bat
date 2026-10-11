@echo off
cd /d "%~dp0"
call "%~dp0config.bat"
echo.
echo ============================================================
if /i "%AI_PROVIDER%"=="mock" (
  echo  Data Miner en MODO DEMO ^(sin IA real^)
) else (
  echo  Proveedor : %AI_PROVIDER%
  echo  Modelos   : %AI_MODEL% ^(principal^) / %AI_MODEL_LIGERO% ^(agente Datos^)
  echo  Key       : de %KEY_ORIGEN% ^(termina en ...%GEMINI_API_KEY:~-4%^)
)
echo  Modo      : %EQUIPO_MODO%   Anonimizar: %ANONIMIZAR%
echo ============================================================
echo Abriendo http://localhost:8080 ... ^(si sale en blanco, espera unos segundos y recarga^)
echo Para detener el servidor: Ctrl+C
echo.
start "" "http://localhost:8080/?reload=1"
call boxlang-miniserver
pause
