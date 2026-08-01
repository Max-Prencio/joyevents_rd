# Joy Events RD — Handoff / Memoria de proyecto

Última actualización: 2026-08-01

## Resumen del proyecto
Sitio web de Joy Events RD (planificación de bodas), migrado de un HTML monolítico a
Vite + React + Tailwind CSS. Desplegado en producción en Vercel:
- URL estable: https://joyevents-rd.vercel.app
- Repo: https://github.com/Max-Prencio/joyevents_rd.git (branch `main`)
- Proyecto Vercel: `maxwwelteam/joyevents-rd` (auto-deploy on push a `main` vía integración GitHub)
- Dominio deseado a futuro: `joyevents.do` — el usuario no tiene el dinero todavía, deferido, no urgente.

## Contacto del negocio
- Teléfono/WhatsApp oficial: **+1 (809) 360-8567**
  - `src/config.js`: `WHATSAPP_NUMBER = '18093608567'`, `WHATSAPP_DISPLAY = '+1 (809) 360-8567'`
  - `api/_lib/constants.js`: `CONTACT_PHONE = '+1 (809) 360-8567'`
- Correo del negocio: joyeventsrd@gmail.com
- Instagram real: https://www.instagram.com/joyeventsrd/ (ya enlazado en el ícono de Instagram del footer, `src/components/Footer.jsx`)

## Features implementadas

### 1. Calendario de citas con disponibilidad real (Google Calendar)
- `src/components/Calendar.jsx`: al seleccionar fecha, hace fetch a `/api/availability?date=YYYY-MM-DD`
  y marca/deshabilita horarios ya ocupados según el Google Calendar de joyeventsrd@gmail.com.
