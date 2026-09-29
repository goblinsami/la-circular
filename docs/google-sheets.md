# Fase 5 · Preparar Google Sheets

Objetivo: crear el documento que contendrá el catálogo y los textos de La Circular.
La conexión con Nuxt se implementará en la fase 6, una vez verificados estos datos.

No necesitas ejecutar comandos en esta fase. Los pasos se hacen en el navegador.

## 1. Crear el documento

1. Abre https://sheets.new con la cuenta de Google que vaya a conservar la propiedad del documento.
2. Ponle el nombre **La Circular · Catàleg i continguts**.
3. En **Archivo → Configuración**, elige ubicación regional **España** y zona horaria
   **Madrid** (Europe/Madrid). Guarda.
4. Mantén **Compartir → Acceso general → Restringido**.

La ubicación regional controla cómo se introducen y muestran números y monedas.
Con España, escribe los decimales con coma, por ejemplo `3,90`.
[Configuración regional de Google Sheets](https://support.google.com/docs/answer/58515?hl=es).

Si aparece alguna pestaña vacía inicial, renómbrala como la primera categoría.

## 2. Crear seis pestañas

| Pestaña | Uso | Prefijo sugerido para nuevos IDs |
| --- | --- | --- |
| Suplements | Productos | SUP |
| Infusions | Productos | INF |
| Alimentació | Productos | ALI |
| Cosmètica | Productos | COS |
| Altres | Productos | ALT |
| Continguts | Textos de las páginas | No aplica |

Conserva los acentos y los nombres indicados. El nombre de cada pestaña de productos
será su categoría. `Continguts` se tratará por separado y nunca como una categoría.

## 3. Encabezados de productos

En **A1** de cada una de las cinco pestañas de productos, pega esta línea:
está separada por tabuladores y debe ocupar **A1:G1**.

```tsv
id	nom	descripcio	preu	imatge	actiu	ordre
```

Las cinco pestañas deben tener exactamente los mismos siete encabezados,
en minúsculas y sin espacios añadidos. No añadas títulos ni filas antes del encabezado.

| Columna | Qué introducir |
| --- | --- |
| A · id | Texto único y estable en todo el documento: `SUP-0001`, `INF-0001`, `ALI-0001`… Obligatorio. |
| B · nom | Nombre del producto en catalán. Obligatorio. |
| C · descripcio | Texto breve opcional. Déjala vacía si no hay descripción. |
| D · preu | Número en euros, por ejemplo `3,90`. Vacío si no hay precio. No escribas el símbolo € dentro del valor. |
| E · imatge | Vacía por ahora. La celda vacía se convertirá a `null`; no escribas la palabra `null`. |
| F · actiu | Casilla marcada = TRUE, desmarcada = FALSE. Solo TRUE se mostrará en la web. |
| G · ordre | Entero no negativo opcional, por ejemplo 10, 20, 30. Los menores van primero; los vacíos irán al final. |

Los IDs se asignan manualmente una sola vez. No los calcules con el número de fila,
no los renumeres al ordenar y no reutilices los de productos eliminados.
Si mueves un producto a otra categoría, conserva su ID aunque cambie el prefijo esperado.

El orden será global al combinar categorías. Puedes dejar saltos de 10 para insertar
productos entre otros. Los empates conservarán el orden de lectura de las filas.

## 4. Formato y casillas

Haz estos ajustes en cada pestaña de productos:

1. Selecciona **A2:A1000** y elige **Formato → Número → Texto sin formato**.
2. Selecciona **D2:D1000** y elige **Formato → Número → Número**, con dos decimales.
3. Selecciona **F2:F1000** y elige **Insertar → Casilla**. Conserva los valores
   predeterminados; no definas valores personalizados como Sí/No.
4. Selecciona **G2:G1000** y usa formato numérico sin decimales.
5. Inmoviliza la primera fila desde **Ver → Inmovilizar → 1 fila**.
6. Activa ajuste de texto para las descripciones si lo necesitas.

[Casillas de Google Sheets](https://support.google.com/docs/answer/7684717?hl=es).
Las casillas desmarcadas de filas sin producto no convierten esas filas en productos:
las filas sin datos de producto se ignorarán al leer la hoja.

Para revisar la futura conexión, añade algunos productos reales en al menos dos
categorías. Deja uno activo y otro inactivo y usa órdenes distintos (por ejemplo
20 y 10). Puedes dejar las otras categorías solo con sus encabezados.

No copies los precios ficticios del catálogo provisional como si fueran precios reales.

## 5. Preparar Continguts

En **Continguts!A1**, pega este bloque de dos columnas.
Los valores son los textos provisionales de la web; puedes sustituirlos por los definitivos.

```tsv
clau	valor
home_title	Benvinguts a La Circular.
home_subtitle	La teva botiga de dietètica de barri.
home_text	Un espai proper per cuidar-te cada dia. A La Circular volem acompanyar-te amb una atenció personal i una selecció de productes per al teu benestar.
project_title	El nostre projecte.
project_content	La Circular neix amb la idea de ser una botiga de dietètica propera, arrelada al barri i a les persones que en formen part. Creiem en un tracte de tu a tu, en escoltar i en ajudar-te a trobar opcions que encaixin amb el teu dia a dia.
products_title	Productes.
products_intro	Alimentació, infusions, suplements i cura personal. Descobreix la selecció de La Circular per al teu dia a dia.
```

Debe ocupar **A1:B8**: una fila de encabezados y siete claves distintas.
Mantén las claves de la columna A tal como están. Edita solo los valores de B.
Usa texto plano; puedes añadir saltos de párrafo dentro de una misma celda.
Activa el ajuste de texto e inmoviliza la primera fila.

## 6. Preparar el acceso del servidor

La cuenta de servicio será la identidad técnica con la que Nuxt leerá esta hoja.

1. Abre [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto
   para La Circular, o selecciona uno tuyo destinado a esta web. El ID real lo asigna Google.
2. Ve a **APIs y servicios → Biblioteca**, busca **Google Sheets API** y pulsa **Habilitar**.
   [Activar APIs](https://developers.google.com/workspace/guides/enable-apis).
3. Ve a **IAM y administración → Cuentas de servicio → Crear cuenta de servicio**.
   Puedes llamarla `la-circular-web`.
4. Deja sin asignar los roles opcionales del proyecto y termina la creación.
5. Copia el correo que Google haya generado para esa cuenta.
6. Abre el Sheet, pulsa **Compartir**, añade ese correo como **Lector** y desmarca
   la opción de notificar por correo. Mantén el acceso general restringido.
7. Abre la cuenta de servicio en Google Cloud y ve a **Claves → Añadir clave →
   Crear clave → JSON**. Guarda el archivo descargado fuera del proyecto.

El acceso a esta hoja se concede al compartir el documento con el correo de la
cuenta de servicio. Para este uso no requiere roles de administración ni
delegación de dominio. [Credenciales y acceso a documentos](https://developers.google.com/workspace/guides/create-credentials).

Guarda el JSON en tu equipo y dime solo su ruta absoluta, no su contenido.
Contiene la clave privada. En la fase 6 configuraremos las credenciales como
variables de entorno privadas del servidor; no se subirán a Git ni se enviarán al navegador.

Si Google bloquea la creación de la clave por una política de tu organización,
dime el mensaje exacto antes de cambiar políticas.
[Gestión de claves](https://docs.cloud.google.com/iam/docs/keys-create-delete).

El permiso Lector basta para las fases de lectura. Al implementar la edición
administrativa se solicitará el cambio a Editor sobre este documento.

## 7. Qué comprobar y qué enviarme

Comprueba:

- Existen las cinco categorías y `Continguts`.
- Las categorías tienen los encabezados exactos en A1:G1.
- Los IDs están escritos como texto y no se repiten entre pestañas.
- `preu` y `ordre` contienen números, y `imatge` está vacía.
- La casilla `actiu` se puede marcar y desmarcar.
- Hay algunos productos reales para comprobar orden y activo/inactivo.
- `Continguts!A1:B8` contiene los dos encabezados y las siete claves.
- La cuenta de servicio figura como Lector y el documento sigue restringido.

Cuando esté preparado, envíame:

1. La **URL completa del Sheet**. De ella obtendremos el ID del documento,
   que es distinto del `gid` de una pestaña.
2. El **correo de la cuenta de servicio**.
3. La **ruta local del JSON descargado**, sin pegar la clave.
4. Confirmación de que habilitaste Google Sheets API y compartiste la hoja como Lector.

Verificación completada el 29/09/2026: autenticación y lectura correctas con la cuenta de servicio. Se han revisado las seis pestañas, los encabezados, los IDs, los tipos de precio/activo/orden y las siete claves de contenido, sin incidencias. Hay 16 productos: 13 activos y 3 inactivos, todos sin imagen. La fase 6 se ha completado: /api/products y el catálogo leen el Sheet. La lectura de textos corresponde a la fase 7.
