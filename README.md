# Data Miner: equipo multiagente para datos desconocidos (challenge 06)

```
   📂 Subir archivo (CSV, TSV, Excel, JSON, ZIP) ─→ 🔒 anonimización ─→ diagnóstico de calidad inmediato

                    ┌─ 🛠️ Datos          consigue (Kaggle, Drive/Sheets, URL), perfila, revisa calidad, limpia,
 🧭 Coordinador ────┤                      propone esquema SQL, detecta fuga de datos, aconseja la recolección
  (memoria)         ├─ 📊 Analista       SQL (con JOIN), base remota vía MCP, estadística, finanzas, gráficas
                    └─ 🤖 Científico ML  regresiones (lineal, ridge, lasso, polinomial), logística, árbol, Random Forest
                                ↓
              ✅ Verificación: se re-ejecuta el SQL de cada "hecho"
                                ↓
              📄 Informe HTML descargable con todas las gráficas (funciona sin internet)
```

**Modo compacto (por defecto): coordinador + 3 agentes.** Gasta menos cuota del LLM: la misión completa de prueba pasa de 30 a **19 llamadas** con el mismo resultado, y la misión de la web usa **15**. El modo completo (coordinador + 7 especialistas: Adquisición, Perfilador, Ingeniero de datos, Analista CSV, Analista DB, Estadístico y Científico ML) sigue disponible con `EQUIPO_MODO=completo`. Los dos modos usan exactamente las mismas tools.

La misión corre como un **pipeline de BoxLang AI**: `coordinador.transform( estructurar ).transform( verificar )`. El paso `estructurar` usa **structured output** nativo de bx-ai (`modelo.structuredOutput( esquema )`, un modelo sin tools, 1 llamada extra) para convertir la respuesta al esquema `{ respuesta, hechos[ {afirmacion, sql, origen} ], interpretaciones, siguientes_preguntas }`. Si el proveedor falla, cae a parsear el texto y la UI muestra qué formato se usó. El coordinador recibe una misión en lenguaje natural y la delega a sus subagentes (`subAgents` de BoxLang AI). Ningún agente conoce el dataset de antemano: lo descargan, lo perfilan y después lo consultan. La respuesta separa los **hechos**, que llevan su SQL y salen ✓/✗ según la verificación automática, de las **interpretaciones**. La UI muestra la traza de todo lo que hizo el equipo.

## Qué está probado y qué no (10/10/2026, BoxLang 1.18 + bx-ai 3.6 + Tribuo 4.3.2)

