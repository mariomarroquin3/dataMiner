# Guía rápida: BoxLang + BoxLang AI para el hackathon

> Probado el 10/10/2026 con **BoxLang 1.18.0** y **bx-ai 3.6.0** (Java 21). Cada snippet marcado ✅ se ejecutó de verdad.
> Los ejemplos de IA se probaron con el proveedor `mock` (offline, sin API key). Para usar un modelo real solo cambias `provider`.
> El kit de inicio con todos los archivos está en [`starter/`](starter/).

---

## 1. Instalación (10 minutos)

**Requisito:** Java 21 (`java -version`).

```bash
# Mac / Linux
curl -fsSL https://install.boxlang.io/ | bash
# Mac con Homebrew
brew tap ortus-boxlang/boxlang && brew install ortus-boxlang/boxlang/boxlang && install-boxlang
```
```powershell
# Windows (PowerShell como Administrador)
powershell -NoExit -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
```

Comandos que quedan instalados: `boxlang` (ejecutar scripts / REPL), `boxlang-miniserver` (servidor web), `install-bx-module` (módulos).

```bash
boxlang --version                 # verificar
install-bx-module bx-ai           # instalar BoxLang AI (global)
boxlang                           # REPL interactivo
boxlang miScript.bxs              # correr un script
boxlang App.bx arg1 arg2          # correr una clase con main( args )
```

Sin instalar nada: **https://try.boxlang.io** (playground en el navegador, sin módulo de IA).

### Configurar el proveedor de IA

Lo más rápido: una variable de entorno. Cada proveedor la detecta solo.

```bash
export OPENAI_API_KEY=sk-...        # provider "openai" (el default)
export CLAUDE_API_KEY=...           # provider "claude"
export GEMINI_API_KEY=...           # provider "gemini"
export GROQ_API_KEY=...             # provider "groq" (rápido y con capa gratis)
# Ollama local (gratis, sin key): provider "ollama"
```

O en `~/.boxlang/config/boxlang.json`:

```json
{
  "modules": {
    "bxai": {
      "settings": {
        "provider": "openai",
        "apiKey": "${OPENAI_API_KEY}",
        "defaultParams": { "model": "gpt-4o-mini", "temperature": 0.7 }
      }
    }
  }
}
```

Proveedores: openai, claude, gemini, groq, grok, deepseek, mistral, ollama, openrouter, perplexity, cohere, bedrock, huggingface, cloudflare, **mock** (pruebas offline).

