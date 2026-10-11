@echo off
rem Copia este archivo como config.local.bat (git lo ignora) y pon tus secretos.
set "GEMINI_API_KEY=PEGA_AQUI_TU_KEY_DE_GEMINI"
set "ANON_SALT=cambia-esta-frase-secreta"
rem set "KAGGLE_USERNAME=tu_usuario"
rem set "KAGGLE_KEY=tu_key"

rem --- MySQL y alerta de Slack (opcional, ver SLACK.md): quita el rem y completa ---
rem MySQL: la misma conexion que usas en Workbench
rem set "MYSQL_HOST=localhost"
rem set "MYSQL_PORT=3306"
rem set "MYSQL_DB=tienda_sv"
rem set "MYSQL_USER=root"
rem set "MYSQL_PASSWORD=tu_clave_de_mysql"
rem Slack: Incoming Webhook de tu canal (https://api.slack.com/apps > Create App > Incoming Webhooks)
rem set "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ"
rem Opcionales: de donde salen ventas e inventario (tabla o SELECT) y nivel de servicio
rem set "ALERTA_VENTAS=ventas_diarias"
rem set "ALERTA_INVENTARIO=productos"
rem set "ALERTA_NIVEL=0.90"
rem set "ALERTA_INCLUIR_PRONTO=si"

rem exit /b va al final: lo que quede debajo no se ejecuta
exit /b 0