| Pieza | Estado |
|---|---|
| Flujo multiagente: coordinador → 4 subagentes → verificación | ✅ con el proveedor `mock` (`demo-equipo.bxs`) |
| Base de datos vía **MCP**: servidor oficial `mcp-server-sqlite` + puente HTTP | ✅ real: lista tablas, describe y consulta; bloquea lo que no sea SELECT |
| Kaggle: buscar y descargar (zip → CSV → tablas) | ✅ contra un servidor que imita la API de Kaggle (`pruebas/`). La Kaggle real no se puede alcanzar desde mi entorno |
| Google Drive / Sheets (links públicos) | ⚠️ Probé que convierte bien los enlaces; la descarga real no se puede alcanzar desde mi entorno |
| Con un LLM real (Gemini, OpenAI…) | ❌ sin probar: aquí no hay API key. **Pruébalo antes de la demo** |
| Web: API + UI | ✅ con captura (`captura-equipo.png`, `captura-ml.png`) |
| Estadística: correlación, covarianza, descriptiva | ✅ comparada con Python (`statistics`): Pearson 0.7245, Spearman 0.656, covarianza -0.1377 |
| Finanzas sobre `data/precios.csv` | ✅ comparada con Python: retorno total, volatilidad, Sharpe 0.805, max drawdown -8.31%. El VaR 95% varía en la segunda cifra según cómo se calcule el percentil |
| ML con Tribuo 4.3.2 sobre `creditos.csv` | ✅ `monto_credito`: R² lineal 0.62, polinomial 0.63, Random Forest 0.54. `impago`: logística accuracy 0.71 vs línea base 0.675 |
| Informe HTML + gráficas | ✅ `informe-demo.html` (ábrelo en el navegador) |
| Formatos: Excel (.xlsx/.xls, varias hojas, fórmulas, título arriba), CSV con `,` `;` tab o `\|`, coma decimal, BOM, JSON, ZIP mixto | ✅ con los archivos "sucios" de `pruebas/fuentes/` |
| Archivos de Drive sin extensión | ✅ detecta el tipo por contenido (probado en local; Drive real no alcanzable desde mi entorno) |
| Anonimización de datos entrantes (DUI, NIT, nombres, teléfonos, correos, direcciones, fecha de nacimiento, texto libre, respuestas MCP) | ✅ con `clientes_sv.xlsx`; JOIN por DUI pseudonimizado da los mismos totales; los demás archivos de prueba no cambian (`captura-anonimizacion.png`) |
| Subida desde la web + diagnóstico | ✅ con captura (`captura-calidad.png`) |
| Ingeniero de datos: diagnóstico, limpieza, esquema, fuga, consejos | ✅ el Excel de prueba pasa de calidad 33 a 62 tras `limpiar_tabla`; detecta que `dias_mora_max` filtra la respuesta de `impago` |
| Quiebre de stock (`pronostico_stock`) con `operaciones_sv.xlsx` | ✅ 20 SKU: 1 agotado, 2 críticos, 5 pronto, 12 ok; los hechos se verifican con SQL sobre `pronostico_stock` (`captura-stock.png`) |
| Priorización de ventas (`priorizar_ventas`) | ✅ 240 oportunidades cerradas, 80 abiertas: logística accuracy 0.75 vs línea base 0.625; los pesos coinciden con cómo se generaron los datos (`captura-prioridad.png`) |

## Windows: todo con doble clic (.bat)

| Archivo | Qué hace |
|---|---|
| `revisar-requisitos.bat` | Revisa Java 21+, BoxLang, MiniServer, bx-ai, los 40 jars, tu key y los opcionales (Python, Node). Dice qué falta. |
| `instalar.bat` | Instala lo que falte con `winget` y el instalador oficial de BoxLang, más bx-ai y los jars. Córrelo como administrador; si instala Java o BoxLang te pide cerrarlo y volver a correrlo. |
| `config.bat` | **El único que editas**: tu `GEMINI_API_KEY` (sin key arranca en modo demo), modelo, modo del equipo, anonimización. |
| `iniciar-web.bat` | Arranca la web en http://localhost:8080 y la abre en el navegador. |
| `demo-consola.bat` | Prueba la anonimización y corre la misión completa del equipo en modo demo (levanta el Kaggle falso y la base MCP si tienes Python y Node). |
| `iniciar-mcp.bat` | Base SQLite de ejemplo por MCP en el puerto 8766 (opcional). |

Orden: `revisar-requisitos.bat` → `instalar.bat` (si falta algo) → edita `config.bat` → `iniciar-web.bat`.

## Correr

```bash
cd data-miner

# 1) Base de datos vía MCP (opcional). Crea mcp/tienda.db de ejemplo y la sirve en :8766
bash mcp/iniciar_mcp_sqlite.sh                 # o: bash mcp/iniciar_mcp_sqlite.sh /ruta/otra.db 8766
export MCP_DB_URL=http://localhost:8766/mcp

# 2) Kaggle (https://www.kaggle.com/settings → Create New Token)
export KAGGLE_USERNAME=tu_usuario
export KAGGLE_KEY=tu_key                        # o deja ~/.kaggle/kaggle.json

# 3) Proveedor de IA
export AI_PROVIDER=gemini   GEMINI_API_KEY=...  # sin esto corre en modo demo (mock)
export AI_MODEL_LIGERO=...                      # opcional: modelo más barato para el agente Datos
export EQUIPO_MODO=compacto                     # compacto (3 agentes, por defecto) o completo (7)
export ANONIMIZAR=si                            # por defecto; "no" la apaga
export ANON_SALT=una-frase-secreta              # opcional: pseudónimos iguales entre reinicios

boxlang-miniserver                              # http://localhost:8080   (?reload=1 reinicia)
```

