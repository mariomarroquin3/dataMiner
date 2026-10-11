# Crea mcp/tienda.db: base SQLite "desconocida" de ejemplo (clientes + pedidos)
import sqlite3, random, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
random.seed(3)
c = sqlite3.connect('tienda.db'); k = c.cursor()
k.executescript("""drop table if exists clientes; drop table if exists pedidos;
create table clientes(id integer primary key, nombre text, departamento text, segmento text);
create table pedidos(id integer primary key, cliente_id integer, fecha text, categoria text, monto real, devuelto integer);""")
deps = ['San Salvador', 'La Libertad', 'Santa Ana', 'San Miguel']; seg = ['minorista', 'mayorista', 'online']
for i in range(1, 201):
    k.execute("insert into clientes values(?,?,?,?)", (i, f'Cliente {i}', random.choice(deps), random.choice(seg)))
cats = ['electronica', 'ropa', 'hogar', 'alimentos']
for i in range(1, 3001):
    cat = random.choice(cats); m = round(random.lognormvariate(3.5, 0.8), 2)
    k.execute("insert into pedidos values(?,?,?,?,?,?)", (i, random.randint(1, 200), f'2026-{random.randint(1,9):02d}-{random.randint(1,28):02d}', cat, m, 1 if random.random() < (0.18 if cat == 'ropa' else 0.05) else 0))
c.commit(); print("tienda.db creada")
