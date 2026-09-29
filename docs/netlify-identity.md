# Fase 8: Netlify e Identity

Proyecto local: `C:\WORKSPACE\la-circular`.
Web: https://la-circular.netlify.app
Panel: https://app.netlify.com/projects/la-circular
ID: `87cd748a-20b1-4b9a-83ac-b8c097d6ff09`.

## Estado

La aplicación está desplegada. Identity está activado con registro por invitación
y solo email/contraseña. Las tres variables privadas de Google Sheets están
configuradas en Netlify con autorización del propietario.

Fase 8 completada: el propietario ha confirmado que la invitación y el acceso real funcionan, y ha autorizado continuar con la fase 9.

## Implementación

- `@netlify/identity` 2.0.0 es la única API de Identity importada por la aplicación.
- `composables/useAdminAuth.ts` concentra login, logout, invitación y estado de sesión.
- `pages/admin.vue` muestra acceso o el panel inicial. No hay registro público.
- La invitación puede llegar a la portada; el plugin de cliente la lleva a
  `/admin` manteniendo el token en el fragmento, nunca en parámetros del servidor.
- La aceptación establece también la sesión mediante el login oficial: la
  versión 2.0 de acceptInvite no escribe por sí sola la cookie en el navegador.
- `server/middleware/admin-auth.ts` valida cada petición a `/api/admin/*`
  mediante Identity en el runtime de Netlify. No acepta identidades enviadas
  por el frontend. Sin autenticación devuelve 401.
- El servidor exige además que siga activo Invite only. Para métodos de
  escritura comprueba el origen de la petición; la API de edición de textos se ha incorporado en la fase 9.
- `GET /api/admin/session` devuelve solo ID y correo del usuario verificado.
  El frontend usa esta respuesta para mostrar el panel.
- El admin y su API se sirven sin caché compartida. El admin no es indexable.
- El preset `netlify` genera Functions modernas compatibles con Identity.
  No usar el preset `netlify-legacy`.

Los administradores son las personas invitadas al proyecto. No hay roles
adicionales ni herramientas de gestión de usuarios dentro de la web.

## Configuración y primer acceso

1. En **Project configuration → Identity**, habilitar Identity.
2. En **Registration**, elegir **Invite only** y dejar desactivados los proveedores sociales.
3. En la sección de usuarios de Identity, pulsar **Invite users** e introducir
   el correo del administrador. Esta acción envía el correo de invitación.
4. Abrir el enlace recibido y crear una contraseña en `/admin`.
5. Comprobar que aparece «Sessió iniciada» y el correo.
6. Recargar la página: debe conservar la sesión.
7. Abrir `/api/admin/session` en ese mismo navegador: debe devolver ID y correo.
8. Pulsar «Tanca la sessió»: debe volver al formulario de acceso.
9. Volver a abrir `/api/admin/session`: debe responder 401.
10. Entrar otra vez con email y contraseña y comprobar el cierre de sesión.

No enviar contraseñas, tokens ni enlaces de invitación al chat.
La sesión real se verifica en la URL HTTPS de Netlify; `npm run dev` por sí solo
no aloja el servicio de Identity.

## Desplegar

El proyecto está vinculado localmente mediante `.netlify/state.json`, excluido de Git.
No se ha configurado un repositorio ni despliegue continuo.

Detener el servidor de desarrollo antes de compilar y desplegar:

```powershell
cd C:\WORKSPACE\la-circular
npm test
npm run typecheck
npx --yes netlify-cli deploy --prod --context production
```

El comando despliega en el subdominio de Netlify. El dominio `lacircular.cat`
corresponde a la fase 14 y no se ha modificado.

`netlify.toml` establece `npm run build`, directorio público `dist`, Node 22
y `NITRO_PRESET=netlify`. Para desarrollo y compilación local normal se conserva
el preset de Node, que permite `npm run preview`.

Variables privadas necesarias en Netlify:

- `NUXT_GOOGLE_SHEET_ID`
- `NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `NUXT_GOOGLE_PRIVATE_KEY`

No añadir prefijo `NUXT_PUBLIC_` ni copiar valores al repositorio.
El JSON de la cuenta de servicio sigue fuera del proyecto.

## Verificación realizada

- 22 tests existentes, TypeScript y compilación local.
- Pruebas locales de 27 peticiones administrativas sin sesión o con tokens falsos:
  todas reciben 401.
- Navegador con Identity simulado: errores, login, persistencia al recargar,
  logout, invitación, contraseñas diferentes y bloqueo si el registro está abierto.
- Diseño a 320, 390 y 1440 píxeles, accesibilidad automática sin incidencias.
- Netlify real: APIs públicas con siete textos y 13 productos activos; API
  administrativa devuelve 401 sin sesión y con credenciales falsificadas.

El propietario confirmó el funcionamiento real de la fase 8.
La edición de textos se documenta en [Fase 9](admin-content.md). Imágenes: fases 10 y 11.

## Referencias

- [Configurar Identity](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/get-started/)
- API exacta de la versión instalada: `node_modules/@netlify/identity/README.md`.