Requisitos del MCP: Python 3 y Node (`npx`). El script instala `mcp-server-sqlite` en `~/.dataminer-mcp-venv` con versiones fijadas, porque **con `mcp` y `pydantic` recientes el servidor no arranca**. bx-ai solo habla MCP por HTTP, así que `supergateway` hace de puente stdio → HTTP.

Demo por consola, 100% offline:
```bash
python3 pruebas/crear_zip_demo.py && python3 pruebas/kaggle_falso.py &     # Kaggle falso en :8799
MCP_DB_URL=http://localhost:8766/mcp KAGGLE_API_URL=http://127.0.0.1:8799/api/v1 \
KAGGLE_USERNAME=mario KAGGLE_KEY=k123 boxlang demo-equipo.bxs
```

## ¿Alcanza con planes gratuitos?

Todo el software es gratuito y de código abierto: BoxLang y bx-ai (Apache 2.0), Tribuo, Apache POI, Chart.js, `mcp-server-sqlite` y `supergateway`. La API de Kaggle es gratis con una cuenta, y los links públicos de Drive y Sheets no necesitan credenciales. **El único límite real es el del proveedor de IA.**

| Pieza | Costo | Ojo |
|---|---|---|
| BoxLang + bx-ai + MiniServer | Gratis (open source) | No usamos nada de BoxLang+ |
| Tribuo, Apache POI, Chart.js | Gratis (open source) | Corren local, sin servicios |
| MCP SQLite + supergateway | Gratis (open source) | Corren local |
| Kaggle API | Gratis con cuenta | Necesitas tu token (`kaggle.json`) |
| Drive / Sheets públicos | Gratis | Los privados requieren OAuth (no implementado) |
| LLM: Gemini (AI Studio) | Plan gratuito con límites **por minuto y por día, por modelo** | Mira tus límites en aistudio.google.com/rate-limit. En el plan gratuito Google puede usar los datos para mejorar sus modelos: **no subas datos reales de clientes** |
| LLM: Groq (alternativa) | Plan gratuito | Su página oficial muestra para `gpt-oss-120b` 30 req/min, 1.000 req/día y **8.000 tokens/min**; con 8 agentes ese límite de tokens se alcanza rápido |
| LLM local: Ollama | Gratis, sin límites | Depende de tu laptop; los modelos pequeños fallan más con tool calling |

**Cuántas llamadas al LLM gasta una misión.** Cada agente conversa con el modelo varias veces (una por cada tool que usa, más su respuesta final).
- Misión completa (`demo-equipo.bxs`): **19 llamadas** en modo compacto y 30 en modo completo (incluye el paso de structured output).
- Misión de la web en modo demo: **15 llamadas** (modo compacto).
- Pregunta enfocada (coordinador + 1 o 2 agentes): **5 a 8 llamadas**.

Los resultados de las tools son pequeños (300 a 700 tokens). La excepción es un `SELECT *`, que trae hasta 50 filas, unos 2.600 tokens.

Con un límite de ~10 req/min, una misión completa tarda unos 3 minutos solo en esperas. Para que rinda:
1. `RetryMiddleware` ya está en todos los agentes (`models/Equipo.bx`). Si el proveedor responde 429, espera 8 s, 16 s, 32 s… y reintenta.
2. Modo compacto por defecto (3 agentes en vez de 7).
3. `AI_MODEL_LIGERO`: un modelo más rápido para el agente Datos. Cada modelo tiene su propia cuota.
4. En la demo, prefiere misiones enfocadas («revisa la calidad de este Excel») a «hazlo todo».
5. Ten `AI_PROVIDER=mock` listo como plan B si se acaba la cuota o falla el wifi.

