#!/bin/bash
# Copia las clases compartidas de data-miner/models al módulo (correr desde data-miner/)
set -e
for f in Anonimizador Catalogo IngenieroDatos Estadistica Informe ConectorMCP Operaciones; do cp "models/$f.bx" "modulo/bx-datatools/models/"; done
sed -i 's|"../www/js/chart.umd.js"|"../public/chart.umd.js"|' modulo/bx-datatools/models/Informe.bx
echo "Módulo actualizado. Para instalarlo: cp -r modulo/bx-datatools ~/.boxlang/modules/bxdatatools"
