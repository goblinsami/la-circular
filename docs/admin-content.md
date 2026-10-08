# Edición de todos los textos

El panel `/admin` y la pestaña `Continguts` de Google Sheets comparten el inventario
de `types/content.ts`: 139 campos para los textos propios de la web y del panel.
Incluye títulos, párrafos, marca, navegación, menú móvil, pie, botones, tarjetas,
ilustración de inicio, filtros, contadores, estados vacíos, errores, confirmaciones,
mensajes administrativos, título del navegador y textos de accesibilidad.

Los nombres y descripciones de productos se editan en sus pestañas de catálogo.
La categoría es el nombre de la pestaña. El correo de la sesión es un dato de
Identity. Los mensajes y controles nativos del navegador (validación de formularios,
selector de archivos y aviso de cierre) dependen del navegador y su idioma.

## Panel

1. Iniciar sesión con la cuenta invitada en `/admin`.
2. Buscar el texto en su grupo: inicio, proyecto, productos, cabecera, pie,
   accesibilidad/mensajes o administración. Cada campo muestra su texto actual
   y su clave estable para localizarlo también en el Excel.
3. Editar y pulsar **Desa els canvis**. Los textos se guardan juntos.
4. Esperar la confirmación y revisar la página. Los textos compartidos de la
   sesión actual se actualizan al guardar; al recargar se leen de Sheets.

Si falla el guardado se conserva el borrador. El panel avisa antes de salir con
cambios pendientes. Los textos son planos: ni HTML ni fórmulas se ejecutan.
Se admiten saltos de línea y se recortan los espacios exteriores.

## Compatibilidad con el Excel existente

Se mantienen los encabezados `clau` y `valor` y las siete claves originales.
Si faltan las nuevas claves se muestran sus valores iniciales sin romper la web.
Al guardar desde el panel se añaden las claves nuevas al final de `Continguts`
en la misma operación que actualiza las existentes. No se modifican otras filas
ni las pestañas de productos. Reordenar las filas no cambia su significado.
Las claves duplicadas y los valores vacíos se rechazan antes de escribir.

La cuenta de servicio necesita permiso **Editor** sobre el Sheet para guardar.
Las lecturas públicas usan alcance de solo lectura. El esquema funciona tanto
con edición directa del Excel como con el panel; no existe una segunda fuente
de textos que haya que mantener sincronizada.

Los textos compartidos tienen una sola clave: por ejemplo la marca en la cabecera
y el pie, y los botones repetidos para reintentar. Cambiarla actualiza sus usos.

## Variables dentro de los textos

Conservar los marcadores cuando deba mostrarse el dato correspondiente:

| Texto | Marcadores |
| --- | --- |
| Contadores del catálogo | `{count}`, `{total}` |
| Descripción accesible de imágenes | `{name}` |
| Selector de productos en administración | `{name}`, `{category}` |
| Ayuda de longitud de los campos | `{limit}` |

Las variantes singular/plural y filtrado/sin filtrar tienen claves independientes.
La sustitución conserva literalmente los nombres, incluso si incluyen HTML,
símbolos o llaves. Vue escapa el resultado al mostrarlo.

## Servidor y límites

- `GET /api/content`: inventario de textos público, sin filas ajenas.
- `GET /api/admin/content`: mismo inventario con sesión verificada.
- `POST /api/admin/content`: exige exactamente todas las claves del inventario,
  sesión verificada, origen permitido y JSON válido.
- Los límites de cada campo se definen junto a su clave en `types/content.ts`.
  El cuerpo máximo es 2 MiB, suficiente incluso con todos los campos al máximo
  y caracteres escapados en JSON.
- Sheets usa `valueInputOption: RAW`. Se comprueba el número de celdas actualizado,
  incluyendo la columna A de las claves añadidas, antes de confirmar el guardado.

## Verificación

Las pruebas revisan todos los componentes, páginas y layouts para detectar textos
literales, atributos accesibles fijos y referencias a claves inexistentes. También
comprueban límites, variables, compatibilidad con la hoja antigua y migración sin
modificar filas ajenas. `npm test` ejecuta estas comprobaciones.

La regresión de Netlify usa el adaptador real con Identity y Sheets simulados,
sin escrituras en el documento real. Comprueba autenticación, protección de origen,
guardado, recarga, migración y renderizado de los nuevos textos en la página pública:

```powershell
$env:NITRO_PRESET = 'netlify'
npm run build
npm run test:netlify
Remove-Item Env:NITRO_PRESET
```

Esta actualización del código no despliega la web ni modifica el Excel real.
Las nuevas filas se crean cuando se guarden los textos desde el panel actualizado.
