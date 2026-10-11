"""Genera tienda_sv.sql: base MySQL de ejemplo (productos + ventas diarias de 120 días que terminan AYER).
Las fechas son relativas a CURDATE(), así que el demo siempre se ve actual. Uso: python generar_tienda_mysql.py"""
import random, os
random.seed(2026)
productos = [
 ("CAF-001","Café molido 400 g","Abarrotes"),("CAF-002","Café en grano 1 kg","Abarrotes"),("AZU-001","Azúcar 2 kg","Abarrotes"),
 ("ARR-001","Arroz 5 lb","Abarrotes"),("FRI-001","Frijol rojo 2 lb","Abarrotes"),("ACE-001","Aceite 1 L","Abarrotes"),
 ("LEC-001","Leche en polvo 800 g","Lácteos"),("QUE-001","Queso duro 1 lb","Lácteos"),("CRE-001","Crema 500 ml","Lácteos"),
 ("JAB-001","Jabón de lavar","Limpieza"),("DET-001","Detergente 1 kg","Limpieza"),("CLO-001","Lejía 1 L","Limpieza"),
 ("PAP-001","Papel higiénico 4 u","Higiene"),("PAS-001","Pasta dental","Higiene"),("SHA-001","Shampoo 400 ml","Higiene"),
 ("GAS-001","Gaseosa 2 L","Bebidas"),("AGU-001","Agua 600 ml","Bebidas"),("JUG-001","Jugo 1 L","Bebidas"),
 ("TOR-001","Harina de maíz 2 lb","Abarrotes"),("HUE-001","Huevos 30 u","Frescos")]
DIAS = 120
out = ["-- Base de ejemplo para Data Miner (generada por generar_tienda_mysql.py). Ábrela en MySQL Workbench y ejecútala (rayo).",
 "SET NAMES utf8mb4;", "CREATE DATABASE IF NOT EXISTS tienda_sv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", "USE tienda_sv;",
 "DROP TABLE IF EXISTS ventas_diarias;", "DROP TABLE IF EXISTS productos;",
 """CREATE TABLE productos (
  sku VARCHAR(20) PRIMARY KEY,
  producto VARCHAR(80) NOT NULL,
  categoria VARCHAR(40),
  stock_actual INT NOT NULL,
  costo_unitario DECIMAL(10,2),
  precio_venta DECIMAL(10,2),
  dias_entrega_proveedor INT NOT NULL DEFAULT 7
);""",
 """CREATE TABLE ventas_diarias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  sku VARCHAR(20) NOT NULL,
  unidades INT NOT NULL,
  INDEX (fecha), INDEX (sku),
  FOREIGN KEY (sku) REFERENCES productos(sku)
);"""]
prods, ventas = [], []
for sku, nom, cat in productos:
    base = random.uniform(3, 25); tend = random.choice([0, 0, 0.03, 0.06, -0.02])
    if sku in ("CAF-001", "AGU-001", "HUE-001"): tend = 0.08
    serie = []
    for d in range(DIAS):
        atras = DIAS - d              # días antes de hoy (el último es ayer)
        nivel = base * (1 + tend * d / 10)
        if d % 7 in (5, 6): nivel *= 1.4
        u = max(0, int(round(random.gauss(nivel, nivel * 0.3))))
        serie.append(u)
        if u > 0: ventas.append(f"(DATE_SUB(CURDATE(), INTERVAL {atras} DAY),'{sku}',{u})")
    rec = sum(serie[-14:]) / 14
    lead = random.choice([3, 5, 7, 10, 14])
    if sku in ("CAF-001", "AGU-001"): stock = int(rec * 2)
    elif sku in ("HUE-001", "LEC-001"): stock = int(rec * (lead + 2))
    elif sku == "CLO-001": stock = 0
    else: stock = int(rec * random.uniform(8, 60))
    costo = round(random.uniform(0.4, 6), 2); precio = round(costo * random.uniform(1.2, 1.6), 2)
    prods.append(f"('{sku}','{nom}','{cat}',{stock},{costo},{precio},{lead})")
out.append("INSERT INTO productos VALUES\n" + ",\n".join(prods) + ";")
for i in range(0, len(ventas), 500):
    out.append("INSERT INTO ventas_diarias (fecha, sku, unidades) VALUES\n" + ",\n".join(ventas[i:i + 500]) + ";")
out.append("SELECT COUNT(*) AS productos FROM productos; SELECT COUNT(*) AS ventas, MIN(fecha), MAX(fecha) FROM ventas_diarias;")
ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tienda_sv.sql")
open(ruta, "w", encoding="utf-8").write("\n".join(out) + "\n")
print("ok:", ruta, len(ventas), "ventas")
