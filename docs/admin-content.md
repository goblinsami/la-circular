# Fase 9: edición de textos

Panel: https://la-circular.netlify.app/admin

El editor permite modificar los siete textos previstos, agrupados en Inicio,
El nostre projecte y Productes. No permite editar productos, crear páginas
ni cambiar la estructura de la web.

## Permiso necesario

En el Sheet, cambiar el permiso de la cuenta
`la-circular-web@la-circular.iam.gserviceaccount.com` de Lector a **Editor**.
Mantener el acceso general restringido. Se ha solicitado este cambio al propietario;
queda pendiente su confirmación y un guardado desde la sesión real.

La clave y el ID del Sheet ya están configurados de forma privada en Netlify.
Las lecturas públicas siguen usando el alcance de solo lectura. Solo el guardado
administrativo solicita el alcance de escritura de Google Sheets.

## Uso

1. Entrar al panel con la cuenta invitada.
2. Modificar los textos deseados.
3. Pulsar **Desa els canvis**. El botón se habilita cuando hay cambios.
4. Esperar el mensaje **Canvis desats. Ja es poden veure a la web.**
5. Abrir la página correspondiente para comprobar el resultado.

El guardado publica los siete campos juntos. Los saltos de línea se conservan;
los espacios al principio y al final se eliminan. Todos los campos son obligatorios.
Los límites son 200 caracteres por título, 500 en el subtítulo, 10.000 en el texto
de inicio, 20.000 en el proyecto y 2.000 en la introducción del catálogo.

Si falla el guardado, el formulario conserva los cambios para reintentar.
No se afirma que un guardado haya terminado si Google no lo confirma.
El panel avisa antes de navegar, recargar o cerrar sesión con cambios sin guardar.
Evitar editar simultáneamente desde varias ventanas: prevalece el último guardado.

## Servidor

- `GET /api/admin/content`: lectura de los siete valores, con sesión verificada.
- `POST /api/admin/content`: recibe un objeto JSON con exactamente las siete
  claves y valores de texto.
- El middleware de Identity exige sesión y modo Invite only. Las escrituras
  también requieren el mismo origen; sin sesión se devuelve 401, y con un
  origen no permitido, 403.
- Los datos inválidos devuelven 400; un cuerpo de más de 160 KiB, 413; un tipo
  de contenido distinto de JSON, 415. Los fallos de Google se devuelven como
  502 sin incluir credenciales ni respuestas internas.
- La escritura busca las filas por sus claves actuales y actualiza únicamente
  sus siete celdas B en `Continguts`. No cambia encabezados, claves, otras filas
  ni pestañas de productos. Si faltan claves o hay duplicados, no escribe.
- `values:batchUpdate` utiliza `valueInputOption: RAW`: texto que empieza por
  `=` sigue siendo texto, y el HTML tampoco se interpreta en la web.
- Tras guardar, se invalida la carga compartida de textos de Nuxt para que la
  navegación pública muestre los nuevos valores.

## Archivos

- `components/AdminContentEditor.vue`: formulario y estados.
- `utils/content-validation.ts`: límites y validación de los siete campos.
- `server/utils/content-update.ts`: selección de las celdas por clave.
- `server/utils/google-sheets.ts`: lectura y guardado autenticados en Google.
- `tests/content-update.test.ts`: validación, claves reordenadas, texto literal
  y conservación de celdas ajenas.

## Verificación

Han pasado los 27 tests y TypeScript. La compilación y las pruebas de navegador
usan el código real del servidor, con Identity y Sheets simulados de forma aislada:
guardado autenticado, respuestas 401/403/400/413/415/502, fallo sin perder el borrador,
actualización pública, recarga y avisos de salida. Responsive y accesibilidad
automática comprobados a 320, 390 y 1440 píxeles.

En Netlify real se han verificado GET y POST administrativos con respuesta 401 ante sesiones ausentes o falsas, y las páginas públicas siguen funcionando. Estas pruebas no han escrito en el Sheet real ni creado accesos de prueba en producción.
Las pruebas de navegador aisladas no forman parte del despliegue. La regresión del adaptador de Netlify se conserva en tests/netlify-content.test.mjs; tampoco se incluye en las funciones publicadas.

Para cerrar la fase, falta cambiar un texto desde la sesión real, guardarlo,
verlo en la página pública y confirmar que permanece al recargar el panel.
Después se espera confirmación antes de pasar a Cloudinary.

## Regresión del guardado en Netlify (07/10/2026)

La comprobación de origen debe leer solo URL y cabeceras. Convertir el evento
completo con `toWebRequest(event)` consumía su cuerpo en el adaptador de Netlify:
una petición JSON válida terminaba rechazada como contenido vacío. La comprobación
actual construye una Request sin cuerpo y conserva la protección de origen.
Se ha reproducido el rechazo con la versión anterior y el guardado correcto con
la versión corregida, sin escribir en el Sheet real.

Para ejecutar la regresión usando el mismo adaptador que producción:

```powershell
$env:NITRO_PRESET = 'netlify'
npm run build
npm run test:netlify
Remove-Item Env:NITRO_PRESET
```

La prueba utiliza Identity y Sheets simulados, rechaza cualquier otra llamada
externa y comprueba POST con/sin Content-Length, lectura autenticada, 401, 403
y errores de formato, campos y tamaño. Los mensajes del panel distinguen estos
errores. Sigue pendiente confirmar un guardado desde la sesión real del usuario;
la edición directa del Sheet solo verifica la lectura pública.