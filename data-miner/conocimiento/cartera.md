# Guía de cartera y cobros

Úsala para interpretar créditos, cuentas por cobrar, mora e impago (financieras, cooperativas, comercios que dan crédito), y para proponer acciones con impacto en dólares.
Los rangos son referencias generales; si la institución tiene sus propias políticas, mandan esas.

## Indicadores que importan
- **Índice de mora** = saldo vencido / cartera total. Se mira por tramos: 1–30, 31–60, 61–90 y más de 90 días.
- **Tasa de impago** por segmento (tipo de empleo, monto, plazo, departamento, producto). Compara cada segmento contra el promedio.
- **Cartera en riesgo** = saldo de los créditos con más de 30 días de atraso.
- **Días promedio de cobro** de las cuentas por cobrar comerciales.
- **Concentración**: qué % de la cartera está en pocos clientes o en un solo segmento.

## Cómo calcular el impacto en dólares
- Pérdida esperada de un segmento = saldo del segmento × tasa de impago del segmento.
- Reducción de pérdida por una política (garantía, codeudor, menor monto) = pérdida esperada × reducción conservadora del impago (por ejemplo 20–30 %). Di qué supuesto usaste.
- Recuperación por gestión de cobro temprana = saldo en mora de 1–30 días × tasa de recuperación esperada.

## Acciones típicas
- Exigir garantía, codeudor o menor monto inicial a los segmentos con impago muy por encima del promedio.
- Llamar a los clientes con 1–30 días de atraso antes de que pasen a 60: se recuperan mucho más fácil.
- Revisar los productos o plazos con mayor impago antes de seguir colocándolos.

## Cuidado con la fuga de datos en modelos
- Variables como días de mora, pagos atrasados o estado de la cuenta se conocen **después** de otorgar el crédito. No sirven para decidir si aprobar: inflan el modelo en pruebas y fallan con clientes nuevos. Usa detectar_fuga.

## Privacidad
- Los datos personales llegan anonimizados. Nunca intentes identificar a una persona; trabaja con segmentos.
