# Joy Events RD — Handoff / Memoria de proyecto

Última actualización: 2026-08-05

## Resumen del proyecto
Sitio web de Joy Events RD (planificación de bodas), migrado de un HTML monolítico a
Vite + React + Tailwind CSS. Desplegado en producción en Vercel:
- URL estable: https://joyevents-rd.vercel.app
- Dominio propio: **https://joyevents.do** (y `www.`) — ✅ en vivo desde el 2026-08-05, ver sección
  "Dominio propio: joyevents.do" más abajo para el detalle completo de la configuración.
- Repo: https://github.com/Max-Prencio/joyevents_rd.git (branch `main`)
- Proyecto Vercel: `maxwwelteam/joyevents-rd` (auto-deploy on push a `main` vía integración GitHub)

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

## Dominio propio: joyevents.do — ✅ RESUELTO, EN VIVO (2026-08-05)
Iniciado el 2026-08-04, resuelto el 2026-08-05. `https://joyevents.do` y `https://www.joyevents.do`
cargan el sitio con SSL válido (verificado con `curl -sI`, código 200, headers de seguridad
presentes) y Vercel dejó de mostrar "Invalid Configuration" en Settings → Domains. El "lame
delegation" que bloqueó todo durante ~24-36h se resolvió del lado de NIC.do — el usuario hizo un
ajuste adicional en el panel que no estaba documentado en esta sesión (dijo "te faltó una
configuración, por eso no subía"); si se vuelve a tocar este dominio en el futuro, preguntarle a él
qué paso exacto hizo falta, porque no quedó capturado acá. Se dejó toda la bitácora del diagnóstico
abajo por si sirve de referencia ante un problema similar en otro dominio `.do`.

El dominio ya estaba comprado por el usuario y ya estaba agregado como dominio del proyecto en
Vercel (`maxwwelteam/joyevents-rd` → Settings → Domains → `joyevents.do` y `www.joyevents.do`,
ambos marcados "Production").

**Registrador**: NIC.do (Network Information Center República Dominicana — el registrador oficial
de dominios `.do`). Tiene DOS paneles distintos, fácil confundirlos:
- **`cp.midominio.do`** (Client Panel / "Manage Domain"): acá vive la gestión real del dominio —
  contacto, **Nombre de Servidores (nameservers)**, transferencia, protección. Se entra desde
  nic.do → iniciar sesión → "Mi Cuenta" o similar.
- Un backend separado en `myorderbox.com` (subdominio con zone ID, ej.
  `15075982.dns.bll.myorderbox.com`) que expone una sección "DNS Records" (A/AAAA/CNAME/MX/TXT/etc)
  — pero **esto solo importa si el dominio usa DNS externo**. Si el dominio está delegado a
  nameservers de Vercel (que es el caso acá, ver abajo), esta sección queda **sin efecto**: se
  puede editar todo lo que se quiera ahí que no cambia nada en cómo resuelve el dominio realmente.

**Lo que se intentó primero (2026-08-04, sesión temprana) — quedó obsoleto**: se asumió que el
dominio usaba "DNS externo" y se crearon manualmente, en el panel de `myorderbox.com` → DNS
Records, un registro A (`@` → `216.198.79.1`) y un CNAME (`www` → `11bde4da462a6529.vercel-
dns-017.com`, ambos son los valores que en ese momento mostraba Vercel en "View DNS
configuration"). **Estos registros siguen ahí pero no hacen nada** — ver el hallazgo siguiente.

**Hallazgo real (misma sesión, más tarde)**: al revisar `cp.midominio.do` → "Nombre de Servidores"
se descubrió que el dominio en realidad está configurado en modo **"Vercel Nameservers"** (nameserver
delegation completa), no en modo DNS externo:
- Nameserver 1: `ns1.vercel-dns.com`
- Nameserver 2: `ns2.vercel-dns.com`

Estos valores **ya estaban guardados correctamente** — al intentar "actualizar" el sistema devolvió
`"Same value for new and old NameServers"`, confirmando que no había nada pendiente de guardar de
ese lado. En este modo, Vercel es quien maneja TODO el DNS del dominio automáticamente (no hace
falta ni se debe tocar A/CNAME/etc a mano en ningún panel — por eso los registros de la sección
anterior no sirven de nada, están en una zona que ya no es la autoridad real del dominio).

**El problema real**: a pesar de que `cp.midominio.do` tiene guardado `ns1/ns2.vercel-dns.com`, al
consultar la delegación pública real del dominio (`dns.google/resolve?name=joyevents.do&type=NS`,
también confirmado con `dig` — aunque `dig` directo no funcionó bien desde este entorno de trabajo,
sí funcionó vía la API HTTP de Google DNS) el registro `.do` todavía devuelve una delegación a dos
IPs distintas y viejas: **`198.51.44.13`** y **`198.51.45.13`**, y ambas devuelven **`REFUSED`** a
cualquier consulta ("lame delegation"). O sea: hay un desfase entre lo que el panel del registrador
tiene guardado (`ns1/ns2.vercel-dns.com`, correcto) y lo que el registro `.do` publica realmente
(las IPs viejas, rotas). Esto **no se arregla desde ningún botón de los paneles que revisamos** —
es una sincronización pendiente entre `midominio.do`/NIC.do y el registro `.do`, probablemente más
lenta por ser un ccTLD dominicano (a diferencia de la propagación normal de registros DNS, que
tarda minutos/horas, un cambio de nameservers a nivel de registro puede tardar hasta 24-48h). El
dominio muestra fecha de registro/renovación "August 4, 2026 – August 4, 2027", coincidiendo con el
inicio de esta configuración, lo que es consistente con esa hipótesis.

**Cómo volver a chequear** (sin necesitar login, vía API HTTP, útil porque `dig`/`nslookup` directo
no fueron confiables en el entorno de trabajo de Claude): abrir en el navegador o pedirle a Claude
que haga fetch a:
```
https://dns.google/resolve?name=joyevents.do&type=NS
```
Si devuelve `"Status":0` con un `"Answer"` listando `ns1.vercel-dns.com`/`ns2.vercel-dns.com` (en
vez de `"Status":2"` con el comentario de "lame delegation"), ya sincronizó — ahí Vercel debería
marcar el dominio como "Valid Configuration" solo, sin acción manual adicional (emite SSL automático).

**Si en 48h desde el 2026-08-04 sigue igual**: contactar soporte de NIC.do (809-535-0111 /
809-580-1962 ext. 2052-2055, o info@nic.do) y reportar textualmente: *"joyevents.do muestra lame
delegation — el registro .do devuelve 198.51.44.13 y 198.51.45.13 (REFUSED) en vez de los
nameservers que tengo guardados en el panel (ns1.vercel-dns.com / ns2.vercel-dns.com)"*.

**Nota para el futuro / si se migra**: como el dominio usa Vercel Nameservers (no DNS externo), una
migración de hosting (dejar de usar Vercel) o de registrador son dos cosas independientes:
- Dejar de usar Vercel como hosting: cambiar los nameservers en `cp.midominio.do` a los del nuevo
  proveedor (o volver a DNS externo con A/CNAME manuales apuntando al nuevo host), y quitar el
  dominio de `Vercel → Settings → Domains`.
- Migrar de registrador (de NIC.do a otro): trámite de transferencia vía código de autorización/EPP,
  no relacionado a esto. Los nameservers (`ns1/ns2.vercel-dns.com`) normalmente se mantienen igual
  después de una transferencia de registrador, ya que la delegación de nameservers y el registrador
  del dominio son conceptos distintos.
- Los registros A/CNAME creados en el panel `myorderbox.com` (DNS Records) el 2026-08-04 pueden
  ignorarse/quedan huérfanos mientras el dominio siga en modo Vercel Nameservers — no hace falta
  borrarlos activamente, simplemente no tienen efecto.

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
2. Actualizar `src/holidays.js` (`DR_HOLIDAYS`) con el calendario oficial de feriados 2027 del
   Ministerio de Trabajo cuando se publique (normalmente a fines de 2026).
3. Rate limiting actual en `/api/request-call` es en memoria (best-effort, ver
   `api/_lib/rateLimit.js`) — si el tráfico crece o se detecta abuso real, considerar migrar a algo
   persistente (ej. Upstash Redis vía integración de Vercel) en vez del limitador en memoria actual.