## Privacidad: anonimización de los datos entrantes (`models/Anonimizador.bx`)

Es el **primer paso** de todo: cada archivo que entra (subida, ZIP, Kaggle, Drive) se anonimiza **antes** de convertirse en tabla, así que ningún agente ni LLM ve datos personales reales. Está encendida por defecto (`ANONIMIZAR=no` la apaga).

| Dato | Cómo se detecta | Qué se hace |
|---|---|---|
| DUI, NIT (también NRC, NUP, ISSS, AFP) | Nombre de columna o forma del valor (`01234567-8`, `0614-…`) | Pseudónimo estable: `DUI_1a2b3c4d` |
| Correo, teléfono (+503), pasaporte, tarjeta, cuenta | Nombre de columna o forma del valor | Pseudónimo estable: `correo_…`, `tel_…` |
| Nombre de persona | `nombre_completo`, `apellido`, `cliente_nombre`… (un `nombre` genérico solo si la tabla también tiene DUI, correo o teléfono) | `Persona_…` |
| Dirección | `direccion`, `domicilio`… | Se reduce al departamento (San Salvador, Santa Ana…) o se elimina |
| Fecha de nacimiento | `fecha_nac`, `nacimiento`… | Rango de edad (`30-39`) |
| Texto libre (comentarios, notas) | Cualquier columna de texto | Enmascara DUI, NIT, correos, teléfonos y tarjetas dentro del texto |
| Respuestas de la base por MCP | Siempre | Mismas reglas sobre el texto que devuelve el servidor |

- **Pseudónimo estable** = HMAC-SHA256 con una sal secreta (`ANON_SALT`; si no la defines se genera una por arranque). El mismo DUI siempre da el mismo pseudónimo, así que **los JOIN, conteos y duplicados siguen funcionando** (probado: clientes ⋈ compras por DUI).
- La tabla de equivalencias pseudónimo → valor real se queda en la memoria del servidor (`Anonimizador.reidentificar()`) y **ninguna tool la expone**. El dueño de los datos puede volver al cliente real; la IA no.
- La UI muestra 🔒 qué columnas se anonimizaron y cómo; la bitácora de evidencia registra `anonimizar(tabla)`.
- Prueba sin IA: `boxlang probar-anonimizacion.bxs` con `pruebas/fuentes/clientes_sv.xlsx` (clientes salvadoreños sintéticos: DUI, NIT, teléfonos, correos, direcciones y una hoja de compras).
- Límite: es detección por reglas. Un dato personal en una columna con nombre raro y formato libre puede pasar; revisa el aviso 🔒 al subir.

## Módulo para la comunidad: `modulo/bx-datatools/`

Las piezas reutilizables (anonimización, lectores de archivos, SQL de solo lectura, calidad y limpieza, estadística, conector MCP seguro) están empaquetadas como **módulo de BoxLang** con `DataTools.bx`, que entrega las tools listas para cualquier `aiAgent()`. Trae su README y `ejemplos/analista.bxs`, que corre sin API key. Instalar: `cp -r modulo/bx-datatools ~/.boxlang/modules/bxdatatools`. Si cambias `models/`, sincroniza con `bash modulo/empaquetar.sh`.

## Fuentes y formatos

