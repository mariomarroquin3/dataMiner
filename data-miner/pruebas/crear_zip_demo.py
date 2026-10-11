# Crea pruebas/ds.zip con 2 CSV para el servidor falso de Kaggle
import zipfile, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
z = zipfile.ZipFile('ds.zip', 'w')
z.writestr('ventas_2025.csv', 'producto,region,unidades,precio\n"Café, molido",Norte,10,4.5\nTé,Sur,3,2\nCafé,Sur,7,4.5\n')
z.writestr('regiones.csv', 'region,poblacion\nNorte,100\nSur,250\n')
z.close()
