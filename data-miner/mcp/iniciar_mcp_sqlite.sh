#!/bin/bash
# Levanta el servidor MCP oficial de SQLite y lo expone por HTTP para BoxLang AI.
# bx-ai habla MCP por HTTP, así que usamos supergateway como puente stdio -> HTTP.
# Uso: ./iniciar_mcp_sqlite.sh [ruta.db] [puerto]
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
DB="${1:-$DIR/tienda.db}"
PORT="${2:-8766}"
VENV="$HOME/.dataminer-mcp-venv"
if [ ! -x "$VENV/bin/mcp-server-sqlite" ]; then
  python3 -m venv "$VENV"
  # Versiones fijadas: con versiones más nuevas de mcp/pydantic este servidor no arranca
  "$VENV/bin/pip" install -q mcp-server-sqlite "mcp==1.6.0" "pydantic==2.10.6"
fi
[ -f "$DB" ] || python3 "$DIR/crear_tienda_db.py"
echo "MCP SQLite en http://localhost:$PORT/mcp  (export MCP_DB_URL=http://localhost:$PORT/mcp)"
npx -y supergateway@3 --stdio "$VENV/bin/mcp-server-sqlite --db-path $DB" --outputTransport streamableHttp --port "$PORT"
