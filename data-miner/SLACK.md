# Alerta de compras por Slack

Data Miner revisa las ventas y el inventario en MySQL, calcula qué productos se van a acabar antes de que llegue el proveedor y avisa por Slack qué comprar. No usa IA ni gasta cuota de Gemini.

## 1. Crear el webhook de Slack

1. Entra a <https://api.slack.com/apps> y pulsa **Create New App → From scratch**.
2. Ponle un nombre (por ejemplo `Data Miner`) y elige tu workspace.
3. En el menú de la izquierda, abre **Incoming Webhooks** y actívalo.
4. Pulsa **Add New Webhook to Workspace**, elige el canal donde quieres los avisos (por ejemplo `#compras`) y pulsa **Permitir**.
5. Copia la URL que aparece: empieza con `https://hooks.slack.com/services/...`.

Esa URL es secreta: quien la tenga puede escribir en tu canal. No la subas a git.

## 2. Configurar `config.local.bat`

Abre `data-miner\config.local.bat` (git lo ignora), quita el `rem` de estas líneas y completa tus datos:

```bat
set "MYSQL_HOST=localhost"
set "MYSQL_PORT=3306"
set "MYSQL_DB=tienda_sv"
set "MYSQL_USER=root"
set "MYSQL_PASSWORD=tu_clave_de_mysql"
set "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/..."
```

Son los mismos datos de conexión que usas en MySQL Workbench.

## 3. Encender MySQL y crear la base de ejemplo

1. Enciende el servicio **MySQL80**: abre *Servicios* de Windows (`services.msc`), busca MySQL80 y pulsa **Iniciar**. También se enciende al abrir MySQL Workbench.
2. Corre `crear-bd-mysql.bat`. Crea la base `tienda_sv` con 20 productos y 120 días de ventas.
   Sin consola: abre `mysql\tienda_sv.sql` en Workbench y ejecútalo con el rayo.
3. Opcional: `boxlang probar-mysql.bxs` comprueba la conexión y lista las tablas.

## 4. Probar la alerta

```bat
alerta-stock.bat preview
```

Muestra el mensaje en la consola sin mandarlo. Si se ve bien:

```bat
alerta-stock.bat
```

Lo manda a Slack. La misma alerta se manda una sola vez al día; para repetirla usa `alerta-stock.bat forzar`.

## 5. Programarla todos los días

```bat
programar-alerta.bat 07:30
```

Crea una tarea de Windows que corre la alerta a esa hora. La salida queda en `salidas\alerta.log`.
Para probarla ya: `schtasks /Run /TN "DataMiner Alerta Stock"`. Para quitarla: `programar-alerta.bat quitar`.

## 6. Desde la web

Con `iniciar-web.bat` encendido:

- **Tablero** (`http://localhost:8080/tablero.html`): el botón **Avisar por Slack** manda la alerta, y **Recalcular** actualiza los números.
- **Agente** (`app.html`): debajo de los ejemplos están los botones **Revisar stock en MySQL** y **Avisar por Slack**. También puedes pedírselo al agente: «Revisa el stock y avísame por Slack».

## Si algo falla

| Mensaje | Qué hacer |
|---|---|
| `No pude conectar a MySQL` | Enciende MySQL80 y revisa `MYSQL_*` en `config.local.bat` |
| `Access denied for user` | Usuario o clave de MySQL incorrectos |
| `Unknown database 'tienda_sv'` | Corre `crear-bd-mysql.bat` |
| Slack: `Falta SLACK_WEBHOOK_URL` | Pon la URL del webhook en `config.local.bat` |
| Slack: `Ya se envió hoy esta misma alerta` | Es normal; usa `alerta-stock.bat forzar` para repetir |
| Slack: `Slack respondió 404` o `403` | La URL del webhook está mal copiada o la app se borró: crea otro webhook |
| Slack: `Nada que pedir hoy` | No hay productos en riesgo: no se manda nada |

Cada vez que corre, la alerta borra y vuelve a crear la tabla `pronostico_stock` en tu base: no uses ese nombre para una tabla propia.