Según el [Provider Setup](https://ai.ortusbooks.com/getting-started/installation/provider-setup) de BoxLang AI:

| `provider` | Variable de entorno | Notas para el hackathon |
|---|---|---|
| `gemini` | `GEMINI_API_KEY` (o `GOOGLE_API_KEY`) | **Capa gratis**: buena opción si no tienes créditos |
| `groq` | `GROQ_API_KEY` | **Capa gratis**, muy rápido para demos |
| `openai` | `OPENAI_API_KEY` | Proveedor por defecto |
| `claude` | `CLAUDE_API_KEY` (o `ANTHROPIC_API_KEY`) | |
| `ollama` | (no necesita) | Local y gratis: `ollama pull llama3.2` y luego `ollama serve` |
| `openrouter` | apiKey en options | Tiene algunos modelos gratis |

Los nombres de modelo cambian seguido, así que revisa la lista actual de cada proveedor.

También puedes pasar la key en cada llamada ✅:
```js
aiChat( "Hola", {}, { provider: "gemini", apiKey: getSystemSetting( "GEMINI_API_KEY" ) } )
```

Ollama en otro host o puerto: en `boxlang.json`, bajo `bxai.settings`, pon `"chatURL": "http://localhost:11434"`.

---

## 2. Tipos de archivo

| Extensión | Para qué |
|---|---|
| `.bxs` | Script. Lo más rápido para el hackathon. |
| `.bx`  | Clase (modelos, servicios, `Application.bx`). |
| `.bxm` | Plantilla web / endpoint (HTML + `<bx:script>`). |

---

## 3. Sintaxis esencial ✅ (`starter/scripts/01-basico.bxs`)

```js
// Variables e interpolación con #...#; concatenar con &
nombre = "Mario"
println( "Hola #nombre#" )
println( "Hola " & nombre )

// Arrays (¡empiezan en 1!) y structs
frutas = [ "manzana", "pera" ]
frutas.append( "mango" )
println( frutas[ 1 ] & " / " & frutas.len() )

persona = { nombre: "Ana", skills: [ "java", "boxlang" ] }
persona.ciudad = "San Salvador"

// Lambdas: filter / map / reduce / sort / each
proyectos = [ { name: "Study Buddy", score: 92 }, { name: "Resume Coach", score: 95 } ]
top   = proyectos.filter( p => p.score >= 90 ).map( p => p.name )
total = proyectos.reduce( ( acc, p ) => acc + p.score, 0 )
mejor = proyectos.sort( ( a, b ) => b.score - a.score ).first()

// Funciones: tipos opcionales, defaults y argumentos nombrados
function saludar( required string quien, string saludo = "Hola" ) {
  return "#saludo#, #quien#"
}
saludar( saludo: "Buenas", quien: "jurado" )

// Control de flujo
for ( f in frutas ) { if ( f.len() > 4 ) { println( f ) } else if ( f == "uva" ) { } }
for ( i = 1; i <= 3; i++ ) { print( i ) }
for ( k, v in persona ) { println( k ) }
switch ( x ) { case 1: println( "uno" ); break; default: println( "otro" ) }

// Null-safety
println( config.tema ?: "oscuro" )              // Elvis
println( config?.usuario?.nombre ?: "anónimo" )  // navegación segura

// Errores
try { throw( type: "MiError", message: "falló" ) }
catch ( MiError e ) { println( e.message ) }
finally { }

// JSON
json = jsonSerialize( persona )
obj  = jsonDeserialize( '{"a":1}' )

// Java directo
import java.time.LocalDate
println( LocalDate.now() )
```

### ⚠️ Trampas que encontré probando (ahorran tiempo)

- Usa **`jsonSerialize` / `jsonDeserialize`**. `serializeJSON` y `chr()` son de CFML y **no existen** sin el módulo `bx-compat-cfml`. Usa `char( 10 )` para salto de línea.
- En `dateFormat` el mes es **`MM`** (mayúscula): `dateFormat( now(), "yyyy-MM-dd" )`. Con `mm` salen minutos.
- **No mezcles** argumentos posicionales y nombrados: `aiMemory( memory: "window", config: {...} )` funciona, `aiMemory( "window", config: {...} )` da error de sintaxis (aunque aparezca así en algún README).
- Los arrays empiezan en **1**.

---

## 4. Clases ✅ (`starter/scripts/models/Tarea.bx`)

```js
class accessors="true" {
  property name="titulo"    type="string";
  property name="prioridad" type="numeric" default=1;
  property name="hecha"     type="boolean" default=false;

  function init( required string titulo, numeric prioridad = 1 ) {
    variables.titulo    = arguments.titulo
    variables.prioridad = arguments.prioridad
    return this
  }
  function completar() { variables.hecha = true; return this }
  string function resumen() { return "[#hecha ? 'x' : ' '#] #titulo# (p#prioridad#)" }
}
```

```js
import models.Tarea
t = new Tarea( "Pitch del hackathon", 3 )
t.completar()
println( t.resumen() & " " & t.getHecha() )   // accessors="true" genera getX()/setX()
```

Clase ejecutable (`App.bx`): `class { function main( args = [] ) { println( args.toList() ) } }` → `boxlang App.bx uno dos`.

---

## 5. BoxLang AI ✅ (`starter/scripts/03-ia.bxs`)

Las funciones globales (BIFs) siguen el patrón `aiChat( mensajes, params = {}, options = {} )`:
- `params` va directo al modelo: `model`, `temperature`, `max_tokens`, `tools`.
- `options` controla BoxLang AI: `provider`, `apiKey`, `returnFormat`, `timeout`.

### 5.1 Chat

```js
println( aiChat( "Sugiere 3 features para un asistente de estudio" ) )

// Otro proveedor / modelo
aiChat( "Hola", { model: "gpt-4o-mini", temperature: 0.2 }, { provider: "openai" } )

// Con rol de sistema
aiChat( [
  { role: "system", content: "Eres un tutor conciso" },
  { role: "user",   content: "¿Qué es RAG?" }
] )
```

### 5.2 Plantillas de prompt

```js
msg = aiMessage()
  .system( "Eres experto en ${tema}" )
  .user( "Explica ${concepto} en una frase" )
aiChat( msg.bind( { tema: "IA", concepto: "embeddings" } ) )
```

Prompt reutilizable como pipeline (patrón del Quick Start):
```js
traductor = aiMessage()
  .system( "Eres traductor profesional" )
  .user( "Traduce al ${idioma}: ${texto}" )
  .toDefaultModel()
  .transform( r => r.content )
traductor.run( { idioma: "inglés", texto: "Hola jurado" } )
```

### 5.3 Respuesta estructurada (¡ideal para APIs!)

```js
// models/Receta.bx
class {
  property name="nombre"       type="string";
  property name="minutos"      type="numeric";
  property name="ingredientes" type="array";
}
```
```js
import models.Receta
r = aiChat( "Dame una receta rápida salvadoreña", {}, { returnFormat: new Receta() } )
println( r.getNombre() & " - " & r.getMinutos() & " min" )

// O directamente un struct desde JSON (quita los ```json solos)
data = aiChat( "Lista 3 ideas en JSON {ideas:[...]}", {}, { returnFormat: "json" } )
println( data.ideas.len() )
```

### 5.4 Tools (la IA llama a tu código)

```js
clima = aiTool( "get_weather", "Clima actual de una ciudad", ( city ) => {
  return { city: city, temp: 31, condition: "Soleado" }   // aquí llamas tu API / BD
} ).describeArg( "city", "Nombre de la ciudad" )

