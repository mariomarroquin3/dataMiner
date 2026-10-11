"""Genera Excel "sucios" y desnormalizados de una distribuidora salvadoreña ficticia.

Uso: python3 generar_excel_sucios.py [carpeta_salida]
Todos los nombres, DUI, NIT y teléfonos son inventados (semilla fija, siempre salen iguales).
"""
import random, sys, os
from datetime import date, timedelta
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

random.seed(2026)
SALIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
EMPRESA = "DISTRIBUIDORA CUSCATLÁN, S.A. DE C.V."

# ------------------------------------------------------------------ catálogos "verdaderos"
SUCURSALES = [
    # cod, nombre, variantes de escritura, dirección, municipio, departamento, gerente, tel
    ("SS01", "San Salvador Centro", ["San Salvador Centro", "SAN SALVADOR CENTRO", "S.S. Centro", "san salvador centro "], "4a Calle Poniente #215", "San Salvador", "San Salvador", "Roberto Alfaro", "2221-4580"),
    ("SS02", "Escalón", ["Escalón", "Escalon", "ESCALON", "Col. Escalón"], "Paseo General Escalón #3910", "San Salvador", "San Salvador", "Claudia Menjívar", "2264-1190"),
    ("LL01", "Santa Tecla", ["Santa Tecla", "Sta. Tecla", "SANTA TECLA"], "Calle Daniel Hernández #18", "Santa Tecla", "La Libertad", "Óscar Rivas", "2228-7731"),
    ("SS03", "Soyapango", ["Soyapango", "soyapango", "SOYAPANGO "], "Blvd. del Ejército km 4", "Soyapango", "San Salvador", "Karla Henríquez", "2277-3402"),
    ("SA01", "Santa Ana", ["Santa Ana", "STA ANA", "Santa  Ana"], "Av. Independencia Sur #12", "Santa Ana", "Santa Ana", "Mauricio Linares", "2440-9921"),
    ("SM01", "San Miguel", ["San Miguel", "S. Miguel", "SAN MIGUEL"], "Av. Roosevelt Sur #7", "San Miguel", "San Miguel", "Iris Portillo", "2661-5076"),
    ("SO01", "Sonsonate", ["Sonsonate", "SONSONATE"], "Calle Obispo Marroquín #3", "Sonsonate", "Sonsonate", "Ernesto Chávez", "2451-2288"),
    ("LL02", "Puerto de La Libertad", ["Puerto de La Libertad", "La Libertad Puerto", "Pto. La Libertad"], "Calle El Malecón, Local 4", "La Libertad", "La Libertad", "Wendy Aguilar", "2335-6140"),
    ("US01", "Usulután", ["Usulután", "Usulutan"], "2a Av. Norte #9", "Usulután", "Usulután", "Nelson Fuentes", "2662-8810"),
]
# Proveedores: nombre, NIT, teléfono, contacto
PROVEEDORES = {
    "Café Volcán S.A.": ("0614-120389-102-4", "2510-3344", "Lucía Hernández"),
    "Granos del Pacífico": ("0614-030497-101-9", "2234-8890", "Mario Ayala"),
    "Lácteos Chalate": ("0407-221110-101-2", "2335-1020", "Rosa Guardado"),
    "Bebidas Izalco": ("0315-150702-103-6", "2450-7700", "Javier Mejía"),
    "Higiene Total C.A.": ("0614-080815-105-1", "2207-5566", "Ana Cruz"),
    "Panificadora Ilopango": ("0614-191199-104-8", "2295-0081", "Pedro Ramos"),
}
PRODUCTOS = [
    # sku, nombre, categoría (variantes), subcategoría, proveedor, precio, costo
    ("CAF-001", "Café molido 400g", ["Abarrotes", "abarrotes", "ABARROTES"], "Café", "Café Volcán S.A.", 4.25, 2.90),
    ("CAF-002", "Café en grano 1lb", ["Abarrotes"], "Café", "Café Volcán S.A.", 6.75, 4.60),
    ("FRI-001", "Frijol rojo de seda 2lb", ["Abarrotes", "Granos básicos"], "Granos", "Granos del Pacífico", 2.40, 1.55),
    ("ARR-001", "Arroz blanco 5lb", ["Abarrotes", "Granos básicos"], "Granos", "Granos del Pacífico", 3.95, 2.70),
    ("AZU-001", "Azúcar blanca 2.5kg", ["Abarrotes"], "Endulzantes", "Granos del Pacífico", 3.10, 2.35),
    ("HAR-001", "Harina de maíz 2lb", ["Abarrotes"], "Harinas", "Granos del Pacífico", 1.35, 0.85),
    ("LAC-001", "Quesillo 1lb", ["Lácteos", "Lacteos", "LACTEOS"], "Quesos", "Lácteos Chalate", 3.80, 2.40),
    ("LAC-002", "Crema 500ml", ["Lácteos", "Lacteos"], "Cremas", "Lácteos Chalate", 2.25, 1.40),
    ("LAC-003", "Leche entera 1L", ["Lácteos"], "Leches", "Lácteos Chalate", 1.20, 0.82),
    ("BEB-001", "Gaseosa 2.5L", ["Bebidas", "bebidas"], "Gaseosas", "Bebidas Izalco", 1.95, 1.20),
    ("BEB-002", "Agua purificada 1 galón", ["Bebidas"], "Agua", "Bebidas Izalco", 1.10, 0.55),
    ("BEB-003", "Horchata en polvo 400g", ["Bebidas", "Abarrotes"], "Refrescos", "Bebidas Izalco", 2.60, 1.65),
    ("HIG-001", "Detergente 1kg", ["Limpieza", "limpieza", "Higiene"], "Detergentes", "Higiene Total C.A.", 3.45, 2.20),
    ("HIG-002", "Papel higiénico 4 rollos", ["Higiene", "Limpieza"], "Papel", "Higiene Total C.A.", 2.15, 1.30),
    ("HIG-003", "Jabón de lavar barra", ["Limpieza"], "Jabones", "Higiene Total C.A.", 0.75, 0.40),
    ("PAN-001", "Pan francés bolsa 10u", ["Panadería", "Panaderia"], "Pan salado", "Panificadora Ilopango", 1.00, 0.55),
    ("PAN-002", "Semita alta", ["Panadería"], "Pan dulce", "Panificadora Ilopango", 1.75, 0.95),
    ("PAN-003", "Quesadilla salvadoreña", ["Panadería", "PANADERIA"], "Pan dulce", "Panificadora Ilopango", 2.50, 1.30),
]
VENDEDORES = {  # vendedor -> sucursal (dependencia que el detector debe encontrar)
    "SS01": ["José Martínez", "Daniela Orellana"], "SS02": ["Fátima Rosales", "Kevin Benítez"],
    "LL01": ["Andrea Pineda", "Luis Escobar"], "SS03": ["Carlos Molina", "Marta Gómez"],
    "SA01": ["Diego Zelaya", "Sofía Cáceres"], "SM01": ["Jorge Villalta", "Paola Cruz"],
    "SO01": ["Ricardo Funes"], "LL02": ["Gabriela Saravia"], "US01": ["Miguel Bonilla"],
}
NOMBRES = ["Ana", "José", "María", "Carlos", "Rosa", "Luis", "Carmen", "Jorge", "Sandra", "Mario", "Yesenia", "René", "Silvia", "Walter", "Brenda", "Edwin", "Patricia", "Douglas", "Xiomara", "Héctor"]
APELLIDOS = ["López", "Hernández", "Martínez", "García", "Rivera", "Flores", "Ramírez", "Pérez", "Mejía", "Romero", "Castillo", "Alvarado", "Quintanilla", "Sorto", "Lemus", "Guevara", "Argueta", "Cornejo"]
EMPRESAS_CLIENTE = ["Tienda La Bendición", "Comedor Doña Tere", "Pupusería El Comal", "Minisúper San José", "Cafetería Los Almendros", "Hotel Brisas del Mar", "Restaurante El Guanaco"]


