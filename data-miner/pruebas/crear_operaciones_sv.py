import random, math, datetime, openpyxl, sys
random.seed(2026)
wb = openpyxl.Workbook(); inv = wb.active; inv.title = "Inventario"
inv.append(["SKU","Producto","Categoria","Stock actual","Costo unitario (US$)","Precio venta (US$)","Dias de entrega proveedor"])
productos = [
 ("CAF-001","Café molido 400 g","Abarrotes"),("CAF-002","Café en grano 1 kg","Abarrotes"),("AZU-001","Azúcar 2 kg","Abarrotes"),
 ("ARR-001","Arroz 5 lb","Abarrotes"),("FRI-001","Frijol rojo 2 lb","Abarrotes"),("ACE-001","Aceite 1 L","Abarrotes"),
 ("LEC-001","Leche en polvo 800 g","Lácteos"),("QUE-001","Queso duro 1 lb","Lácteos"),("CRE-001","Crema 500 ml","Lácteos"),
 ("JAB-001","Jabón de lavar","Limpieza"),("DET-001","Detergente 1 kg","Limpieza"),("CLO-001","Lejía 1 L","Limpieza"),
 ("PAP-001","Papel higiénico 4 u","Higiene"),("PAS-001","Pasta dental","Higiene"),("SHA-001","Shampoo 400 ml","Higiene"),
 ("GAS-001","Gaseosa 2 L","Bebidas"),("AGU-001","Agua 600 ml","Bebidas"),("JUG-001","Jugo 1 L","Bebidas"),
 ("TOR-001","Harina de maíz 2 lb","Abarrotes"),("HUE-001","Huevos 30 u","Frescos")]
inicio = datetime.date(2026,6,12); dias = 120
ventas = wb.create_sheet("Ventas diarias"); ventas.append(["Fecha","SKU","Unidades vendidas"])
for i,(sku,nom,cat) in enumerate(productos):
    base = random.uniform(3,25); tendencia = random.choice([0,0,0.03,0.06,-0.02])  # crecimiento diario relativo bajo
    if sku in ("CAF-001","AGU-001","HUE-001"): tendencia = 0.08     # productos que se disparan
    serie=[]
    for d in range(dias):
        fecha = inicio + datetime.timedelta(days=d)
        nivel = base*(1+tendencia*d/10)
        if fecha.weekday()>=5: nivel*=1.4
        u = max(0, int(round(random.gauss(nivel, nivel*0.3))))
        serie.append(u)
        if u>0: ventas.append([fecha.isoformat(), sku, u])
    rec = sum(serie[-14:])/14
    lead = random.choice([3,5,7,10,14])
    # stock: algunos casi agotados, otros sobrados
    if sku in ("CAF-001","AGU-001"): stock = int(rec*2)
    elif sku in ("HUE-001","LEC-001"): stock = int(rec*(lead+2))
    elif sku == "CLO-001": stock = 0
    else: stock = int(rec*random.uniform(8,60))
    costo = round(random.uniform(0.4,6),2); precio = round(costo*random.uniform(1.2,1.6),2)
    inv.append([sku,nom,cat,stock,costo,precio,lead])
op = wb.create_sheet("Oportunidades")
op.append(["ID oportunidad","Empresa","Segmento","Origen","Monto (US$)","Margen %","Dias abierta","Interacciones","Estado"])
empresas = ["Distribuidora","Comercial","Inversiones","Supermercado","Tienda","Farmacia","Restaurante","Hotel","Colegio","Ferretería"]
lugares = ["Santa Tecla","San Miguel","Santa Ana","Soyapango","Apopa","La Libertad","Usulután","Sonsonate","Ilopango","Mejicanos"]
for i in range(1,321):
    seg = random.choices(["Minorista","Mayorista","Corporativo"],[50,35,15])[0]
    origen = random.choices(["Referido","Web","Feria","Llamada en frio"],[25,35,15,25])[0]
    monto = round({"Minorista":600,"Mayorista":3500,"Corporativo":12000}[seg]*random.uniform(0.4,1.8),2)
    margen = round(random.uniform(8,35),1)
    inter = random.randint(1,12)
    dias_ab = random.randint(2,90)
    logit = -0.6 + {"Referido":1.4,"Web":0.2,"Feria":0.4,"Llamada en frio":-0.8}[origen] + 0.22*inter - 0.03*dias_ab - 0.00003*monto
    p = 1/(1+math.exp(-logit))
    estado = "Abierta" if i>240 else ("Ganada" if random.random()<p else "Perdida")
    op.append([f"OP-{i:04d}", f"{random.choice(empresas)} {random.choice(lugares)}", seg, origen, monto, margen, dias_ab, inter, estado])
wb.save(sys.argv[1]); print("ok")
