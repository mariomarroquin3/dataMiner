// Datos simulados para ver la interfaz sin BoxLang: agrega ?mock=1 a la URL.
// Intercepta fetch() de api/*.bxm y responde con JSON de ejemplo (también sirve de plan B en una demo sin servidor).
(function () {
  if (!/[?&]mock=1/.test(location.search)) return;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const tablas = [
    { tabla: 'creditos', fuente: 'ejemplo:data/creditos.csv', filas: 2000, ejemplo: true },
    { tabla: 'precios', fuente: 'ejemplo:data/precios.csv', filas: 300, ejemplo: true },
    { tabla: 'clientes_sv_clientes', fuente: 'ejemplo:clientes_sv.xlsx', filas: 400, ejemplo: true },
    { tabla: 'clientes_sv_compras', fuente: 'ejemplo:clientes_sv.xlsx', filas: 1850, ejemplo: true },
    { tabla: 'operaciones_sv_inventario', fuente: 'ejemplo:operaciones_sv.xlsx', filas: 20, ejemplo: true },
    { tabla: 'operaciones_sv_ventas_diarias', fuente: 'ejemplo:operaciones_sv.xlsx', filas: 2400, ejemplo: true },
    { tabla: 'ventas_erp_2026', fuente: 'subida:ventas_erp.xlsx', filas: 1344 }
  ];
  const mision = {
    provider: 'gemini', formato: 'structured output', mcp: '',
    respuesta: 'Los clientes mayoristas concentran el 61 % de las compras y el impago se dispara en el empleo informal (18 % frente a 7 % en el formal). Reponer tres productos hoy evita perder ventas esta semana y pedir garantía a los informales protege $1.99 M de cartera.',
    acciones: [
      { accion: 'Pide garantía o codeudor a los solicitantes con empleo informal', impacto_usd: 1991022, calculo: 'Los créditos informales en impago suman $1,991,022, el 38 % de la cartera en impago, con el doble de tasa de impago que el resto', verificado: true, plazo: 'este mes' },
      { accion: 'Repón hoy Café molido 400 g, Azúcar 2 kg y Frijol rojo 2 lb', impacto_usd: 14280, calculo: 'Venta semanal promedio de los 3 SKU que se agotan antes de que llegue el proveedor', verificado: true, plazo: 'esta semana' },
      { accion: 'Quita dias_mora_max del modelo de aprobación', impacto_usd: 0, calculo: 'Esa columna se conoce después de otorgar el crédito: el modelo se ve bueno en pruebas pero falla con clientes nuevos', verificado: false, plazo: 'esta semana' }
    ],
    hechos: [
      { afirmacion: 'Los clientes mayoristas concentran la mayor parte de las compras', sql: 'SELECT c.Segmento, SUM(p.Monto_US) AS total FROM clientes_sv_clientes c, clientes_sv_compras p WHERE c.DUI = p.DUI_cliente GROUP BY c.Segmento ORDER BY total DESC', origen: 'csv', verificado: true },
      { afirmacion: 'La tasa de impago en empleo informal es 18 %, el doble que en formal', sql: 'SELECT tipo_empleo, AVG(impago) AS tasa FROM creditos GROUP BY tipo_empleo', origen: 'csv', verificado: true },
      { afirmacion: 'Tres productos se agotan antes de que llegue el proveedor', sql: "SELECT producto, dias_restantes, dias_entrega FROM pronostico_stock WHERE estado IN ('agotado','crítico')", origen: 'csv', verificado: true },
      { afirmacion: 'San Miguel tiene la mora promedio más alta', sql: 'SELECT departamento, AVG(dias_mora_max) FROM creditos GROUP BY departamento ORDER BY 2 DESC', origen: 'csv', verificado: false, nota: 'El SQL devolvió La Libertad en primer lugar' }
    ],
    interpretaciones: ['dias_mora_max se conoce después del crédito: no debe usarse para predecir impago', 'Las oportunidades por referido cierran más que las de llamada en frío'],
    anonimizacion: [{ tabla: 'clientes_sv_clientes', columna: 'DUI', tipo: 'dui' }, { tabla: 'clientes_sv_clientes', columna: 'Nombre_completo', tipo: 'nombre' }, { tabla: 'clientes_sv_clientes', columna: 'Telefono', tipo: 'telefono' }],
    graficos: [1, 2, 3],
    evidencia: [
      { sql: 'anonimizar(clientes_sv_clientes)', filas: 400 }, { sql: 'perfilar(creditos)', filas: 2000 },
      { sql: 'calidad.diagnostico_calidad(creditos)', filas: '' },
      { sql: 'SELECT c.Segmento, SUM(p.Monto_US) AS total FROM clientes_sv_clientes c, clientes_sv_compras p WHERE c.DUI = p.DUI_cliente GROUP BY c.Segmento', filas: 3 },
      { sql: 'estadistica.correlacion(creditos, pearson)', filas: 8 },
      { sql: 'ml.comparar_modelos(creditos, impago, logistica,arbol,random_forest)', filas: 3 },
      { sql: 'stock.pronostico_stock(operaciones_sv_ventas_diarias, operaciones_sv_inventario)', filas: 20 },
      { sql: 'SELECT departamento, AVG(dias_mora_max) FROM creditos GROUP BY departamento', filas: 14, error: 'Verificación: la cifra no coincide con el hecho' }
    ],
    siguientes_preguntas: ['¿Cuánto me cuesta el pedido sugerido de esta semana?', '¿Qué departamento tiene más mora?', 'Predice impago con Random Forest y compáralo con regresión logística'],
    tablas
  };
  const subida = {
    tablas: ['ventas_erp_2026'], errores: [], anonimiza: true,
    calidad: [{ tabla: 'ventas_erp_2026', filas: 1344, origen: { formato: 'xlsx', hoja: 'Ventas Jul-Sep' }, puntaje: 33, nivel: 'baja',
      anonimizacion: [{ columna: 'DUI_cliente', tipo: 'dui', metodo: 'pseudónimo' }, { columna: 'Telefono', tipo: 'telefono', metodo: 'pseudónimo' }],
      problemas: [
        { severidad: 'alta', columna: 'Fecha', problema: 'fechas en 4 formatos', detalle: '12/07/2026, 2026-07-12, 12-jul-26…', recomendacion: 'Guarda las fechas como aaaa-mm-dd desde la captura' },
        { severidad: 'alta', columna: 'Precio_unitario', problema: 'números guardados como texto', detalle: '$4.25 y 4,25 mezclados', recomendacion: 'Usa un campo numérico sin símbolo de moneda' },
        { severidad: 'media', columna: 'Sucursal', problema: 'categoría escrita de 4 formas', detalle: 'S.S. Centro / san salvador centro / SAN SALVADOR CENTRO', recomendacion: 'Lista desplegable con valores fijos' },
        { severidad: 'baja', columna: '(tabla)', problema: '28 filas duplicadas', detalle: '2 % de las filas', recomendacion: 'Clave única Factura + SKU' }
      ],
      normalizacion: { nivel: '1FN', clave: 'No_Factura + SKU', redundancia_pct: 59, hallazgos: [{ forma: '2FN', columna: 'No_Factura', problema: 'determina Fecha, Vendedor y Cliente; se repite en 796 filas' }, { forma: '3FN', columna: 'Proveedor', problema: 'determina NIT y teléfono' }] } }],
    partidas: [{ tablas: ['ventas_erp_2026', 'ventas_erp_octubre'], columnas_en_comun_pct: 100 }],
    catalogo: tablas
  };
  const productos = [
    ['CAF-001', 'Café molido 400 g', 'agotado', 0, 0, 7, '2026-10-11', 180, 'Abarrotes'],
    ['AZU-002', 'Azúcar 2 kg', 'crítico', 38, 3, 7, '2026-10-14', 260, 'Abarrotes'],
    ['FRI-003', 'Frijol rojo 2 lb', 'crítico', 61, 6, 10, '2026-10-17', 210, 'Granos'],
    ['ACE-004', 'Aceite 900 ml', 'pronto', 120, 11, 7, '2026-10-22', 140, 'Abarrotes'],
    ['ARR-005', 'Arroz 5 lb', 'pronto', 95, 12, 10, '2026-10-23', 160, 'Granos'],
    ['LEC-006', 'Leche entera 1 L', 'ok', 310, 28, 5, '2026-11-08', 0, 'Lácteos'],
    ['AGU-007', 'Agua 600 ml ×12', 'ok', 540, 34, 4, '2026-11-14', 0, 'Bebidas'],
    ['JAB-008', 'Jabón de baño', 'ok', 220, 41, 12, '2026-11-21', 0, 'Limpieza'],
    ['PAP-009', 'Papel higiénico ×4', 'ok', 180, 25, 7, '2026-11-05', 0, 'Limpieza'],
    ['SAL-010', 'Sal 1 lb', 'ok', 400, 90, 7, '2027-01-09', 0, 'Abarrotes']
  ].map(([sku, producto, estado, stock, dias_restantes, dias_entrega, fecha_agotamiento, pedir_unidades, categoria]) => ({ sku, producto, estado, stock, dias_restantes, dias_entrega, fecha_agotamiento, pedir_unidades, categoria }));
  const semanas = Array.from({ length: 12 }, (_, i) => { const d = new Date(2026, 6, 20 + i * 7); return { semana: d.toISOString().slice(0, 10), unidades: 900 + i * 40, ventas: 11800 + Math.round(Math.sin(i / 2) * 1800) + i * 260 }; });
  semanas[11].ventas = 6200;
  const tablero = {
    ok: true, base: 'mysql://localhost/tienda_sv',
    kpi: { productos: 20, agotados: 1, criticos: 2, pronto: 2, ok: 15, unidades_pedir: 950, fecha_corte: '2026-10-09', actualizado: '2026-10-11 09:40' },
    dinero: { valor_inventario: 48720, costo_pedido: 3185 },
    productos, semanas,
    categorias: [{ categoria: 'Abarrotes', ventas: 18400 }, { categoria: 'Bebidas', ventas: 12100 }, { categoria: 'Granos', ventas: 9800 }, { categoria: 'Lácteos', ventas: 7600 }, { categoria: 'Limpieza', ventas: 5200 }],
    slack: true
  };
  const alerta = { ok: true, texto: '*Compras de hoy*\n• Café molido 400 g: agotado, pedir 180 u\n• Azúcar 2 kg: 3 días, pedir 260 u\n• Frijol rojo 2 lb: 6 días, pedir 210 u\n\nPronto: Aceite 900 ml (11 d), Arroz 5 lb (12 d)', slack: { motivo: 'Aviso enviado a #compras' }, mysql: 'pronostico_stock actualizado (20 productos)' };

  const real = window.fetch.bind(window);
  window.fetch = async (url, opts) => {
    const u = String(url);
    if (!/api\/[a-z-]+\.bxm/.test(u)) return real(url, opts);
    const json = d => new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json' } });
    if (/mision\.bxm/.test(u)) {
      if (opts && opts.method === 'POST') { await wait(1800); return json(mision); }
      await wait(300); return json({ tablas, mcp: '', provider: 'gemini' });
    }
    if (/subir\.bxm/.test(u)) { await wait(1200); return json(subida); }
    if (/tablero\.bxm/.test(u)) { await wait(500); return json(tablero); }
    if (/alerta-stock\.bxm/.test(u)) { await wait(900); return json(alerta); }
    return real(url, opts);
  };
  // El informe se abre en un iframe (no pasa por fetch): en modo mock se usa el informe de ejemplo
  window.MOCK = { mision, subida, tablero, informeUrl: 'informe-demo.html' };
})();
