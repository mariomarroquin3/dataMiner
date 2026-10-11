@echo off
setlocal
cd /d "%~dp0"
rem Alerta de compras por Slack (sin IA). Uso:
rem   alerta-stock.bat            calcula y avisa a Slack (una vez al dia por la misma lista)
rem   alerta-stock.bat preview    solo muestra el mensaje
rem   alerta-stock.bat forzar     manda aunque hoy ya se haya mandado
rem   alerta-stock.bat programado lo usa el Programador de tareas: guarda la salida en salidas\alerta.log
call config.bat >nul
chcp 65001 >nul
if not exist salidas mkdir salidas
if /i "%~1"=="programado" (
  echo ===== %date% %time% >> salidas\alerta.log
  call boxlang alerta-stock.bxs >> salidas\alerta.log 2>&1
  exit /b %errorlevel%
)
call boxlang alerta-stock.bxs %*
pause
