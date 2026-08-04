# Joy Events RD — Handoff / Memoria de proyecto

Última actualización: 2026-08-04

## Resumen del proyecto
Sitio web de Joy Events RD (planificación de bodas), migrado de un HTML monolítico a
Vite + React + Tailwind CSS. Desplegado en producción en Vercel:
- URL estable: https://joyevents-rd.vercel.app
- Repo: https://github.com/Max-Prencio/joyevents_rd.git (branch `main`)
- Proyecto Vercel: `maxwwelteam/joyevents-rd` (auto-deploy on push a `main` vía integración GitHub)
- Dominio propio: `joyevents.do` — comprado por el usuario, DNS configurado el 2026-08-04 (ver
  sección "Dominio propio: joyevents.do" más abajo para el detalle completo de la configuración).

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

### 4. Animaciones de scroll (TableSetup / MesaScroll) — ❌ DESCARTADAS, no están en el sitio
Entre el 2026-08-03 y 2026-08-04 se intentaron dos animaciones distintas de "toque personal": una
tarjeta 3D estilo Aceternity UI con `framer-motion` (`TableSetup.jsx`, usaba un componente
`ContainerScroll` en `src/components/ui/`) y, después, un video de montaje de mesa con
scroll-scrubbing usando GSAP ScrollTrigger (`MesaScroll.jsx`, estilo página de producto de Apple:
el video avanza cuadro a cuadro según el scroll). Antes de estas dos también se probaron
ilustraciones SVG a mano y 3 tarjetas con fotos de IA (ambas rechazadas antes de llegar a
implementación completa).
- Ambas versiones finales (`TableSetup`/`ContainerScroll` y `MesaScroll`) se completaron, se
  depuraron a fondo (bug real de codificación de video con un solo keyframe en todo el clip que
  causaba scroll trabado y artefactos visuales al saltar de frame; bug de un scrim CSS que
  técnicamente oscurecía pero se veía como neblina; bug de React StrictMode duplicando el pin de
  ScrollTrigger; bug de tamaño/padding del botón CTA) y llegaron a desplegarse en producción.
- El usuario revisó el resultado en vivo y no le convenció ninguna de las dos ("no me está
  gustando el resultado"), así que pidió eliminarlas por completo — componentes, assets (video,
  imágenes) y las dependencias `gsap`/`framer-motion` (bundle bajó de ~472KB a ~220KB).
- El sitio quedó: Hero → Carousel → About → Services → Portfolio → Founder → Team → Testimonials →
  Calendar → Contact → Footer, sin secciones intermedias de "toque personal".
- Todo el código, commits y assets siguen en el historial de git (commits del 2026-08-03/04) por si
  se quiere retomar el concepto más adelante con un enfoque distinto. **Aprendizaje**: a este
  usuario le convence ver/scrollear una versión funcionando en el navegador antes de dar por buena
  una idea conceptual — para futuros pedidos de "algo de flair visual", conviene mostrar una
  preview mínima temprano en vez de invertir varias rondas de arreglo de bugs sobre una versión ya
  completamente construida.

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

## Dominio propio: joyevents.do — ✅ DNS CONFIGURADO (pendiente propagar)
Configurado el 2026-08-04. El dominio ya estaba comprado por el usuario y ya estaba agregado como
dominio del proyecto en Vercel (`maxwwelteam/joyevents-rd` → Settings → Domains → `joyevents.do` y
`www.joyevents.do`, ambos marcados "Production") — solo faltaban los registros DNS del lado del
registrador para que la validación pasara.

**Registrador**: NIC.do (Network Information Center República Dominicana — el registrador oficial
de dominios `.do`). Se entra en https://nic.do → iniciar sesión → gestionar `joyevents.do` → DNS
Records. El panel real de gestión de DNS corre sobre un backend de `myorderbox.com` con URLs que
incluyen un zone ID y token de sesión (no son estables/reproducibles) — siempre hay que entrar vía
nic.do, no hay un link directo que se pueda guardar.

**Registros DNS creados** (pestañas "A Records" y "CNAME Records" del panel):

| Tipo  | Host                              | Valor                                  | TTL     |
|-------|------------------------------------|-----------------------------------------|---------|
| A     | `@` (raíz — dejar Host Name vacío) | `216.198.79.1`                          | 28800s  |
| CNAME | `www`                               | `11bde4da462a6529.vercel-dns-017.com`   | 28800s  |

Estos son los valores que Vercel mostraba en ese momento en cada dominio → "View DNS
configuration". **Importante para el futuro**: la propia UI de Vercel dice "We're expanding our IP
range" — estos valores pueden cambiar con el tiempo. Si hay que reconfigurar o migrar, **siempre
volver a sacar los valores vigentes** desde `Vercel → maxwwelteam/joyevents-rd → Settings →
Domains → [dominio] → View DNS configuration`, no asumir que los de esta tabla siguen siendo
correctos indefinidamente. Como respaldo, Vercel también acepta los valores "legacy" (siguen
funcionando aunque no sean los recomendados): A `76.76.21.21` y CNAME `cname.vercel-dns.com`.

**Estado al momento de escribir esto**: los registros se crearon exitosamente en NIC.do (record id
`166969932` para el A, `166969933` para el CNAME, ambos "Active" en el panel), pero Vercel todavía
mostraba "Invalid Configuration" en ambos dominios — es normal, la propagación DNS puede tardar de
minutos a unas horas. Una vez propague, Vercel valida solo y emite el certificado SSL
automáticamente, sin acción manual adicional. Para chequear manualmente si ya propagó: `dig +short
joyevents.do A` y `dig +short www.joyevents.do CNAME` desde terminal, o refrescar la página de
Domains en Vercel (botón "Refresh" junto a cada dominio).

**Si en el futuro se migra el dominio a otra compañía/registrador**:
1. En el nuevo registrador, recrear los mismos dos registros (A en `@` y CNAME en `www`) apuntando
   a los valores vigentes que muestre Vercel en ese momento (ver nota arriba, no usar los de esta
   tabla sin confirmar primero).
2. En esta configuración **no se tocaron los nameservers** de `joyevents.do` — se dejaron los
   registros DNS apuntando directo a Vercel sin cambiar de nameserver ni de registrador. Si la
   migración es solo "mover a otro registrador" (no solo cambiar dónde apunta el DNS), es un
   trámite aparte vía código de autorización/EPP, distinto a simplemente recrear estos registros.
3. Si en algún momento se deja de usar Vercel como hosting, hay que: (a) actualizar/borrar estos
   registros para que apunten al nuevo hosting, y (b) quitar el dominio de `Vercel → Settings →
   Domains` en ese proyecto para liberar el dominio y su certificado SSL ahí.

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
2. Confirmar que `joyevents.do`/`www.joyevents.do` terminaron de propagar y que Vercel los marcó
   "Valid Configuration" (ver sección "Dominio propio: joyevents.do" para cómo chequear).
3. Actualizar `src/holidays.js` (`DR_HOLIDAYS`) con el calendario oficial de feriados 2027 del
   Ministerio de Trabajo cuando se publique (normalmente a fines de 2026).