- `src/slots.js`: horarios fijos (9, 10, 11am, 2, 3, 4pm).
- `api/availability.js`: función serverless de Vercel; usa `googleapis` (Free/Busy API) con
  credenciales de cuenta de servicio de Google Cloud. Zona horaria fija `America/Santo_Domingo` (-04:00, sin DST).
  - Si faltan credenciales (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`),
    degrada con gracia: devuelve `configured: false` y todos los horarios como disponibles (no rompe el sitio).

### 2. Flujo de "Solicitar Llamada" por correo (sin base de datos)
- Al enviar el formulario del calendario, `Calendar.jsx` hace POST a `/api/request-call.js`.
- `api/request-call.js` genera un token firmado (HMAC-SHA256, `api/_lib/token.js`, secreto
  `REQUEST_TOKEN_SECRET`, expira en 14 días) y envía un correo a joyeventsrd@gmail.com (vía
  `api/_lib/mailer.js`, Nodemailer + Gmail SMTP con App Password) con botones "Aceptar" / "Rechazar".
- Esos botones apuntan a `api/respond-call.js` (GET), que verifica el token, envía un correo de
  vuelta al solicitante confirmando aprobación o rechazo, y muestra una página HTML de confirmación.
  - Mensaje de aprobación incluye: "nos pondremos en contacto contigo, para más información
    contáctanos al +1 (809) 360-8567".
- Si faltan credenciales de Gmail (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) o `REQUEST_TOKEN_SECRET`,
  ambos endpoints degradan con gracia (error controlado 400/500, sin crash) y el frontend muestra
  fallback a WhatsApp (`wa.me/18093608567`).
- Limitación aceptada: no hay persistencia de "ya respondido", así que hacer clic dos veces en el
  mismo link de aceptar/rechazar reenvía un correo duplicado. No es prioritario arreglarlo.

### 3. Galería "Momentos que hablan por sí solos" (Portfolio.jsx)
Curada a mano a partir de ~600 fotos raw (proceso: contact sheets con Python/Pillow local, solo
para revisión visual — NO es dependencia del proyecto npm).
- **Getting Ready** (10 fotos): `public/images/wedding/getting-ready/`
- **Ceremony** (10 fotos): `public/images/wedding/ceremony/`
- **Night/Recepción** (8 fotos): `public/images/wedding/night/`
- **Pre-boda** (10 fotos): `public/images/wedding/pre-boda/` — reemplazadas 3 URLs externas de
  Pixieset por fotos reales de la sesión de Arihanna & Raymer.
- **Post Boda**: ⚠️ **PENDIENTE** — sigue mostrando fotos externas de stock (Pixieset). No existe
  material local en ningún lado del proyecto para esta categoría. Preguntado al usuario si tiene
  el material en otro lugar (USB, carpeta externa, link) — sin respuesta aún.
- **Propuesta**: sin tocar, sigue con URLs externas de Pixieset (no fue parte del alcance pedido).
- Quedan 33 fotos de pre-boda sin usar en
  `images/arihannayraymerpreboda-photo-download-1of1/Highlights/` por si se pide más variedad ahí.

## Configuración pendiente en Vercel (env vars)
El sitio está en producción funcionando en "modo degradado" (WhatsApp fallback) porque aún faltan
estas variables de entorno en el dashboard de Vercel
(`maxwwelteam/joyevents-rd` → Settings → Environment Variables):

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_CALENDAR_ID` (default sugerido: `joyeventsrd@gmail.com`)
- `GMAIL_USER` (`joyeventsrd@gmail.com`)
- `GMAIL_APP_PASSWORD` (App Password de Gmail, requiere verificación en 2 pasos activada)
- `REQUEST_TOKEN_SECRET` (aleatorio, ej. `openssl rand -hex 32`)

Ver `.env.example` en la raíz del proyecto para más detalle de cada una.

Pasos para Google Calendar: crear proyecto en Google Cloud Console → habilitar Calendar API →
crear cuenta de servicio → generar clave JSON → compartir el calendario de joyeventsrd@gmail.com
con el `client_email` de la cuenta de servicio.

## Decisiones de arquitectura clave (el "por qué")
- **Vercel sobre Netlify**: usuario pidió explícitamente "rápido y gratis"; Vercel + GitHub
  integration cumple ambos sin fricción.
- **Gmail SMTP (Nodemailer) sobre Resend/otros proveedores transaccionales**: Resend y similares
  requieren dominio propio verificado, que el usuario no tiene ni puede costear ahora. Gmail SMTP
  funciona gratis desde joyeventsrd@gmail.com sin dominio.
- **Tokens firmados stateless en vez de base de datos**: evita añadir infraestructura de DB solo
  para un flujo de aceptar/rechazar llamadas.
- **Despliegue inmediato sin credenciales reales**: instrucción explícita del usuario — lanzar ya
  y añadir credenciales después, manteniendo el fallback de WhatsApp funcionando mientras tanto.

## Reglas de trabajo con este usuario
- Nunca instalar librerías nuevas en el proyecto npm sin que se pida explícitamente (herramientas
  locales de análisis para mi propio flujo de trabajo, como Python/Pillow en un venv aislado, sí
  están permitidas siempre que no toquen el repo/proyecto).
- Siempre hacer commit local primero, y pedir confirmación explícita antes de hacer push a
  GitHub/producción — son acciones visibles y de estado compartido.
- No tocar la estructura/layout de la sección "weddings" salvo que se pida.
- El usuario no puede hacer login OAuth/CLI por mí (ej. `vercel login`) — para acciones que
  requieren su sesión, usar Chrome (ya autenticado) o pedirle que lo haga él.

## Tareas pendientes / próximos pasos
1. Confirmar con el usuario si tiene fotos de **Post Boda** en algún otro lugar (USB, carpeta,
   link externo) para completar esa categoría de la galería.
2. Cuando el usuario provea las credenciales de Google Calendar + Gmail App Password, añadirlas
   como Environment Variables en Vercel para activar disponibilidad real y el flujo de
   aprobación de llamadas por correo en producción.
3. Cuando el usuario tenga presupuesto, conectar el dominio `joyevents.do` en Vercel
   (Project → Domains).