Todo entra por `Catalogo.registrarArchivo( ruta )` o `Fuentes.cargarArchivo( ruta )` (este último también abre ZIPs):
- **CSV / TSV / TXT**: detecta el separador (`,` `;` tab `|`), quita el BOM de Excel y, si el separador es `;`, convierte la coma decimal (`1.250,50` → `1250.5`).
- **Excel** (`.xlsx`, `.xlsm`, `.xls`) con Apache POI: **una tabla por hoja** (`archivo_hoja`). Busca la fila de encabezados entre las 10 primeras (salta títulos y filas vacías), calcula las fórmulas y pasa las fechas a `aaaa-mm-dd`. Las hojas vacías se ignoran.
- **JSON**: un arreglo de objetos, o un objeto con el arreglo dentro (`items`, `data`...). Aplana un nivel (`dimensiones.peso_kg` → `dimensiones_peso_kg`).
- **ZIP**: carga todos los archivos soportados que tenga dentro.
- Encabezados: sin tildes, sin espacios y sin repetidos (`Región` → `Region`, `Mora (días)` → `Mora_dias`).
- Google Sheets se baja como xlsx (todas las hojas). Los links de Drive no dicen el tipo, así que se detecta por el contenido.
- Web: `POST api/subir.bxm` (multipart, uno o varios archivos). Devuelve las tablas creadas y su diagnóstico de calidad sin usar IA.

## Ingeniero de datos (`models/IngenieroDatos.bx`)
- `diagnostico_calidad(tabla)`: puntaje de 0 a 100 y problemas con severidad (alta, media o baja) y una recomendación cada uno. Revisa:
  - vacíos y filas duplicadas;
  - atípicos (más de 3×IQR) y negativos imposibles (stock, precio, edad...);
  - categorías escritas de varias formas (`Norte`/`norte `/`NORTE`) y espacios sobrantes;
  - números guardados como texto (`$1,200`) y fechas mezcladas (`dd/mm/aaaa` con `aaaa-mm-dd`);
  - IDs repetidos, columnas constantes y datos personales.
- `limpiar_tabla(tabla)`: crea `<tabla>_limpia`. Hace trim, unifica categorías (gana la forma "Norte"), convierte montos y fechas a formato estándar y quita duplicados. **La tabla original no se toca.**
- `proponer_esquema(tabla)`: genera el `CREATE TABLE` con tipos, `NOT NULL`, clave primaria si hay un ID único y `CHECK (x >= 0)`. Los teléfonos y códigos quedan como texto.
- `detectar_fuga(tabla, objetivo)`: columnas que "filtran" la respuesta al hacer ML, por correlación ≥ 0.8 o por nombres como mora, pago o estado.
- `consejos_recoleccion(tabla, objetivo)`: recomendaciones específicas para los problemas encontrados, más buenas prácticas generales:
  - validar en la captura;
  - usar un ID del sistema y fechas ISO;
  - mantener un diccionario de datos;
  - separar capas raw → limpia → analítica;
  - preferir una base de datos a un Excel por correo;
  - tomar la "foto" de las variables en el momento de decidir;
  - cuidar la privacidad.

  Las instrucciones del agente también incluyen estas reglas para que razone con ellas.

## Estadística, finanzas y ML

Tools del **Estadístico** (`models/Estadistica.bx`):
- `describir(tabla, columnas)`: media, desviación estándar, cuartiles y asimetría.
- `correlacion(tabla, columnas, metodo)`: `pearson` o `spearman`. Devuelve la matriz, los pares más fuertes (fuerte/moderada/débil) y un mapa de calor.
- `covarianza(tabla, columnas)`.
- `metricas_financieras(tabla, columnaValor, columnaFecha)`: retorno total y medio, volatilidad (también anualizada con 252 periodos), CAGR, Sharpe, max drawdown y VaR histórico 95%, con su gráfica de línea.
- `graficar(tipo, sql, x, y, titulo)`: bar, line, scatter o pie desde cualquier SELECT. Todos los agentes de análisis la tienen.

