# La Circular

Fase 6: catálogo conectado a Google Sheets mediante la ruta privada del servidor
`GET /api/products`. La ruta devuelve únicamente el catálogo público normalizado.
Los textos de las páginas siguen locales; su conexión corresponde a la fase 7.

Proyecto: `C:\WORKSPACE\la-circular`. Stack: Nuxt 3 y TypeScript.

## Arrancar

Requisitos: Node.js 22.12 o posterior y npm. Verificado con Node.js 24.15.0.

Las dependencias y el archivo local `.env` ya están preparados en este equipo:

```powershell
cd C:\WORKSPACE\la-circular
npm run dev
```

Abre la URL indicada en la terminal. Para detener el servidor, pulsa Ctrl+C.

En una instalación nueva:

```powershell
npm ci
Copy-Item .env.example .env
```

Completa las variables privadas de `.env` antes de arrancar. El comando de copia
solo se necesita si aún no existe ese archivo.

## Configuración privada

| Variable | Valor |
| --- | --- |
| `NUXT_GOOGLE_SHEET_ID` | ID del documento de Sheets, no el gid de una pestaña. |
| `NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL` | Campo client_email de la cuenta de servicio. |
| `NUXT_GOOGLE_PRIVATE_KEY` | Campo private_key del JSON. Entre comillas dobles, con los saltos de línea como `\n`. |

La cuenta de servicio necesita acceso Lector al documento y Google Sheets API
habilitada. Consulta la [guía de preparación](docs/google-sheets.md).

`.env` está excluido de Git. La clave no se guarda en el código ni en la
configuración pública de Nuxt. El archivo JSON original permanece fuera del proyecto.
Reinicia el servidor si modificas variables de entorno.

## Cómo funciona el catálogo

1. El servidor descubre todas las pestañas de cuadrícula, excepto `Continguts`.
2. Lee sus columnas A:G mediante una petición batchGet, con valores sin formato.
3. Comprueba encabezados, IDs y valores; añade la categoría desde el nombre de la pestaña.
4. Excluye productos inactivos y ordena por `ordre`, con los vacíos al final.
5. Devuelve un array JSON de productos. Las filas vacías con solo casillas se ignoran.
6. La página carga ese array con useFetch y aplica búsqueda y categoría en el navegador.

Las casillas booleanas y los textos TRUE/FALSE se normalizan. Un actiu vacío
equivale a inactivo. Los precios numéricos y los decimales de texto simples con
coma o punto se aceptan; los importes negativos o mal formados se rechazan.
El orden debe ser un entero no negativo. Un ID repetido o encabezados incorrectos
provocan un error controlado. Los campos opcionales vacíos se omiten, excepto
`imatge`, que se devuelve como null.

Por ahora no hay caché de servidor: recarga la página para leer los cambios del
Sheet. El filtrado no hace nuevas peticiones. No hay paginación.

La interfaz diferencia carga, fallo de lectura con botón de reintento, catálogo
vacío y búsqueda sin resultados. Si faltan credenciales la API responde 503;
si falla Google o los datos son inválidos, responde 502 con un mensaje genérico.
Los errores originales de Google no se envían al navegador ni se registran
con sus cabeceras o credenciales.

Las tarjetas actuales funcionan sin imágenes. La integración de imágenes se
mantiene pendiente de las fases previstas.

## Estructura

- `server/api/products.get.ts`: API pública del catálogo.
- `server/utils/google-sheets.ts`: lectura autenticada con la biblioteca oficial de Google.
- `server/utils/product-normalization.ts`: validación, normalización y orden.
- `types/product.ts`: modelo Product.
- `pages/productes.vue`: carga, filtros y estados del catálogo.
- `utils/products.ts`: búsqueda y filtrado local.
- `components/ProductCard.vue`: tarjeta sin dependencia de imágenes.
- `tests/`: pruebas de normalización y filtrado con el ejecutor integrado de Node.
- `assets/css/main.css`: diseño responsive, colores y tipografías del sistema.
- `layouts/default.vue`, `components/SiteHeader.vue`, `components/SiteFooter.vue`: estructura compartida.
- `pages/index.vue`, `pages/el-nostre-projecte.vue`: páginas de texto provisional.
- `nuxt.config.ts`: configuración y claves privadas de runtimeConfig, con valores vacíos por defecto.

Los mocks de productos de la fase 4 se han retirado. Nuxt genera `.nuxt` y
`.output`; no se guardan en Git.

## Verificar

Detén desarrollo antes de compilar para evitar escrituras simultáneas en `.nuxt`.

```powershell
npm test
npm run typecheck
npm run build
npm run preview
```

La fase 6 se ha verificado con 16 tests, comprobación TypeScript y compilación.
También se ha comprobado la versión compilada en navegador a 320, 390, 768 y
1440 píxeles, los filtros, carga, errores, reintento y catálogo vacío.
Las respuestas y los archivos públicos compilados se han comprobado sin credenciales.

## Comprobación manual de la fase 6

1. Abre `/productes`: en la verificación del 29/09/2026 aparecen 13 productos activos.
2. Comprueba que los nombres y precios coinciden con el Sheet, por ejemplo Magnesi citrat.
3. Combina una búsqueda y una categoría; limpia ambos con «Neteja els filtres».
4. Abre `/api/products`: devuelve JSON público sin credenciales ni productos inactivos.
5. Si quieres comprobar una actualización, cambia un nombre o el estado actiu en el
   Sheet y recarga la página. Restaura después el dato si era una prueba.
6. Comprueba navegación y filtros en móvil y con teclado.

Las pruebas automáticas no han modificado el Sheet. El permiso de la cuenta de
servicio sigue siendo de lectura.

La fase 7, pendiente de confirmación, leerá los textos de `Continguts`.
