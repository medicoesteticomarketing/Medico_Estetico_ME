# MédicoEstético.Marketing — Estado del Proyecto

## Último update: 2026-06-04

---

## ✅ Funciona
- Landing page completa en `index.html` desplegada en `medicoestetico.marketing`
- Sección Diagnóstico: imagen `perfil_lateral.webp` fuera de la caja, caja dark a la derecha
- Sección CTA final: imagen `rostro_fer1.webp` en columna derecha (grid 2 cols)
- Sección Herramientas: botón "Sí, ¡Cotizar ahora!" con tipografía Josefin Sans
- Modal de certificaciones (🏅 Ver Certificaciones Oficiales) con `fer_certificados.webp`
- Candado 🔒 en footer → cotizador con contraseña `290514`
- `cotizacion.html` con sección "¿Por qué nosotros?" + condición de pago "día 4"
- `cotizacion.html` acepta cotizaciones vía `/api/aceptar-cotizacion` → Brevo
- Brevo dominio `medicoestetico.marketing` autenticado (SPF + DKIM + DMARC) ✅
- Cloudflare Email Routing: `hola@medicoestetico.marketing` → `medicoestetico.marketing@gmail.com` ✅
- `fertorres@medicoestetico.marketing` → `medicoestetico.marketing@gmail.com` ✅
- Gmail configurado para enviar/responder como `hola@medicoestetico.marketing` vía Brevo SMTP ✅
- Firma de email Fernanda Torres: `firma_email.html` con PNG + GIF animado Google & Meta
- Variables de entorno en Cloudflare: `BREVO_KEY_DIAGNOSTICO`, `NOTIFY_EMAIL`, `SITE_URL` ✅
- Modal conversión: trigger a 90 segundos O 60% de scroll (lo que ocurra primero)
- `_worker.js` autocontenido (sin imports) con handlers de diagnóstico y cotización ✅
- Repo transferido a Fer: `medicoesteticomarketing/Medico_Estetico_ME` — Fer es dueña ✅
- TopBrandMedical es colaborador directo del repo de Fer — push directo sin sync ✅

## 🔲 Pendiente
- Verificar que el formulario diagnóstico funciona end-to-end (probar en producción)
- Verificar que llegan 2 correos: uno a Fer y uno al médico
- Probar flujo completo de aceptación de cotización

## ⚠️ Decisiones importantes
- Repositorio principal: `medicoesteticomarketing/Medico_Estetico_ME` (Fer es dueña)
- TopBrandMedical es colaborador — pushea directo, sin fork ni sync
- El proyecto es un **Cloudflare Worker** (NO Pages) — usa `_worker.js` + `wrangler.toml`
- `_worker.js` debe ser un archivo único autocontenido (sin imports locales)
- `.assetsignore` excluye `_worker.js` y `wrangler.toml` de los assets estáticos
- Brevo SMTP: servidor `smtp-relay.brevo.com`, puerto `587`, login `ace300001@smtp-brevo.com`
- API Key Brevo: guardada como `BREVO_KEY_DIAGNOSTICO` en Cloudflare (nombre en Brevo: "ME - Diagnósticos")
- Contraseña cotizador: `290514`
- **NO mezclar nada con la carpeta TOP BRAND MEDICAL** — solo leer como referencia

## 🎯 Próximo paso
1. Probar formulario de diagnóstico en `medicoestetico.marketing/solicitud-diagnostico.html`
2. Verificar que llegan 2 correos: uno a Fer y uno al médico
3. Probar flujo completo de aceptación de cotización

## 📁 Archivos clave
- `index.html` — landing page principal
- `solicitud-diagnostico.html` — formulario de diagnóstico gratuito
- `cotizacion.html` — vista pública de cotización con aceptación
- `cotizador.html` — generador de cotizaciones (protegido con contraseña)
- `_worker.js` — Worker principal autocontenido (maneja /api/diagnostico-cliente y /api/aceptar-cotizacion)
- `wrangler.toml` — configuración del Worker de Cloudflare
- `.assetsignore` — excluye _worker.js y wrangler.toml de assets
- `functions/api/` — handlers originales (referencia, no se usan en producción)
- `firma_email.html` — firma de email lista para copiar a Gmail
- `assets/img/firma_fer_torres.png` — imagen de la firma
- `assets/img/google_meta_animados.gif` — GIF animado de certificaciones Google & Meta
- `script.js` — lógica frontend (modales, toasts, cotizador lock, etc.)
- `styles.css` — estilos personalizados
