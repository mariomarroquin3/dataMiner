# bx-datatools: tools seguras de datos para agentes de BoxLang AI

Módulo de BoxLang que le da a cualquier `aiAgent()` lo necesario para analizar datos desconocidos **sin exponer datos personales y sin poder dañar nada**. Salió del proyecto Data Miner (Hackathon ANIA BoxLang AI 2026, reto 06).

| Grupo | Tools | Qué garantiza |
|---|---|---|
| (siempre) | `listar_tablas`, `perfilar_tabla` | — |
| `sql` | `ejecutar_sql`, `graficar_sql` | Solo una sentencia `SELECT`, con JOIN entre tablas; máximo 50 filas por respuesta |
| `calidad` | `diagnostico_calidad`, `limpiar_tabla`, `proponer_esquema`, `detectar_fuga`, `consejos_recoleccion` | La limpieza crea `<tabla>_limpia`; la original no se toca |
| `estadistica` | `describir`, `correlacion` | — |
| `operaciones` | `pronostico_stock` | Cuándo se agota cada producto, punto de reorden y cuánto pedir; guarda `pronostico_stock` para verificar con SQL. (La priorización de ventas necesita Tribuo y vive en la app Data Miner) |
| `db` | `db_listar_tablas`, `db_describir_tabla`, `db_consultar` (vía MCP) | Las tools de escritura del servidor MCP **nunca** llegan al agente |

Y antes de todo eso, **anonimización al entrar**: DUI, NIT, nombres, teléfonos, correos, tarjetas → pseudónimos estables (HMAC-SHA256); direcciones → departamento; fecha de nacimiento → rango de edad; datos personales dentro de texto libre → enmascarados. Como el pseudónimo es estable, los JOIN y conteos siguen funcionando. La tabla de equivalencias se queda en el servidor y ninguna tool la expone.

Lee CSV/TSV/TXT (detecta `,` `;` tab `|`, coma decimal y BOM), Excel `.xlsx/.xls` (una tabla por hoja, fórmulas, fila de encabezado automática) y JSON.

## Instalar

Copia esta carpeta a `~/.boxlang/modules/bxdatatools` (el nombre de la carpeta es el nombre del módulo). Necesita `bx-ai` (`install-bx-module bx-ai`). Apache POI (Excel) viene en `libs/` y se carga solo.

## Usar (10 líneas)

```js
dt = new bxModules.bxdatatools.models.DataTools()          // anonimizar = true por defecto
dt.cargar( "/ruta/clientes.xlsx" )                          // cada hoja es una tabla
agente = aiAgent(
  name        : "Analista",
  instructions: "Eres analista de datos. Toda cifra sale de ejecutar_sql.",
  tools       : dt.tools( "sql,calidad,estadistica" ),
  model       : aiModel( provider: "gemini" )
)
println( agente.run( "¿Qué segmento de clientes compra más?" ) )
println( dt.anonimizacion() )   // qué se anonimizó
println( dt.evidencia() )       // todo lo que ejecutaron las tools
```

Ejemplo completo que corre **sin API key** (proveedor `mock`): `boxlang ejemplos/analista.bxs` (usa `ejemplos/clientes_sv.xlsx`, datos 100 % sintéticos).

Base de datos vía MCP (por ejemplo `mcp-server-sqlite` detrás de `supergateway`):
```js
dt = new bxModules.bxdatatools.models.DataTools( mcpUrl: "http://localhost:8766/mcp" )
// otro servidor: nombresMcp: { listar: "...", describir: "...", consultar: "query", argTabla: "...", argSql: "sql" }
```

Opciones de `DataTools( anonimizar = true, sal = "", mcpUrl = "", nombresMcp = {} )`. Sin `sal` se usa la variable `ANON_SALT` o una aleatoria por arranque (los pseudónimos cambian entre reinicios).

## Clases

`DataTools` (punto de entrada), `Catalogo` (lectores + SQL de solo lectura + bitácora), `Anonimizador`, `IngenieroDatos` (calidad, limpieza, esquema, fuga, consejos), `Estadistica`, `Operaciones` (quiebre de stock), `Informe` (gráficas e informe HTML que funciona sin internet), `ConectorMCP`.

## Límites

- La anonimización es por reglas (nombre de columna + forma del valor). Revisa `dt.anonimizacion()` con datos nuevos.
- Las tablas viven en memoria: pensado para archivos de miles a cientos de miles de filas, no para millones.
- Si además tienes los jars de POI en `~/.boxlang/lib`, log4j puede imprimir un aviso al iniciar; es inofensivo.

Licencia Apache 2.0.