println( aiChat( "¿Clima en San Salvador?", { tools: [ clima ] } ) )
```
Verifiqué que el modelo pide la tool, BoxLang la ejecuta y devuelve el resultado al modelo.

### 5.5 Agentes con memoria + tools (lo que más impresiona en la demo)

```js
agente = aiAgent(
  name        : "Tutor",
  description : "Tutor de estudio",
  instructions: "Responde en español, breve.",
  model       : aiModel( "openai" ),      // o "claude", "gemini", "ollama"...
  tools       : [ clima ],
  memory      : aiMemory( memory: "window", config: { maxMessages: 10 } )
)
agente.run( "Hola, soy Mario" )
agente.run( "¿Cómo me llamo?" )   // recuerda la conversación
```

Extras: `subAgents: [ otroAgente ]` (multi-agente), `agente.stream( chunk => ... )`, `skills: aiSkill( "./skills" )`.

### 5.6 Pipelines

```js
pipe = aiModel( "openai" )
  .to( aiTransform( "json" ) )
  .to( aiTransform( d => d.users.len() ) )
pipe.run( "Genera un JSON {users:[...]} con 5 usuarios" )
```

### 5.7 Streaming

```js
aiChatStream( "Escribe un poema", ( chunk ) => print( chunk.choices?.first()?.delta?.content ?: "" ) )
```

### 5.8 RAG con tus documentos ✅ (`starter/scripts/04-rag.bxs`)

```js
docs     = aiDocuments( expandPath( "./docs" ) ).load()     // .md .txt .pdf .csv .json, web...
contexto = docs.map( d => d.getContent() ).toList( char( 10 ) )

msg = aiMessage()
  .system( "Responde SOLO usando este contexto: ${contexto}" )
  .user( "¿A qué hora abre la biblioteca?" )
  .bind( { contexto: aiFence( contexto, "docs" ) } )   // aiFence protege contra prompt injection
println( aiChat( msg ) )
```

RAG con vectores (si hay tiempo, necesita un proveedor con embeddings como OpenAI u Ollama; no lo probé):
```js
memoria = aiMemory( memory: "box", config: { collection: "kb" } )
aiDocuments( "./docs" ).chunk( 1000, 200 ).ingest( memoria )
memoria.getRelevant( "pregunta", 5 )
```

### 5.9 Otras BIFs útiles

`aiImage()` (imágenes), `aiSpeak()` / `aiTranscribe()` (voz), `aiEmbed()`, `aiTokens()`, `aiChunk()`, `aiParallel()` (varios modelos a la vez), `aiWebSearch()`, `mcpServer()` / `MCP()` (Model Context Protocol).

### 5.10 Probar sin gastar tokens: proveedor `mock`

```js
aiChat( "Hola", {}, { provider: "mock", providerOptions: { responses: [ "¡Hola!" ] } } )

