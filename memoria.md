# Memoria de la sesión — Joy Events RD

Resumen de todo lo hablado y hecho en esta sesión de trabajo (2026-08-03 a 2026-08-06). Es un
registro narrativo/cronológico, distinto de `handoff.md` (que es el estado actual del proyecto) —
acá queda el "cómo llegamos hasta acá", útil para entender decisiones y callejones sin salida.

## 1. Animaciones de scroll — construidas, depuradas a fondo, y finalmente eliminadas

El usuario pidió "un toque personal" para la sección de montaje de mesas. Se pasó por varias
iteraciones:

1. Ilustraciones SVG hechas a mano — rechazado, se quería fotorrealismo.
2. 3 tarjetas con fotos generadas por IA + inclinación 3D — rechazado, se quería continuidad de
   scroll (referencias: wow-showroom.com, eseagency.ch, bagigia.com), no tarjetas discretas.
3. **`TableSetup.jsx`**: tarjeta 3D estilo Aceternity UI usando `framer-motion`
   (`ContainerScroll` en `src/components/ui/`) — se completó e integró.
4. **`MesaScroll.jsx`**: video de montaje de mesa con scroll-scrubbing vía GSAP ScrollTrigger,
   estilo página de producto de Apple (el video avanza cuadro a cuadro con el scroll). Se pidió
   además quitar la marca de agua de Gemini del video nuevo (`mesah.mp4`) usando `ffmpeg` con el
   filtro `delogo`, instalado vía Homebrew para esta tarea.

Durante la construcción de `MesaScroll` se encontraron y corrigieron varios bugs reales:
- **Video con un solo keyframe en todo el clip**: causaba que cada salto de scroll tuviera que
  decodificar la cadena completa desde el frame 0, produciendo scroll trabado y artefactos
  visuales (desgarros/glitches) al saltar a frames intermedios. Se corrigió re-codificando con
  `-g 1` (keyframe en cada frame).
- **Scrim CSS que se veía como neblina**: un overlay radial negro detrás del texto, pensado para
  legibilidad, en la práctica reducía el contraste del video y se percibía como niebla/mala
  calidad. Se quitó, reemplazado por `text-shadow` multi-capa.
- **React StrictMode duplicando el pin de ScrollTrigger**: el double-invoke de efectos en
  desarrollo dejaba un listener de `loadedmetadata` huérfano, creando dos ScrollTrigger pines
  apilados sobre la misma sección (altura de spacer incorrecta, video empujado fuera de pantalla).
- **Botón CTA con tamaño roto**: una clase de posicionamiento compartida le forzaba
  `width:90%; max-width:720px; padding:0` al mismo botón, convirtiéndolo en una barra gigante sin
  padding vertical en vez de un botón normal.

Ambas animaciones (`TableSetup` y `MesaScroll`) llegaron a desplegarse en producción, totalmente
funcionales y sin bugs conocidos. El usuario las revisó en vivo y **no le convenció el resultado
de ninguna de las dos** ("no me está gustando el resultado") — se eliminaron por completo
(componentes, assets de video/imagen, y las dependencias `gsap`/`framer-motion`, bajando el
bundle de ~472KB a ~220KB). El sitio quedó: Hero → Carousel → About → Services → Portfolio →
Founder → Team → Testimonials → Calendar → Contact → Footer. Todo el código sigue en el
historial de git por si se quiere retomar el concepto más adelante con otro enfoque.

**Aprendizaje clave**: a este usuario le convence ver/scrollear una versión funcionando en vivo
antes de dar por buena una idea conceptual — la calidad de ejecución no compensa que el concepto
en sí no le termine de gustar. Para futuros pedidos similares, conviene mostrar una preview
mínima temprano en vez de invertir varias rondas de arreglo de bugs sobre una versión ya
completamente construida.

## 2. Auditoría de seguridad

El usuario pidió una auditoría de seguridad completa: sin API keys hardcodeadas en el frontend,
todo en variables de entorno, y aplicar buenas prácticas al sitio y al dominio. (Se probó primero
la skill `/the-architect`, resultó ser para diseñar arquitecturas de proyectos nuevos desde cero,
no para auditar código existente — no aplicaba, se hizo la auditoría directamente.)

**Hallazgos y verificación:**
- Sin secretos hardcodeados en `src/` ni en el bundle de producción real (`dist/assets/*.js`,
  grepeado directamente). Los únicos valores en `src/config.js` son públicos por diseño (ID de
  formulario de Formspree, número de WhatsApp).
- Todos los secretos reales (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
  `GMAIL_APP_PASSWORD`, `REQUEST_TOKEN_SECRET`, etc.) solo se leen vía `process.env` del lado
  servidor (`api/`), nunca en el frontend.
- `npm audit --omit=dev`: 0 vulnerabilidades en dependencias de producción.

**Dos vulnerabilidades reales encontradas y corregidas:**
1. **XSS almacenado/reflejado**: `api/request-call.js` y `api/respond-call.js` interpolaban
   campos del formulario público (`nombre`, `mensaje`, etc.) directo en HTML sin escapar — tanto
   en los correos como, más grave, en la página de confirmación que se renderiza en el navegador
   del dueño del negocio al hacer clic en "Aceptar/Rechazar" desde el correo. Corregido con un
   helper nuevo `api/_lib/html.js` (`escapeHtml()`) aplicado en ambos endpoints.
