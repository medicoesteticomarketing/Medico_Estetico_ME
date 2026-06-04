# MédicoEstético.Marketing — Estado del Proyecto

## Último update: 2026-05-29

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

## 🔲 Pendiente
- **CRÍTICO:** Formulario diagnóstico `/api/diagnostico-cliente` regresa 404
  - Causa: proyecto usa `npx wrangler deploy` (modelo Workers, no Pages)
  - La carpeta `functions/` solo funciona con Cloudflare Pages
  - Solución aplicada: se crearon `wrangler.toml` + `_worker.js` pero el build falló
  - Próximo paso: ver el log completo del error en Cloudflare → "Ver compilación" → "Copiar registro"
- Probar flujo completo del formulario de diagnóstico end-to-end
- Probar flujo completo de aceptación de cotización
- Verificar que emails llegan desde `hola@medicoestetico.marketing`

## ⚠️ Decisiones importantes
- Repositorio upstream: `topbrandmedical/Medico_Estetico_ME` (aquí se pushea)
- Fork de Fer: `medicoesteticomarketing/Medico_Estetico_ME` (conectado a Cloudflare)
- Flujo: push a topbrandmedical → Fer hace "Bifurcación de sincronización" → Cloudflare despliega
- Brevo SMTP: servidor `smtp-relay.brevo.com`, puerto `587`, login `ace300001@smtp-brevo.com`
- API Key Brevo: guardada como `BREVO_KEY_DIAGNOSTICO` en Cloudflare (nombre en Brevo: "ME - Diagnósticos")
- Contraseña cotizador: `290514`
- **NO mezclar nada con la carpeta TOP BRAND MEDICAL** — solo leer como referencia

## 🎯 Próximo paso
1. Abrir log completo del build fallido en Cloudflare → copiar el error exacto
2. Corregir el `wrangler.toml` o `_worker.js` según el error
3. Hacer push → Fer sincroniza fork → verificar que el deploy pasa
4. Probar formulario de diagnóstico en `medicoestetico.marketing/solicitud-diagnostico.html`
5. Verificar que llegan 2 correos: uno a Fer y uno al médico

## 📁 Archivos clave
- `index.html` — landing page principal
- `solicitud-diagnostico.html` — formulario de diagnóstico gratuito
- `cotizacion.html` — vista pública de cotización con aceptación
- `cotizador.html` — generador de cotizaciones (protegido con contraseña)
- `functions/api/diagnostico-cliente.js` — handler del formulario de diagnóstico
- `functions/api/aceptar-cotizacion.js` — handler de aceptación de cotización
- `_worker.js` — entry point del Worker (enruta /api/* a los handlers)
- `wrangler.toml` — configuración del Worker de Cloudflare
- `firma_email.html` — firma de email lista para copiar a Gmail
- `assets/img/firma_fer_torres.png` — imagen de la firma
- `assets/img/google_meta_animados.gif` — GIF animado de certificaciones Google & Meta
- `script.js` — lógica frontend (modales, toasts, cotizador lock, etc.)
- `styles.css` — estilos personalizados