def dui():
    return f"{random.randint(0, 9999999):08d}-{random.randint(0, 9)}"


def nrc():
    return f"{random.randint(10000, 299999)}-{random.randint(0, 9)}"


def tel():
    return f"{random.choice('267')}{random.randint(100, 999)}-{random.randint(1000, 9999)}"


CLIENTES = []
for i in range(60):
    nom = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)} {random.choice(APELLIDOS)}"
    CLIENTES.append({"nombre": nom, "dui": dui(), "tel": tel(), "nrc": "", "tipo": "Consumidor final"})
for e in EMPRESAS_CLIENTE:
    CLIENTES.append({"nombre": e, "dui": "", "tel": tel(), "nrc": nrc(), "tipo": "Contribuyente"})

TITULO = Font(bold=True, size=14)
ENC = Font(bold=True, color="FFFFFF")
FONDO = PatternFill("solid", fgColor="1F4E78")


def encabezado(ws, fila, columnas):
    for j, c in enumerate(columnas, 1):
        x = ws.cell(row=fila, column=j, value=c)
        x.font, x.fill, x.alignment = ENC, FONDO, Alignment(wrap_text=True)
        ws.column_dimensions[x.column_letter].width = max(12, min(30, len(c) + 4))


def fecha_sucia(d):
    """Mezcla fechas reales de Excel con texto en varios formatos."""
    r = random.random()
    if r < 0.70:
        return d
    if r < 0.85:
        return d.strftime("%d/%m/%Y")
    if r < 0.95:
        return d.strftime("%Y-%m-%d")
    return d.strftime("%d-%b-%y")