2. **Comparación de firma no constant-time**: `api/_lib/token.js` comparaba la firma HMAC con
   `!==` (string compare normal) en vez de `crypto.timingSafeEqual`, un vector teórico de ataque
   de temporización. Corregido.

**Headers de seguridad**: se creó `vercel.json` con Content-Security-Policy (ajustada a los
orígenes externos reales del sitio: Google Fonts, db.onlinewebfonts.com, Pixieset, Formspree —
verificados uno por uno, incluyendo revisar el CSS real que devuelve el proveedor de fuente
custom para confirmar de qué dominio sirve los archivos de fuente), X-Frame-Options: DENY,
X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, y
Strict-Transport-Security. Verificado en producción con `curl -sI` y sin errores de consola en
el navegador tras el deploy (fuentes e imágenes cargan bien, CSP no rompió nada).

## 3. Rate limiting

Se agregó a `/api/request-call` (el endpoint que crea holds reales en Google Calendar y manda
correos reales — antes sin ningún freno, vulnerable a spam). Implementado en
`api/_lib/rateLimit.js`: limitador en memoria por IP, 5 solicitudes / 15 minutos, sin
dependencias externas ni servicios nuevos (se evitó deliberadamente algo tipo Upstash Redis para
no agregar infraestructura/costos nuevos sin que el usuario lo pidiera explícitamente). Es
"best-effort" (no es un contador distribuido, se reinicia en cold starts) pero corta el caso real
que importaba: un script mandando ráfagas de solicitudes seguidas.

## 4. Configuración del dominio joyevents.do

El episodio más largo de la sesión. Cronología:

1. El usuario ya tenía `joyevents.do` comprado y agregado en Vercel → Settings → Domains, ambos
   dominios (`joyevents.do` y `www.`) marcados "Invalid Configuration".
2. **Primer intento**: se asumió modo "DNS externo" y se crearon manualmente, en el panel de DNS
   Records de NIC.do (backend `myorderbox.com`), un registro A y un CNAME con los valores que
   Vercel mostraba en ese momento. Quedaron creados y "Active" en el panel — pero **resultaron
   irrelevantes**.
3. **Hallazgo real**: revisando el panel de "Nombre de Servidores" en `cp.midominio.do` (el
   panel de cuenta/dominio de NIC.do, distinto del panel de DNS Records) se descubrió que el
   dominio en realidad estaba en modo **"Vercel Nameservers"** (delegación completa a
   `ns1.vercel-dns.com` / `ns2.vercel-dns.com`), ya guardado correctamente. En ese modo, los
   registros A/CNAME manuales no tienen ningún efecto — Vercel maneja todo el DNS solo.
4. **El bloqueo real**: a pesar de tener los nameservers correctos guardados, el registro `.do`
   (la autoridad raíz) seguía devolviendo una delegación rota a dos IPs (`198.51.44.13` /
   `198.51.45.13`) que rechazaban toda consulta ("lame delegation" — confirmado repetidamente vía
   la API HTTP de Google DNS, `https://dns.google/resolve`, ya que `dig`/`nslookup` directos no
   fueron confiables desde este entorno de trabajo).
5. Se explicó como una sincronización pendiente entre NIC.do y el registro `.do`, sin ningún
   botón/acción disponible en los paneles para forzarla — solo esperar y monitorear.
6. **Resolución (2026-08-05)**: el usuario hizo un ajuste adicional de su lado en el panel (no
   quedó documentado el paso exacto — quedó pendiente como pregunta abierta) y la delegación
   sincronizó. Verificado: `dns.google` devuelve la delegación correcta, y
   `https://joyevents.do` / `https://www.joyevents.do` cargan el sitio con SSL válido y todos los
   headers de seguridad activos.

## 5. Documentación generada

- **`handoff.md`** (dentro de este repo): actualizado varias veces a lo largo de la sesión —
  sección de animaciones reemplazada por una nota de "descartadas" con aprendizaje, sección
  completa de configuración del dominio (incluyendo la bitácora de diagnóstico), sección de
  seguridad implícita en los commits, tareas pendientes al día.
- **`/Users/maxwelalexanderprenciomartinez/Documents/web project/confdomi/nic.do/nic-do.md`**
  (fuera de este repo, biblioteca de referencia reutilizable): guía general de cómo configurar
  cualquier dominio `.do` vía NIC.do — los dos paneles, los dos modos de conexión, qué significa
  cada campo de sus formularios, cómo diagnosticar sin `dig`, contacto de soporte, y el caso real
  de `joyevents.do` como ejemplo. Pensada para reusarse en futuros proyectos/dominios, no solo
  este.
- **Este archivo** (`memoria.md`): resumen narrativo de toda la sesión.

## Estado final del proyecto al cierre de esta sesión

- Sitio en vivo en `https://joyevents-rd.vercel.app` **y** `https://joyevents.do` /
  `https://www.joyevents.do`, ambos con SSL válido.
- Sin animaciones de "toque personal" (se probaron dos, se descartaron las dos).
- Auditoría de seguridad completa: sin secretos expuestos, XSS corregido, timing attack
  corregido, headers de seguridad activos, rate limiting básico en el endpoint más sensible.
- Todo commiteado y pusheado a `main`; último commit de esta sesión: `a0f5b9d`.
- Pendiente real: fotos de "Post Boda" (esperando material del usuario), actualizar
  `DR_HOLIDAYS` para 2027 cuando se publique, y considerar migrar el rate limiting a algo
  persistente si el tráfico crece.