// Simular que el modelo llama una tool
aiChat( "clima?", { tools: [ clima ] }, { provider: "mock", providerOptions: { responses: [
  { toolCalls: [ { name: "get_weather", arguments: { city: "Miami" } } ] },
  "Hace 31°C en Miami."
] } } )
```

---

## 6. App web en 5 minutos ✅ (`starter/web/`)

```
web/
├── miniserver.json        { "port": 8080, "webRoot": "./www" }
└── www/
    ├── Application.bx     configuración de la app + sesiones
    ├── index.html         chat UI (HTML + fetch)
    └── api/chat.bxm       endpoint JSON con un agente por sesión
```

```bash
cd starter/web
export AI_PROVIDER=openai      # sin esto usa "mock"
boxlang-miniserver             # http://localhost:8080
```

`www/Application.bx`:
```js
class {
  this.name = "HackathonApp"
  this.sessionManagement = true
  function onApplicationStart() {
    application.provider = server.system.environment.AI_PROVIDER ?: "mock"
    return true
  }
}
```

`www/api/chat.bxm` (resumen):
```js
<bx:script>
  bx:header name="Content-Type" value="application/json";
  raw  = toString( getHTTPRequestData().content ?: "" )
  body = isJSON( raw ) ? jsonDeserialize( raw ) : form       // acepta JSON o form
  mensaje = body.message ?: ( url.q ?: "" )

  if ( !session.keyExists( "agente" ) ) {
    session.agente = aiAgent( name: "Asistente", instructions: "...",
      model: aiModel( application.provider ),
      memory: aiMemory( memory: "window", config: { maxMessages: 20 } ) )
  }
  writeOutput( jsonSerialize( { reply: session.agente.run( mensaje ) } ) )
</bx:script>
```

Probé el servidor con `curl`: JSON, formulario y `?q=` funcionan, y devuelve 400 cuando falta el mensaje.

Datos de la petición: `url.x` (query string), `form.x` (formulario), `getHTTPRequestData().content` (body crudo), `cgi.path_info`. Código de estado: `bx:header statusCode=404;`.

---

## 7. Estrategia para ganar

1. **Problema real + demo en vivo.** Elige algo que el jurado entienda en 10 segundos (estudiantes, campus, comunidad local).
2. **Usa varias piezas de BoxLang AI**: agente + tools (conectado a tus datos) + memoria + RAG o salida estructurada. Eso demuestra que no es "solo un prompt" (es la "gran idea" de la guía oficial del evento).
3. **Desarrolla con `mock`**, cambia a un proveedor real para la demo y ten el `mock` como plan B si falla el wifi.
4. **Hora 1:** que el starter funcione con tu proveedor. **Horas 2–5:** la feature núcleo. **Después:** UI y pulido. **Última hora:** pitch y demo grabada como respaldo.
5. Menciona en el pitch: proveedor intercambiable con una línea, tools, memoria, seguridad (`aiFence`, guardrails), y que corre en la JVM.

### Ideas que encajan bien con BoxLang AI
- **Tutor de estudio con tus apuntes** (RAG sobre PDFs de clase + quiz generado con salida estructurada).
- **Guía del campus / trámites** (agente con tools que consultan horarios, aulas, becas).
- **Coach de CV y entrevistas** (salida estructurada con puntaje y feedback, voz con `aiSpeak`).
- **Asistente para pequeños negocios** (inventario/pedidos en CSV o SQLite, tools para consultar y registrar).
- **Multi-agente**: un agente investigador + uno redactor + uno revisor (`subAgents`).

---

## Enlaces
- Docs BoxLang: https://boxlang.ortusbooks.com · índice para IA: https://boxlang.ortusbooks.com/llms.txt
- Docs BoxLang AI: https://ai.ortusbooks.com · Quick start: https://ai.ortusbooks.com/getting-started/quickstart
- Ejemplos bx-ai: https://github.com/ortus-boxlang/bx-ai/tree/development/examples
- Playground: https://try.boxlang.io · Demos: https://github.com/ortus-boxlang/bx-demos
