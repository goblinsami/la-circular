# La Circular

Catálogo y textos conectados a Google Sheets mediante el servidor
`GET /api/products`. La ruta devuelve únicamente el catálogo público normalizado.
Los siete textos editables se leen de `Continguts` mediante `GET /api/content`.

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

## Textos de las páginas

`GET /api/content` lee `Continguts!A1:B1000`, comprueba los encabezados `clau`
y `valor`, y devuelve exclusivamente las siete claves previstas:
`home_title`, `home_subtitle`, `home_text`, `project_title`, `project_content`,
`products_title` y `products_intro`.

Las siete claves deben tener texto y no estar repetidas. Se conservan los saltos
de línea y se muestra texto plano, sin interpretar HTML. Las páginas comparten
la carga mediante `useSiteContent`, con estado de carga y reintento ante errores.
Un fallo de los textos no impide mostrar el catálogo. No hay caché de servidor.

La edición de estos textos ya está implementada en el panel de administración (fase 9).
La fase 7 solo incorpora lectura y no modifica el documento de Google Sheets.

## Estructura

- `server/api/products.get.ts`: API pública del catálogo.
- `server/api/content.get.ts`: API pública de los siete textos editables.
- `server/utils/content-normalization.ts`: validación de claves y textos.
- `types/content.ts`, `composables/useSiteContent.ts`: modelo y carga compartida de textos.
- `components/ContentStatus.vue`: carga y reintento de los textos.
- `server/utils/google-sheets.ts`: lectura autenticada con la biblioteca oficial de Google.
- `server/utils/product-normalization.ts`: validación, normalización y orden.
- `types/product.ts`: modelo Product.
- `pages/productes.vue`: carga, filtros y estados del catálogo.
- `utils/products.ts`: búsqueda y filtrado local.
- `components/ProductCard.vue`: tarjeta sin dependencia de imágenes.
- `tests/`: pruebas de normalización y filtrado con el ejecutor integrado de Node.
- `assets/css/main.css`: diseño responsive, colores y tipografías del sistema.
- `layouts/default.vue`, `components/SiteHeader.vue`, `components/SiteFooter.vue`: estructura compartida.
- `pages/index.vue`, `pages/el-nostre-projecte.vue`: páginas con textos de `Continguts`.
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

La fase 7 se ha verificado con 22 tests, comprobación TypeScript y compilación.
Las tres páginas se han comprobado en navegador a 320, 390 y 1440 píxeles,
incluidos accesibilidad automática, carga, errores, reintento, saltos de línea
y representación segura del texto. Los siete valores de la API coinciden con
una lectura independiente del Sheet. El catálogo mantiene 13 productos activos.
También se han verificado los errores controlados por configuración ausente y
Sheet inaccesible, sin exponer credenciales.

## Comprobación manual de la fase 7

1. Abre `/`, `/el-nostre-projecte` y `/productes`: sus textos vienen de `Continguts`.
2. Revisa títulos, párrafos y navegación tanto en móvil como en escritorio.
3. Comprueba que `/productes` mantiene la búsqueda y el filtro por categoría.
4. Abre `/api/content`: devuelve únicamente las siete claves de texto.

Las pruebas automáticas no han modificado el Sheet. La fase 9 requiere cambiar el permiso de la cuenta de servicio a Editor.

## Fase 8: acceso de administrador

Web desplegada: https://la-circular.netlify.app

Se han implementado `/admin`, `useAdminAuth`, invitaciones, login/logout y
protección de `/api/admin/*` en el servidor con `@netlify/identity`.
Identity está configurado como Invite only. El propietario ha confirmado el acceso real y autorizado la fase 9.

Consulta la [guía de Netlify e Identity](docs/netlify-identity.md) para la
configuración, despliegue y comprobaciones.

## Fase 9: edición de textos

El panel permite editar y guardar los siete textos, con validación, estados de
carga y error, y aviso de cambios pendientes. La API administrativa verifica
Identity y el origen antes de escribir. Han pasado 27 tests y las pruebas aisladas
del servidor y el navegador.

Consulta la [guía de edición](docs/admin-content.md). Quedan pendientes confirmar
el permiso Editor de la cuenta de servicio y guardar desde la sesión real.
