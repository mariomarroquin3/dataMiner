@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
rem Crea la base de ejemplo tienda_sv (productos + 120 dias de ventas que terminan ayer) en tu MySQL.
rem Usa MYSQL_HOST, MYSQL_PORT, MYSQL_USER y MYSQL_PASSWORD de config.bat / config.local.bat.
rem Alternativa sin consola: abre mysql\tienda_sv.sql en MySQL Workbench y ejecutalo (icono del rayo).
call config.bat >nul
if "%MYSQL_HOST%"=="" set "MYSQL_HOST=localhost"
if "%MYSQL_PORT%"=="" set "MYSQL_PORT=3306"
if "%MYSQL_USER%"=="" set "MYSQL_USER=root"
set "MYSQLEXE="
where mysql >nul 2>&1 && set "MYSQLEXE=mysql"
if not defined MYSQLEXE (
  for /d %%D in ("%ProgramFiles%\MySQL\MySQL Server *") do if exist "%%D\bin\mysql.exe" set "MYSQLEXE=%%D\bin\mysql.exe"
)
if not defined MYSQLEXE (
  echo No encontre mysql.exe. Abre mysql\tienda_sv.sql en MySQL Workbench y ejecutalo con el rayo.
  pause
  exit /b 1
)
echo Creando tienda_sv en %MYSQL_USER%@%MYSQL_HOST%:%MYSQL_PORT% ...
"%MYSQLEXE%" --default-character-set=utf8mb4 -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% --password="%MYSQL_PASSWORD%" < mysql\tienda_sv.sql
if errorlevel 1 ( echo [ERROR] Revisa usuario y clave en config.local.bat ) else ( echo Listo. Prueba: boxlang probar-mysql.bxs )
pause