Tools del **Científico ML** (`models/ML.bx`, con [Tribuo](https://tribuo.org) de Oracle en la JVM):
- `entrenar_modelo(tabla, objetivo, tipo, features)`, con `tipo` = `lineal | ridge | lasso | polinomial | logistica | arbol | random_forest`.
  - Detecta solo si es regresión o clasificación: el objetivo es de clasificación si es texto o tiene 10 valores enteros o menos.
  - Las categorías se pasan a one-hot (top 20), los números se estandarizan y el split es 80/20 con semilla fija.
  - Regresión: R², RMSE, MAE y una gráfica de real vs predicho. Clasificación: accuracy, F1 macro, AUC y la **línea base** (la clase mayoritaria), para que se vea si el modelo realmente aporta.
  - Siempre agrega una gráfica de las variables más importantes.
- `comparar_modelos(tabla, objetivo, tipos)`: entrena varios modelos y los ordena por métrica.
- `predecir(nombreModelo, valoresJson)`: por ejemplo `random_forest_impago` con `{"edad":22,"tipo_empleo":"informal",...}`.

**Jars**: Tribuo (ML) y Apache POI (Excel) van en `lib/` (26 MB). La web los carga con `this.javaSettings` en `www/Application.bx`. Para scripts por consola (`boxlang demo-equipo.bxs`), copia `lib/*.jar` a `~/.boxlang/lib/`.

**Informe**: `GET api/informe.bxm` devuelve el HTML de la última misión y `?descargar=1` lo descarga como archivo. Chart.js va embebido desde `www/js/chart.umd.js`, así que el informe abre sin internet y se puede imprimir a PDF desde el navegador.

## Operaciones: quiebre de stock y prioridad de ventas (`models/Operaciones.bx`)

El LLM no calcula nada aquí: decide qué tool usar y explica el resultado. Los números salen de fórmulas fijas, quedan en una tabla del catálogo y cada afirmación se re-verifica con SQL.

**`pronostico_stock(tablaVentas, tablaInventario, nivelServicio, diasHistoria)`** (Analista en modo compacto, Estadístico en modo completo):
- Demanda diaria = promedio de los últimos 14 días; tendencia = pendiente lineal en la ventana de historia (56 días por defecto).
- Días restantes = primer día en que la demanda proyectada (nivel + tendencia) acumulada alcanza el stock.
- Stock de seguridad = z · σ · √días de entrega (z según el nivel de servicio: 0.95 → 1.645). Punto de reorden = demanda · entrega + stock de seguridad. Cantidad a pedir = lo que cubre entrega + 30 días menos el stock.
- Estado: `agotado`, `crítico` (se agota antes de que llegue el proveedor), `pronto` (en la semana siguiente) u `ok`.
- Detecta solo las columnas (fecha, SKU/producto, unidades, stock, días de entrega del proveedor) y guarda la tabla `pronostico_stock`.

**`priorizar_ventas(tabla, top)`** (Científico ML):
- Entrena una regresión logística (Tribuo) con las oportunidades cerradas (ganada/perdida) y predice la probabilidad de cierre de las abiertas.
- Ganancia esperada = probabilidad × monto × margen; ordena por eso y sugiere una acción (cerrar esta semana, reunión con el decisor, etc.).
- Devuelve accuracy contra la línea base, las variables que más pesan y la tasa de cierre histórica por categoría. Guarda `prioridad_ventas` y `entrenamiento_<tabla>`.

Datos de ejemplo: `pruebas/fuentes/operaciones_sv.xlsx` (hojas Inventario, Ventas diarias con 120 días hasta el 09/10/2026, y Oportunidades). La web lo carga al arrancar; prueba los chips "¿Qué productos se van a agotar…?" y "¿Qué oportunidades de venta debo priorizar…?". Para tus datos reales basta con subir un Excel con hojas parecidas.

## Archivos
- `models/Equipo.bx`: arma el equipo (coordinador + subagentes, modo compacto o completo), ejecuta la misión y verifica los hechos. Recibe `modelo = (nombreAgente) => aiModel(...)`, así que cada agente puede usar un proveedor distinto.
- `models/Fuentes.bx`: `buscarKaggle`, `descargarKaggle` (API v1, basic auth), `descargarUrl` (Drive `/file/d/ID`, Sheets → export CSV, URL a .csv/.zip).
- `models/Catalogo.bx`: tablas en memoria desde CSV (respeta comillas, infiere tipos, guarda vacíos como null), `perfilar`, `consultar` (solo SELECT, con JOIN) y la bitácora de evidencia.
- `models/ConectorMCP.bx`: cliente MCP → 3 tools seguras (`db_listar_tablas`, `db_describir_tabla`, `db_consultar`). Las herramientas de escritura del servidor (`write_query`, `create_table`) **nunca llegan al agente**. Para otro servidor MCP (por ejemplo Postgres), cambia los nombres en `init( url, catalogo, { consultar: "query", argSql: "sql" } )`.
- `models/Estadistica.bx`, `models/ML.bx` y `models/Informe.bx`: estadística/finanzas, ML y gráficas/informe.
- `models/Operaciones.bx`: quiebre de stock y prioridad de ventas.
- `models/IngenieroDatos.bx`: calidad, limpieza, esquema, fuga y consejos. `www/api/subir.bxm`: subida de archivos.
- `pruebas/fuentes/`: archivos "sucios" para probar (`ventas_erp.xlsx` con título, 2 hojas, fórmulas y duplicados; `cobros_es.csv` con `;` y coma decimal; `inventario.json` anidado; `sensores.tsv` con un atípico).
- `www/api/mision.bxm`: API (POST `{pedido}`; GET devuelve las tablas). Al arrancar carga `data/creditos.csv` (crédito sintético) y `data/precios.csv` (300 días de precios) como ejemplos. `www/api/informe.bxm`: el informe. `www/index.html`: la UI.
- `mcp/`: script para levantar la base MCP y la base de ejemplo. `pruebas/`: el Kaggle falso.

## Trampas de BoxLang que encontré
- Un `#` dentro de un string se escribe `##` (por ejemplo en URLs con `#gid=0`).
- Una variable no puede llamarse igual que un `import`, aunque cambien mayúsculas (`analista` vs `Analista`).
- Query of Queries busca las tablas por nombre en el scope `local`.
- `mcpServers:` en `aiAgent` importa **todas** las tools del servidor, incluidas las de escritura. Por eso usamos `ConectorMCP`.
- En `Application.bx`, `expandPath("../")` resuelve dentro del webroot. Usa `getCurrentTemplatePath()`.
- `local` es un scope reservado: no lo uses como nombre de variable.
- `if ( x ) return` sin `;` al final de la línea se "come" la línea siguiente como valor de retorno. Usa `return;`.
- Los structs no distinguen mayúsculas: `"Norte"` y `"NORTE"` son la misma llave. Para contar variantes usa arreglos.
- Las closures no ven las constantes de `static { }`. Pon los patrones en `variables`.
- `fileUploadAll( accept: ".csv,..." )` rechaza los archivos. Usa `accept: "*"` con `strict: false` y filtra la extensión tú mismo.
- `asc()` no existe sin el módulo compat. Para quitar el BOM usa `texto.startsWith( char( 65279 ) )`.
- En `dateTimeFormat` los minutos son `mm`, no `nn`.
- Tribuo: el Random Forest de regresión necesita `minChildWeight > 0`, y la logística rinde mal si no estandarizas las variables numéricas.

## Drive privado con MCP (no probado)
Los links públicos y Sheets funcionan sin credenciales. Para archivos privados de Drive hay servidores MCP de Google Drive (stdio, con OAuth). Se conectan igual que el de SQLite: `npx supergateway --stdio "<comando del servidor drive>" --outputTransport streamableHttp --port 8770`, y luego un `ConectorMCP` o `aiAgent( mcpServers: [ "http://localhost:8770/mcp" ] )`.