def precio_sucio(p):
    r = random.random()
    if r < 0.80:
        return p
    if r < 0.92:
        return f"${p:.2f}"
    return f"{p:.2f}".replace(".", ",")


# ------------------------------------------------------------------ 1) ventas_sucursales_2026.xlsx
def ventas():
    wb = Workbook()
    ws = wb.active
    ws.title = "Ventas Jul-Sep"
    ws["A1"] = EMPRESA
    ws["A1"].font = TITULO
    ws["A2"] = "Reporte de ventas por línea de factura · 3er trimestre 2026 · exportado del POS el 10/10/2026"
    cols = ["No. Factura", "Fecha", "Tipo DTE", "Cód. Sucursal", "Sucursal", "Dirección sucursal", "Municipio", "Departamento",
            "Gerente sucursal", "Tel. sucursal", "Vendedor", "Cliente", "DUI / NRC cliente", "Tel. cliente", "Tipo cliente",
            "SKU", "Producto", "Categoría", "Proveedor", "Tel. proveedor", "Precio unitario", "Cantidad", "Descuento %",
            "Subtotal", "IVA 13%", "Total", "Forma de pago", "Comentario"]
    encabezado(ws, 4, cols)
    fila = 5
    inicio = date(2026, 7, 1)
    n_fact = 10450
    lineas = []
    for _ in range(520):
        n_fact += random.randint(1, 3)
        d = inicio + timedelta(days=random.randint(0, 91))
        suc = random.choices(SUCURSALES, weights=[14, 12, 10, 11, 9, 8, 6, 4, 4])[0]
        cli = random.choice(CLIENTES)
        contrib = cli["tipo"] == "Contribuyente"
        tipo_dte = "CCF" if contrib else random.choice(["Factura", "Factura", "Factura", "factura", "FCF"])
        vend = random.choice(VENDEDORES[suc[0]])
        pago = random.choices(["Efectivo", "Tarjeta", "Transferencia", "Bitcoin", "efectivo", "TARJETA", "Chivo"], weights=[40, 25, 12, 5, 6, 4, 3])[0]
        for prod in random.sample(PRODUCTOS, random.randint(1, 4)):
            lineas.append((n_fact, d, tipo_dte, suc, cli, contrib, vend, pago, prod))
    for (n_fact, d, tipo_dte, suc, cli, contrib, vend, pago, prod) in lineas:
        cod, nom, variantes, direc, muni, depto, gerente, tsuc = suc
        sku, pnom, cats, subcat, prov, precio, costo = prod
        # Anomalías de actualización: el gerente de Santa Ana cambió en septiembre pero no en todas las filas,
        # y el café molido subió de precio a medias.
        if cod == "SA01" and d >= date(2026, 9, 1) and random.random() < 0.6:
            gerente = "Verónica Sandoval"
        if sku == "CAF-001" and d >= date(2026, 9, 15):
            precio = 4.50
        if sku == "LAC-001" and random.random() < 0.05:
            precio = 3.50  # descuento metido en el precio en vez del campo descuento
        tprov = PROVEEDORES[prov][1]
        if prov == "Lácteos Chalate" and random.random() < 0.15:
            tprov = "7120-4455"  # teléfono viejo del proveedor que sigue apareciendo
        cant = random.choice([1, 1, 1, 2, 2, 3, 4, 6, 12, 24])
        if random.random() < 0.015:
            cant = -cant  # devolución registrada como venta negativa
        desc = random.choice([0, 0, 0, 0, 5, 10]) if contrib else 0
        valores = [
            f"F-{n_fact}" if random.random() > 0.03 else str(n_fact),
            fecha_sucia(d), tipo_dte, cod if random.random() > 0.02 else "", random.choice(variantes), direc, muni, depto,
            gerente, tsuc, vend, cli["nombre"] if random.random() > 0.03 else cli["nombre"].upper(),
            cli["nrc"] if contrib else (cli["dui"] if random.random() > 0.08 else ""), cli["tel"], cli["tipo"],
            sku, pnom, random.choice(cats), prov, tprov, precio_sucio(precio), cant, desc,
        ]
        for j, v in enumerate(valores, 1):
            ws.cell(row=fila, column=j, value=v)
            if isinstance(v, date):
                ws.cell(row=fila, column=j).number_format = "DD/MM/YYYY"
        # Fórmulas como las haría un contador (VALUE para tolerar precios en texto con coma no funciona: queda #VALUE!)
        ws.cell(row=fila, column=24, value=f"=IFERROR(U{fila}*V{fila}*(1-W{fila}/100),\"\")")
        ws.cell(row=fila, column=25, value=f"=IFERROR(ROUND(X{fila}*0.13,2),\"\")")
        ws.cell(row=fila, column=26, value=f"=IFERROR(X{fila}+Y{fila},\"\")")
        ws.cell(row=fila, column=27, value=pago)
        com = random.choices(["", "", "", "", "Cliente frecuente", "entregar en bodega", "pagó con billete de $100", "Llamar al 7788-1234 antes de entregar", "precio especial autorizado por gerente"], k=1)[0]
        ws.cell(row=fila, column=28, value=com)
        fila += 1
        # duplicados por doble exportación
        if random.random() < 0.02:
            for j in range(1, 29):
                ws.cell(row=fila, column=j, value=ws.cell(row=fila - 1, column=j).value)
            for j, f in ((24, "=IFERROR(U{0}*V{0}*(1-W{0}/100),\"\")"), (25, "=IFERROR(ROUND(X{0}*0.13,2),\"\")"), (26, "=IFERROR(X{0}+Y{0},\"\")")):
                ws.cell(row=fila, column=j, value=f.format(fila))
            fila += 1
    ws.cell(row=fila + 1, column=1, value="TOTAL GENERAL")
    ws.cell(row=fila + 1, column=26, value=f"=SUM(Z5:Z{fila - 1})")
    ws.cell(row=fila + 1, column=1).font = Font(bold=True)
    n_ventas = fila - 5

    # Hoja 2: la misma tabla, partida por mes y con columnas renombradas
    ws2 = wb.create_sheet("Octubre (parcial)")
    cols2 = ["Factura", "Fecha venta", "DTE", "Sucursal", "Gerente", "Vendedor", "Cliente", "SKU", "Producto", "Categoria", "Precio", "Cant", "Total"]
    encabezado(ws2, 1, cols2)
    f = 2
    for _ in range(90):
        suc = random.choice(SUCURSALES)
        prod = random.choice(PRODUCTOS)
        cli = random.choice(CLIENTES)
        d = date(2026, 10, random.randint(1, 9))
        precio = 4.50 if prod[0] == "CAF-001" else prod[5]
        cant = random.choice([1, 2, 3, 6])
        gerente = "Verónica Sandoval" if suc[0] == "SA01" else suc[6]
        row = [f"F-{n_fact + f}", d.strftime("%d/%m/%Y"), random.choice(["Factura", "CCF"]), random.choice(suc[2]), gerente,
               random.choice(VENDEDORES[suc[0]]), cli["nombre"], prod[0], prod[1], prod[2][0], precio, cant, round(precio * cant * 1.13, 2)]
        for j, v in enumerate(row, 1):
            ws2.cell(row=f, column=j, value=v)
        f += 1

    # Hoja 3: resumen "ancho" (un mes por columna) con fórmulas
    ws3 = wb.create_sheet("Resumen por sucursal")
    ws3["A1"] = "Ventas con IVA por sucursal y mes (US$)"
    ws3["A1"].font = TITULO
    encabezado(ws3, 3, ["Sucursal", "Julio", "Agosto", "Septiembre", "Meta Jul", "Meta Ago", "Meta Sep", "Cumplimiento Q3"])
    for i, s in enumerate(SUCURSALES, 4):
        ws3.cell(row=i, column=1, value=s[1])
        for k, mes in enumerate([7, 8, 9]):
            ws3.cell(row=i, column=2 + k, value=round(random.uniform(1800, 9000), 2))
            ws3.cell(row=i, column=5 + k, value=random.choice([3000, 4000, 5000, 6000, 7500]))
        ws3.cell(row=i, column=8, value=f"=SUM(B{i}:D{i})/SUM(E{i}:G{i})")
        ws3.cell(row=i, column=8).number_format = "0.0%"
    wb.save(os.path.join(SALIDA, "ventas_sucursales_2026.xlsx"))
    return n_ventas


