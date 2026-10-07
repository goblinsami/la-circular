# Fase 10: configuración de Cloudinary

Estado: conexión local verificada; secrets configurados en Netlify en contexto
production con scopes por defecto; flujo desplegado. Pendiente probar el ciclo de
imágenes desde una sesión admin autenticada.

## Credenciales

1. Crear una cuenta o entrar en https://console.cloudinary.com/.
2. Seleccionar el entorno de producto que se usará para La Circular.
3. En Settings → API Keys, localizar Cloud name, API key y API secret.
4. Completar estas variables en el archivo local `C:\WORKSPACE\la-circular\.env`:

```dotenv
NUXT_CLOUDINARY_CLOUD_NAME=
NUXT_CLOUDINARY_API_KEY=
NUXT_CLOUDINARY_API_SECRET=
```

No sustituir las variables existentes de Google Sheets. No pegar el API secret en
el chat ni guardarlo en Git. `.env` está excluido de Git. `.env.example` solo
contiene los nombres vacíos.

## Verificar

```powershell
cd C:\WORKSPACE\la-circular
npm run check:cloudinary
```

El comando utiliza el SDK oficial `cloudinary`, con las opciones de
`server/utils/cloudinary.ts`, y llama a `api.ping`. Comprueba las credenciales
sin subir, modificar ni borrar imágenes. No imprime los valores ni los errores
internos del proveedor.

Las tres variables forman parte del runtimeConfig privado de Nuxt. No se añade
ninguna variable a runtimeConfig.public ni ninguna ruta pública de diagnóstico.
La interfaz para gestionar imágenes está dentro del panel autenticado `/admin`.

## Netlify

El plan actual del proyecto (`nf_team_dev`) no permite scopes granulares. Con
autorización del propietario, las variables se configuraron como secrets con
scopes por defecto (`builds`, `functions` y `runtime`) y contexto solo
`production`. Por ello el proceso de build de producción también puede acceder
a estos secrets. La conexión local se verificó con `api.ping`.

El código del flujo está desplegado en `https://la-circular.netlify.app`. Los
errores de subida incluyen un `traceId`; los logs registran la etapa y códigos
de error seguros, sin credenciales, URLs ni datos de imagen. Las operaciones de subida,
sustitución y eliminación se ofrecen en `/admin`, y actualizan la columna
`imatge` de la fila del producto en Google Sheets. El panel acepta JPG, PNG y
WebP de hasta 5 MB, por debajo del límite de petición de Netlify Functions;
las credenciales siguen siendo privadas del servidor.
La fase 11 queda pendiente de configurar el scope y probar el ciclo completo
con una imagen real desde una sesión admin autenticada.

## Pendiente para la revisión final

La instalación ha señalado avisos de npm audit en dependencias existentes de Nuxt
y sus herramientas. Cloudinary no figura entre los paquetes afectados.
Revisar esos avisos en la fase 12 antes del despliegue definitivo, sin ejecutar
actualizaciones masivas durante esta fase.

## Referencia

[Configuración oficial del SDK Node.js](https://cloudinary.com/documentation/node_integration#configuration)
