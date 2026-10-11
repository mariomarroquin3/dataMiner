@echo off
setlocal
rem Programa la alerta de compras todos los dias a la hora indicada (por defecto 07:30).
rem   programar-alerta.bat 08:00     cambia la hora
rem   programar-alerta.bat quitar    borra la tarea
set "HORA=%~1"
if "%HORA%"=="" set "HORA=07:30"
if /i "%HORA%"=="quitar" (
  schtasks /Delete /F /TN "DataMiner Alerta Stock"
  goto :fin
)
schtasks /Create /F /SC DAILY /ST %HORA% /TN "DataMiner Alerta Stock" /TR "\"%~dp0alerta-stock.bat\" programado"
if errorlevel 1 (
  echo No pude crear la tarea. Prueba abriendo este .bat como administrador.
) else (
  echo Listo: la alerta corre todos los dias a las %HORA%. La salida queda en salidas\alerta.log
  echo Para probarla ya: schtasks /Run /TN "DataMiner Alerta Stock"
)
:fin
pause