# ------------------------------------------------------------------ 2) sucursales_empleados.xlsx
def sucursales():
    wb = Workbook()
    ws = wb.active
    ws.title = "Sucursales"
    cols = ["Código", "Sucursal", "Ubicación", "Gerente", "Tel. gerente", "Teléfonos", "Empleados", "Horario", "Meta Q1", "Meta Q2", "Meta Q3", "Meta Q4", "Fecha apertura"]
    encabezado(ws, 1, cols)
    for i, s in enumerate(SUCURSALES, 2):
        cod, nom, var, direc, muni, depto, ger, t = s
        emp = VENDEDORES[cod] + [f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}" for _ in range(random.randint(1, 3))]
        sep = random.choice([", ", "; ", " / ", "\n"])
        row = [cod, nom, f"{direc}, {muni}, {depto}", ger, tel(), f"{t} / {tel()}", sep.join(emp),
               random.choice(["L-V 7:00-19:00; S 8:00-14:00", "Lunes a sábado 7am a 7pm", "L-D 6:30-20:00"]),
               *[random.choice([30000, 35000, 40000, 45000, "pendiente", 50000]) for _ in range(4)],
               random.choice([date(2014, 3, 1), "15/08/2017", "2019-11-04", date(2021, 6, 12)])]
        for j, v in enumerate(row, 1):
            ws.cell(row=i, column=j, value=v)
            if isinstance(v, date):
                ws.cell(row=i, column=j).number_format = "DD/MM/YYYY"
    # Sucursal repetida con otro gerente (nadie borró la fila vieja)
    ws.append(["SA01", "Santa Ana", "Av. Independencia Sur #12, Santa Ana, Santa Ana", "Verónica Sandoval", tel(), "2440-9921", "Diego Zelaya, Sofía Cáceres", "L-V 7:00-19:00", 35000, 35000, 40000, 40000, "01/09/2026"])

    ws2 = wb.create_sheet("Planilla")
    ws2["A1"] = "Planilla de empleados · septiembre 2026"
    ws2["A1"].font = TITULO
    cols2 = ["Empleado", "DUI", "Sucursal", "Cód. sucursal", "Cargo", "Salario", "Jefe inmediato", "Tel. jefe", "AFP", "ISSS", "Correo", "Fecha ingreso"]
    encabezado(ws2, 3, cols2)
    r = 4
    for s in SUCURSALES:
        cod, nom, var, direc, muni, depto, ger, t = s
        jefe_tel = tel()
        gente = [(ger, "Gerente de sucursal", 1200)] + [(v, "Vendedor", 450) for v in VENDEDORES[cod]] + \
                [(f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}", random.choice(["Cajero", "Bodeguero", "Cajera"]), 408.80) for _ in range(random.randint(2, 4))]
        for nombre, cargo, sal in gente:
            jefe = "Laura Campos (Gerencia General)" if cargo.startswith("Gerente") else ger
            jt = "2205-0000" if cargo.startswith("Gerente") else jefe_tel
            if random.random() < 0.1:
                jt = tel()  # el teléfono del jefe escrito distinto en otra fila
            salario = random.choice([sal, f"${sal:,.2f}", f"{sal:.2f}".replace(".", ","), f"US$ {sal}"])
            row = [nombre, dui(), random.choice(var), cod if random.random() > 0.1 else "", cargo, salario, jefe, jt,
                   random.choice(["Confía", "Crecer", "AFP Confia", "CRECER"]), f"{random.randint(100000000, 999999999)}",
                   (nombre.split()[0] + "." + nombre.split()[-1]).lower().replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u") + "@cuscatlan.com.sv",
                   fecha_sucia(date(2015, 1, 1) + timedelta(days=random.randint(0, 3800)))]
            for j, v in enumerate(row, 1):
                ws2.cell(row=r, column=j, value=v)
                if isinstance(v, date):
                    ws2.cell(row=r, column=j).number_format = "DD/MM/YYYY"
            r += 1
    wb.save(os.path.join(SALIDA, "sucursales_empleados.xlsx"))


# ------------------------------------------------------------------ 3) productos_inventario.xlsx
def productos():
    wb = Workbook()
    ws = wb.active
    ws.title = "Catalogo e inventario"
    ws["A1"] = "Catálogo de productos con existencias por sucursal (al 09/10/2026)"
    ws["A1"].font = TITULO
    cods = [s[0] for s in SUCURSALES]
    cols = ["SKU", "Producto", "Categoría", "Subcategoría", "Presentaciones", "Precio venta", "Costo", "Proveedor", "NIT proveedor",
            "Tel. proveedor", "Contacto proveedor"] + [f"Stock {c}" for c in cods] + ["Stock total"]
    encabezado(ws, 3, cols)
    r = 4
    filas = list(PRODUCTOS) + [PRODUCTOS[0], PRODUCTOS[6]]  # SKU repetido con datos distintos
    for k, (sku, nom, cats, sub, prov, precio, costo) in enumerate(filas):
        nit, tp, contacto = PROVEEDORES[prov]
        if k >= len(PRODUCTOS):
            precio = precio + 0.25
            contacto = contacto.split()[0]
        pres = random.choice(["1 unidad", "unidad, fardo 12", "unidad; caja 24", "400g / 1kg", "fardo x 6, fardo x 12, caja"])
        stocks = [random.choice([0, 3, 8, 15, 22, 40, 65, 120, -2, ""]) if random.random() > 0.05 else "N/D" for _ in cods]
        row = [sku, nom, cats[0], sub, pres, precio_sucio(precio), costo, prov, nit, tp, contacto] + stocks
        for j, v in enumerate(row, 1):
            ws.cell(row=r, column=j, value=v)
        ini, fin = ws.cell(row=r, column=12).column_letter, ws.cell(row=r, column=11 + len(cods)).column_letter
        ws.cell(row=r, column=12 + len(cods), value=f"=SUM({ini}{r}:{fin}{r})")
        r += 1

    ws2 = wb.create_sheet("Proveedores")
    encabezado(ws2, 1, ["Proveedor", "NIT", "Teléfono", "Contacto", "Correo", "Productos que surte", "Días de crédito", "Días de entrega"])
    for i, (prov, (nit, tp, contacto)) in enumerate(PROVEEDORES.items(), 2):
        surtidos = [p[0] for p in PRODUCTOS if p[4] == prov]
        row = [prov if i != 3 else prov.upper(), nit, tp if prov != "Lácteos Chalate" else "7120-4455", contacto,
               contacto.split()[0].lower() + "@" + prov.split()[0].lower().replace("é", "e").replace("á", "a") + ".com.sv",
               ", ".join(surtidos), random.choice([15, 30, "30 días", 45, "contado"]), random.choice([2, 3, 5, 7, "1 semana"])]
        for j, v in enumerate(row, 1):
            ws2.cell(row=i, column=j, value=v)
    wb.save(os.path.join(SALIDA, "productos_inventario.xlsx"))


# ------------------------------------------------------------------ 4) pedidos_mayoristas.xlsx (grupos repetidos)
def pedidos():
    wb = Workbook()
    ws = wb.active
    ws.title = "Pedidos"
    cols = ["Pedido", "Fecha", "Cliente", "NRC", "Giro", "Dirección de entrega", "Departamento", "Sucursal que despacha"]
    for k in range(1, 6):
        cols += [f"Producto {k}", f"Cant {k}", f"Precio {k}"]
    cols += ["Total pedido", "Estado", "Notas"]
    encabezado(ws, 1, cols)
    giros = {e: random.choice(["Venta de abarrotes", "Restaurante", "Hotel y restaurante", "Comedor"]) for e in EMPRESAS_CLIENTE}
    deptos = {e: random.choice(["San Salvador", "La Libertad", "Santa Ana", "San Miguel"]) for e in EMPRESAS_CLIENTE}
    nrcs = {e: next(c["nrc"] for c in CLIENTES if c["nombre"] == e) for e in EMPRESAS_CLIENTE}
    for i in range(2, 122):
        e = random.choice(EMPRESAS_CLIENTE)
        d = date(2026, 7, 1) + timedelta(days=random.randint(0, 100))
        items = random.sample(PRODUCTOS, random.randint(1, 5))
        row = [f"PM-{2000 + i}", fecha_sucia(d), e if random.random() > 0.1 else e.lower(), nrcs[e], giros[e],
               f"{random.choice(['Col.', 'Barrio', 'Res.'])} {random.choice(['El Centro', 'San Benito', 'Las Palmas', 'Santa Lucía'])} #{random.randint(1, 99)}",
               deptos[e] if random.random() > 0.08 else random.choice(["San Salvador", "La Libertad"]),
               random.choice(SUCURSALES)[1]]
        total = []
        for k in range(5):
            if k < len(items):
                p = items[k]
                c = random.choice([6, 12, 24, 48])
                row += [f"{p[0]} {p[1]}" if random.random() > 0.3 else p[1], c, p[5]]
                total.append(c * p[5])
            else:
                row += ["", "", ""]
        row += [round(sum(total), 2), random.choice(["Entregado", "entregado", "Pendiente", "Anulado", "En ruta"]),
                random.choice(["", "", "Cliente pide factura CCF", "Entregar antes de 10am", "Pagado con Bitcoin"])]
        for j, v in enumerate(row, 1):
            ws.cell(row=i, column=j, value=v)
            if isinstance(v, date):
                ws.cell(row=i, column=j).number_format = "DD/MM/YYYY"
    wb.save(os.path.join(SALIDA, "pedidos_mayoristas.xlsx"))


if __name__ == "__main__":
    n = ventas()
    sucursales()
    productos()
    pedidos()
    print(f"OK: 4 archivos en {SALIDA} ({n} filas en Ventas Jul-Sep)")
