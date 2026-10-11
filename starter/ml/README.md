# ML desde BoxLang (verificado 10/10/2026)

- `ml.bxs`: regresión con Tribuo (librería ML de Oracle para Java) usada desde BoxLang por interop. R² ≈ 0.99997 en datos sintéticos.
- `py.bxs` + `py.py`: BoxLang llama a un script de Python con `systemExecute` y lee su JSON.

## Instalar Tribuo para BoxLang
Copia los jars a `~/.boxlang/lib/` (BoxLang los carga solos). Con Maven:
```bash
mvn dependency:copy-dependencies -DoutputDirectory=$HOME/.boxlang/lib
```
con un pom.xml que tenga `org.tribuo:tribuo-regression-sgd:4.3.2` (y `tribuo-classification-*` o `tribuo-regression-xgboost` si los necesitas).

Trampa: los arrays Java se pasan con `javaCast( "double[]", [...] )` y `javaCast( "String[]", [...] )`.
