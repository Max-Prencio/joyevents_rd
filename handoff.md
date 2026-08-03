# Joy Events RD — Handoff / Memoria de proyecto

Última actualización: 2026-08-03

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

### 1. Calendario de citas con disponibilidad real (Google Calendar) — ✅ EN VIVO
- `src/components/Calendar.jsx`: al seleccionar fecha, hace fetch a `/api/availability?date=YYYY-MM-DD`
  y marca/deshabilita horarios ya ocupados según el Google Calendar de joyeventsrd@gmail.com.
  También deshabilita visualmente fines de semana y feriados en el propio selector de días.
- `src/slots.js`: horarios fijos (9, 10, 11am, 2, 3, 4pm).
- `api/availability.js` delega toda la lógica a `api/_lib/scheduling.js` (ver sección 4). Zona
  horaria fija `America/Santo_Domingo` (-04:00, sin DST).
  - Si faltan credenciales (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`),
    degrada con gracia: devuelve `configured: false` y todos los horarios como disponibles (no rompe el sitio).
- **Credenciales ya configuradas en Vercel y funcionando en producción** (cuenta de servicio
  `joy-events-calendar@joy-events-rd.iam.gserviceaccount.com`, proyecto GCP `joy-events-rd`,
  compartida con el calendario "JOY EVENTS RD" con permiso "Make changes and see all event details").
  - **Bug corregido**: `googleapis ^173` eliminó el constructor posicional legacy de `google.auth.JWT`;
    había que pasar `new google.auth.JWT({ email, key, scopes })` (objeto), no argumentos posicionales.
    El código viejo producía peticiones sin autenticar (`403 unregistered callers`) — ver
    `api/_lib/googleAuth.js`.

### 2. Flujo de "Solicitar Llamada" por correo (sin base de datos) — ✅ EN VIVO
- Al enviar el formulario del calendario, `Calendar.jsx` hace POST a `/api/request-call.js`.
- `api/request-call.js` valida disponibilidad (ver sección 4), genera un token firmado
  (HMAC-SHA256, `api/_lib/token.js`, secreto `REQUEST_TOKEN_SECRET`, expira en 14 días) y envía un
  correo a joyeventsrd@gmail.com (vía `api/_lib/mailer.js`, Nodemailer + Gmail SMTP con App
  Password) con botones "Aceptar" / "Rechazar".
- Esos botones apuntan a `api/respond-call.js` (GET), que verifica el token, envía un correo de
  vuelta al solicitante confirmando aprobación o rechazo, confirma o libera el "hold" del
  calendario (ver sección 4), y muestra una página HTML de confirmación.
  - Mensaje de aprobación incluye: "nos pondremos en contacto contigo, para más información
    contáctanos al +1 (809) 360-8567".
- Si faltan credenciales de Gmail (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) o `REQUEST_TOKEN_SECRET`,
  ambos endpoints degradan con gracia (error controlado 400/500, sin crash) y el frontend muestra
  fallback a WhatsApp (`wa.me/18093608567`).
- **Credenciales ya configuradas en Vercel y funcionando en producción.**
- Limitación aceptada: no hay persistencia de "ya respondido", así que hacer clic dos veces en el
  mismo link de aceptar/rechazar reenvía un correo duplicado (o intenta liberar/confirmar un evento
  ya modificado — no rompe nada, solo es redundante). No es prioritario arreglarlo.

### 3. Reglas de agenda: sin choques, tope diario, sin fines de semana/feriados — ✅ EN VIVO
Implementado a pedido explícito del usuario actuando como product owner (2026-08-03). Toda la
lógica vive en `api/_lib/scheduling.js`, usado por `availability.js`, `request-call.js` y
`respond-call.js`:
- **Sin doble-reserva**: al *solicitar* una llamada (no solo al aceptarla) se crea de inmediato un
  evento "hold" en el calendario con `extendedProperties.private.joyStatus = 'pending'`. Esto
  bloquea ese horario para cualquier otra persona desde el momento de la solicitud, no solo tras
  la aprobación. Si se rechaza, el hold se borra (`releaseSlot`); si se acepta, se confirma
  (`confirmSlot`, marca `joyStatus = 'accepted'`) en el mismo evento.
- **Máximo 3 llamadas aceptadas por día**: si un día ya tiene 3 eventos con
  `joyStatus: 'accepted'`, el día completo se cierra a nuevas solicitudes aunque queden horarios
  libres (`reason: 'max'`).
- **Sin fines de semana**: sábado y domingo bloqueados por defecto, tanto en la UI (días
  deshabilitados en el calendario) como en el backend (`isWeekend()` en `src/holidays.js`,
  válida como fuente de verdad en `request-call.js`).
- **Sin feriados no laborables de RD**: lista estática en `src/holidays.js` (`DR_HOLIDAYS`,
  compartida por frontend y backend) con los 12 feriados oficiales 2026 según el Ministerio de
  Trabajo (Ley 139-97). **Ojo**: el calendario público de Google (`es.do#holiday@group.v.calendar.google.com`)
  incluye fechas que NO son feriados no laborables (Día de la Madre, Día del Padre, Noche Buena,
  Noche Vieja) — por eso se usa una lista propia curada, no ese calendario directamente.
  **Hay que actualizar `DR_HOLIDAYS` cada año** cuando el Ministerio de Trabajo publique el
  calendario oficial siguiente.
- Validado end-to-end contra producción real (vía `curl` directo a `/api/request-call`): doble
  solicitud del mismo horario → 409; fin de semana → 409; feriado laborable (27 feb, viernes) →
  409; 4ta solicitud con 3 ya aceptadas ese día → 409. Todo limpio después (sin eventos de prueba
  en el calendario real).
- **Bug corregido durante esta implementación**: `request-call.js` referenciaba una variable
  `hour` inexistente (era `hora`) al crear el hold — causaba 500 en toda solicitud con horario.
  También se corrigió que la liberación del hold en el path de error no se esperaba (`await`),
  lo que podía dejar un bloqueo huérfano si la función serverless terminaba antes de completarse.

### 4. Animación "El Montaje Perfecto" (TableSetup.jsx) — ⚠️ LOCAL, SIN COMMIT
Sección agregada entre Services y Portfolio con una animación de scroll tipo "Container Scroll"
(patrón conocido de Aceternity UI): una tarjeta con foto de mesa de boda que empieza inclinada en
3D y se aplana/escala a medida que el usuario hace scroll, dentro de un marco tipo laptop.
- `src/components/ui/container-scroll-animation.jsx`: componente adaptado a JS puro (sin
  TypeScript, sin `"use client"`) del componente que el usuario pegó directamente. Usa
  `framer-motion` (`useScroll` + `useTransform`) para animar `rotateX`, `scale` y `translateY` en
  función del scroll.
- `src/components/TableSetup.jsx`: usa `ContainerScroll` con copy de marca ("Nuestro Sello" / "El
  Montaje Perfecto") y la foto `public/images/table-setup/classic.webp` (generada con Google Flow/
  ImageFX, gratis, y convertida a WebP con Pillow local).
- `vite.config.js`: se agregó alias `@` → `./src` (convención estándar de este tipo de componente).
- Se instaló `framer-motion` (pedido explícito del usuario). También está instalado `lenis`
  (smooth-scroll, pedido explícito) — solo se usa para suavizar el scroll con la rueda del mouse;
  el intento de hacerlo controlar también los clics de anclas (`<a href="#...">`) tuvo bugs no
  resueltos (`scrollTo()` saltaba al final de la página o no se movía) y se revirtió — los enlaces
  de navegación usan el comportamiento nativo del navegador, no Lenis.
- **Historial de iteraciones descartadas** (por si se retoma el tema): primero se probó con
  ilustraciones SVG hechas a mano (rechazado, se quería fotorrealismo); luego 3 tarjetas separadas
  con fotos generadas por IA e inclinación 3D + scroll parallax (rechazado, se quería continuidad
  de scroll tipo wow-showroom.com/eseagency.ch/bagigia.com, no tarjetas discretas); luego una sola
  imagen a pantalla completa con pin/sticky + zoom por scroll hecho a mano en CSS/JS (funcionaba,
  pero se abandonó a medio commit cuando el usuario pidió instalar Lenis y luego dijo "detente" para
  construir él mismo la animación parallax). La versión actual (`ContainerScroll`) es la que el
  usuario diseñó/encontró y pidió integrar directamente.
- Quedan sin usar `public/images/table-setup/modern.webp` y `romantic.webp` (de la iteración de 3
  tarjetas descartada) — pendiente decidir si se borran antes de commitear.
- Probado en local con `npm run build` y scroll programático en navegador: la animación funciona
  correctamente extremo a extremo. **Todavía no se ha hecho commit ni push** — sigue como cambios
  locales sin confirmar.

### 5. Galería "Momentos que hablan por sí solos" (Portfolio.jsx)
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

## Configuración en Vercel (env vars) — ✅ TODAS CONFIGURADAS
El sitio corre en producción con credenciales reales (ya no está en modo degradado). Variables
activas en `maxwwelteam/joyevents-rd` → Settings → Environment Variables:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `joy-events-calendar@joy-events-rd.iam.gserviceaccount.com`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_CALENDAR_ID` = `joyeventsrd@gmail.com`
- `GMAIL_USER` = `joyeventsrd@gmail.com`
- `GMAIL_APP_PASSWORD`
- `REQUEST_TOKEN_SECRET`

Ver `.env.example` en la raíz del proyecto para más detalle de cada una.

Cuenta de servicio de Google Cloud: proyecto `joy-events-rd`, cuenta de servicio
`joy-events-calendar`, compartida en Google Calendar (calendario "JOY EVENTS RD") con permiso
"Make changes and see all event details" (necesario para leer Y crear eventos, no solo
"ver disponibilidad").

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
2. Cuando el usuario tenga presupuesto, conectar el dominio `joyevents.do` en Vercel
   (Project → Domains).
3. Actualizar `src/holidays.js` (`DR_HOLIDAYS`) con el calendario oficial de feriados 2027 del
   Ministerio de Trabajo cuando se publique (normalmente a fines de 2026).
4. Decidir sobre `modern.webp`/`romantic.webp` sin usar y hacer commit de la animación
   "El Montaje Perfecto" (sección 4) — pedir confirmación antes de push, como siempre.
