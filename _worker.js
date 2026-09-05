/**
 * MédicoEstético.Marketing — Cloudflare Worker
 * Enruta /api/* a los handlers correspondientes
 */

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Helper: enviar email via Brevo ────────────────────────────────────────────
async function enviarEmail(env, { to, subject, html }) {
    if (!env.BREVO_KEY_DIAGNOSTICO) {
        console.warn('BREVO_KEY_DIAGNOSTICO no configurada — email omitido');
        return;
    }
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': env.BREVO_KEY_DIAGNOSTICO,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: 'MédicoEstético.Marketing', email: 'hola@medicoestetico.marketing' },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });
    if (!res.ok) {
        console.error('Brevo error:', await res.text());
    }
}

// ── /api/diagnostico-cliente ──────────────────────────────────────────────────
async function handleDiagnosticoCliente(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

    let data;
    try { data = await request.json(); }
    catch { return new Response(JSON.stringify({ ok: false, error: 'Datos inválidos' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }); }

    const { nombre, email, whatsapp, especialidad, ciudad, web, estrategias, redes, objetivo, presupuesto, valorServicio, notas } = data;
    const siteUrl = env.SITE_URL || 'https://medicoestetico.marketing';

    const diagParams = new URLSearchParams({ nombre: nombre || '', especialidad: especialidad || '', ciudad: ciudad || '', web: web || '', estrategias: estrategias || '', redes: redes || '', objetivo: objetivo || '', presupuesto: presupuesto || '', valorServicio: valorServicio || '', notas: notas || '', email: email || '', whatsapp: whatsapp || '' });
    const diagUrl = `${siteUrl}/diagnostico.html?${diagParams.toString()}`;

    await enviarEmail(env, {
        to: env.NOTIFY_EMAIL || 'medicoestetico.marketing@gmail.com',
        subject: `⚡ Nuevo diagnóstico: ${nombre} — ${especialidad}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;"><div style="background:#0a0a0a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;"><span style="color:#ff008a;font-size:18px;font-weight:900;letter-spacing:0.06em;">MédicoEstético.Marketing</span></div><div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;"><h2 style="color:#0a0a0a;font-size:20px;margin:0 0 6px;">🩺 Nuevo diagnóstico solicitado</h2><p style="color:#555;font-size:14px;margin:0 0 20px;">${nombre || '—'} (${especialidad || '—'}) quiere su Diagnóstico Estético Digital 360°</p><div style="margin-bottom:24px;"><a href="${diagUrl}" style="background:#ff008a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;font-size:15px;">⚡ Generar Diagnóstico 360° ahora</a></div><table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;"><tr><td style="padding:8px;font-weight:bold;color:#555;width:38%;">Nombre</td><td style="padding:8px;">${nombre || '—'}</td></tr><tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Email</td><td style="padding:8px;">${email || '—'}</td></tr><tr><td style="padding:8px;font-weight:bold;color:#555;">WhatsApp</td><td style="padding:8px;">${whatsapp || '—'}</td></tr><tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Especialidad</td><td style="padding:8px;">${especialidad || '—'}</td></tr><tr><td style="padding:8px;font-weight:bold;color:#555;">Ciudad / País</td><td style="padding:8px;">${ciudad || '—'}</td></tr><tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Sitio web</td><td style="padding:8px;">${web || 'No tiene'}</td></tr><tr><td style="padding:8px;font-weight:bold;color:#555;">Estrategia actual</td><td style="padding:8px;">${estrategias || 'Ninguna indicada'}</td></tr><tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Redes sociales</td><td style="padding:8px;">${redes || 'No tiene'}</td></tr><tr><td style="padding:8px;font-weight:bold;color:#555;">Objetivo principal</td><td style="padding:8px;">${objetivo || '—'}</td></tr><tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Presupuesto</td><td style="padding:8px;">${presupuesto || 'No mencionado'}</td></tr><tr><td style="padding:8px;font-weight:bold;color:#555;">Valor de procedimientos</td><td style="padding:8px;">${valorServicio || 'No especificado'}</td></tr><tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Notas adicionales</td><td style="padding:8px;">${notas || '—'}</td></tr></table><p style="color:#999;font-size:12px;margin-top:20px;">MédicoEstético.Marketing — Solicitud de diagnóstico automática</p></div></div>`
    });

    if (email) {
        const nombreCorto = (nombre || 'Doctor').split(' ').slice(0, 2).join(' ');
        await enviarEmail(env, {
            to: email,
            subject: `${nombreCorto}, tu Diagnóstico Estético Digital está en preparación 💖`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;"><div style="background:#0a0a0a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;"><span style="color:#ff008a;font-size:18px;font-weight:900;letter-spacing:0.06em;">MédicoEstético.Marketing</span></div><div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;"><h2 style="color:#0a0a0a;margin:0 0 12px;">¡Perfecto, ${nombreCorto}!</h2><p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 12px;">Hemos recibido toda la información necesaria para preparar tu <strong>Diagnóstico de Autoridad Estética Digital 360°</strong>.</p><p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px;">Nuestro equipo lo analizará y recibirás tu diagnóstico personalizado en las próximas <strong>24 horas hábiles</strong>.</p><div style="background:#fff0f8;border-left:4px solid #ff008a;padding:16px;border-radius:0 8px 8px 0;margin:0 0 24px;"><p style="margin:0;color:#cc0070;font-weight:bold;font-size:14px;">¿Tienes alguna pregunta?</p><p style="margin:8px 0 0;color:#555;font-size:13px;">Escríbenos directamente por WhatsApp:</p><a href="https://wa.me/523329683200" style="color:#ff008a;font-weight:bold;font-size:14px;">+52 33 2968 3200</a></div><p style="color:#666;font-size:14px;margin:0 0 4px;">Atentamente,</p><p style="color:#333;font-size:14px;margin:0;"><strong>Fernanda Torres</strong><br>Especialista en Marketing para Medicina Estética<br>MédicoEstético.Marketing</p><hr style="border:none;border-top:1px solid #eee;margin:24px 0;"><p style="color:#aaa;font-size:11px;margin:0;"><a href="${siteUrl}" style="color:#ff008a;">medicoestetico.marketing</a> · hola@medicoestetico.marketing · +52 33 2968 3200</p></div></div>`
        });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
}

// ── /api/aceptar-cotizacion ───────────────────────────────────────────────────
async function handleAceptarCotizacion(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

    let data;
    try { data = await request.json(); }
    catch { return new Response(JSON.stringify({ ok: false, error: 'Datos inválidos' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }); }

    const { nombre, email, folio, cliente, empresa, total, mensual, url } = data;
    const siteUrl = env.SITE_URL || 'https://medicoestetico.marketing';

    await enviarEmail(env, {
        to: env.NOTIFY_EMAIL || 'medicoestetico.marketing@gmail.com',
        subject: `✅ ${cliente} aceptó la cotización ${folio} — MédicoEstético.Marketing`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;"><div style="background:#0a0a0a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;"><span style="color:#ff008a;font-size:18px;font-weight:900;letter-spacing:0.06em;">MédicoEstético.Marketing</span></div><div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;"><h2 style="color:#0a0a0a;font-size:20px;margin:0 0 6px;">✅ ¡Cotización Aceptada!</h2><p style="color:#555;font-size:14px;margin:0 0 20px;"><strong>${cliente}</strong> ha aceptado la cotización <strong>${folio}</strong>.</p><table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;"><tr><td style="padding:8px;font-weight:bold;color:#555;width:38%;">Folio</td><td style="padding:8px;">${folio || '—'}</td></tr><tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Cliente</td><td style="padding:8px;">${cliente || '—'}</td></tr>${empresa ? `<tr><td style="padding:8px;font-weight:bold;color:#555;">Empresa</td><td style="padding:8px;">${empresa}</td></tr>` : ''}<tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Nombre firmante</td><td style="padding:8px;">${nombre || '—'}</td></tr><tr><td style="padding:8px;font-weight:bold;color:#555;">Email firmante</td><td style="padding:8px;">${email || '—'}</td></tr><tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Total Mes 1</td><td style="padding:8px;font-weight:bold;color:#ff008a;">${total || '—'}</td></tr><tr><td style="padding:8px;font-weight:bold;color:#555;">Mensual recurrente</td><td style="padding:8px;">${mensual || 'N/A'}</td></tr></table>${url ? `<p style="margin:16px 0 0;"><a href="${url}" style="color:#ff008a;font-size:13px;">Ver cotización completa →</a></p>` : ''}<p style="color:#999;font-size:12px;margin-top:20px;">MédicoEstético.Marketing — Aceptación automática de cotización</p></div></div>`
    });

    if (email) {
        const nombreCorto = (nombre || cliente || 'Doctor').split(' ').slice(0, 2).join(' ');
        await enviarEmail(env, {
            to: email,
            subject: `✅ Confirmación: aceptaste la cotización ${folio} — MédicoEstético.Marketing`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;"><div style="background:#0a0a0a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;"><span style="color:#ff008a;font-size:18px;font-weight:900;letter-spacing:0.06em;">MédicoEstético.Marketing</span></div><div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;"><h2 style="color:#0a0a0a;margin:0 0 12px;">¡Excelente decisión, ${nombreCorto}!</h2><p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 12px;">Hemos registrado tu aceptación de la cotización <strong>${folio}</strong> por un total de <strong style="color:#ff008a;">${total}</strong>.</p><p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px;">Nuestro equipo se pondrá en contacto contigo a la brevedad para coordinar los próximos pasos e iniciar los servicios contratados.</p><div style="background:#fff0f8;border-left:4px solid #ff008a;padding:16px;border-radius:0 8px 8px 0;margin:0 0 24px;"><p style="margin:0;color:#cc0070;font-weight:bold;font-size:14px;">¿Tienes alguna pregunta?</p><p style="margin:8px 0 0;color:#555;font-size:13px;">Escríbenos directamente por WhatsApp:</p><a href="https://wa.me/523329683200" style="color:#ff008a;font-weight:bold;font-size:14px;">+52 33 2968 3200</a></div><p style="color:#666;font-size:14px;margin:0 0 4px;">Atentamente,</p><p style="color:#333;font-size:14px;margin:0;"><strong>Fernanda Torres</strong><br>Especialista en Marketing para Medicina Estética<br>MédicoEstético.Marketing</p><hr style="border:none;border-top:1px solid #eee;margin:24px 0;"><p style="color:#aaa;font-size:11px;margin:0;"><a href="${siteUrl}" style="color:#ff008a;">medicoestetico.marketing</a> · hola@medicoestetico.marketing · +52 33 2968 3200</p></div></div>`
        });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
}

// ── /api/guardar-reporte ──────────────────────────────────────────────────────
async function handleGuardarReporte(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

    let data;
    try { data = await request.json(); }
    catch { return new Response(JSON.stringify({ ok: false, error: 'Datos inválidos' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }); }

    const { contenido, doctor, especialidad } = data;

    if (!contenido || contenido.trim().length < 50) {
        return new Response(JSON.stringify({ ok: false, error: 'El contenido está vacío o muy corto' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const contadorActual = await env.REPORTES.get('__contador__');
    const siguiente = contadorActual ? parseInt(contadorActual) + 1 : 1;
    await env.REPORTES.put('__contador__', String(siguiente));

    const id = `ME-${String(siguiente).padStart(3, '0')}`;
    const payload = JSON.stringify({ contenido: contenido.trim(), doctor: doctor || 'Doctor', especialidad: especialidad || '', fecha: new Date().toISOString() });

    await env.REPORTES.put(id, payload, { expirationTtl: 60 * 60 * 24 * 60 });

    const siteUrl = env.SITE_URL || 'https://medicoestetico.marketing';
    const url = `${siteUrl}/reporte.html?id=${id}`;

    return new Response(JSON.stringify({ ok: true, id, url }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
}

// ── /api/obtener-reporte ──────────────────────────────────────────────────────
async function handleObtenerReporte(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return new Response(JSON.stringify({ ok: false, error: 'ID requerido' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });

    const data = await env.REPORTES.get(id);

    if (!data) return new Response(JSON.stringify({ ok: false, error: 'Reporte no encontrado o expirado' }), { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } });

    return new Response(data, { headers: { ...CORS, 'Content-Type': 'application/json' } });
}

// ── Blog público (lee D1 binding BLOG_DB, misma base que content-os-me-worker) ─
// Solo sirve artículos con estado='PUBLISHED'. Fer aprueba en el editor de
// Content OS (GENERATED→DRAFT→REVIEW→APPROVED→PUBLISHED); esto solo lee el
// resultado final. No modifica nada de la landing existente (index.html intacto).

const BLOG_SITE = 'https://medicoestetico.marketing';
const BLOG_BRAND = { primary: '#ff008a' };

function blogEsc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Solo estos esquemas de URL pueden llegar a un href/src generado desde markdown.
// Bloquea javascript:, data:, vbscript:, etc. — el resto del contenido siempre
// pasa por blogEsc() antes de esto, así que esta es la segunda capa de defensa.
// JSON.stringify no escapa '<', así que un título con "</script>" podría cerrar
// el <script type="application/ld+json"> anfitrión e inyectar HTML. < lo evita.
function blogJsonLd(obj) {
    return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function blogSafeUrl(url) {
    const u = String(url || '').trim();
    if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u)) return u;
    return null;
}

// Markdown -> HTML con lista whitelist de bloques (sin dependencias, sin HTML crudo del
// usuario): H2/H3, listas con/sin orden, negritas/itálicas, enlaces, citas, tablas,
// imágenes con caption y párrafos. TODO el texto pasa por inline() -> blogEsc() antes
// de insertarse; solo los patrones reconocidos (**, *, [..](..)) generan tags reales,
// y esos operan sobre texto YA escapado, así que no hay forma de inyectar HTML crudo.
// El editor de Content OS inserta este marcador literal dentro de cuerpo_md junto a
// afirmaciones sin verificar (ver MARCADOR en content-os-me-worker/src/services/verify.js).
// Es una anotación interna para el flujo editorial (Fer), nunca contenido para el lector
// público — el render del blog debe eliminarla sin tocar el resto del texto ni el dato
// almacenado en D1 (hechos_pendientes_json sigue intacto para Content OS).
const BLOG_INTERNAL_MARKERS = [/\s*\[pendiente de verificar\]/gi];

function blogStripInternalMarkers(md) {
    if (!md) return md;
    return BLOG_INTERNAL_MARKERS.reduce((t, re) => t.replace(re, ''), md);
}

// Bloques editoriales: estructura controlada, exactamente 4 variantes con
// función editorial propia (no decorativas). Un tipo fuera de esta lista
// (alucinado por la IA o mal escrito a mano) NUNCA se muestra como bloque —
// degrada a contenido normal, sin exponer el fence ":::" al lector.
const BLOG_CALLOUT_META = {
    accent: { icon: '💡', label: 'Idea clave' },
    highlight: { icon: '📌', label: 'Dato destacado' },
    tip: { icon: '✅', label: 'Recomendación' },
    warning: { icon: '⚠️', label: 'Importante' }
};

const blogInline = t => blogEsc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, txt, href) => {
        const safe = blogSafeUrl(href);
        return safe ? `<a href="${blogEsc(safe)}" rel="noopener noreferrer">${txt}</a>` : txt;
    });

// Parser de bloques, extraído para poder llamarse recursivamente sobre el
// contenido interno de un ":::tipo ... :::" (así una cita, lista o párrafo
// dentro de un bloque editorial se renderiza con las mismas reglas que el
// resto del artículo — reutiliza, no duplica el parser).
function blogParseBlocks(lines) {
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        if (!line) { i++; continue; }

        // Bloque editorial: :::tipo ... :::
        const fence = line.match(/^:::(\w+)\s*$/);
        if (fence) {
            const tipo = fence[1].toLowerCase();
            i++;
            const innerLines = [];
            while (i < lines.length && lines[i].trim() !== ':::') { innerLines.push(lines[i]); i++; }
            if (i < lines.length) i++; // consume el ":::" de cierre, si existe
            const innerHtml = blogParseBlocks(innerLines).join('\n');
            const meta = BLOG_CALLOUT_META[tipo];
            blocks.push(meta
                ? `<div class="callout callout-${tipo}"><span class="callout-label">${meta.icon} ${blogEsc(meta.label)}</span>${innerHtml}</div>`
                : innerHtml); // tipo no reconocido: contenido normal, sin wrapper ni fence visible
            continue;
        }

        // Imagen (con caption opcional): ![alt](url "caption")
        const img = line.match(/^!\[(.*?)\]\((\S+)(?:\s+"(.*?)")?\)$/);
        if (img) {
            const [, alt, src, caption] = img;
            const safeSrc = blogSafeUrl(src);
            if (safeSrc) {
                blocks.push(`<figure><img src="${blogEsc(safeSrc)}" alt="${blogEsc(alt)}" loading="lazy">${
                    (caption || alt) ? `<figcaption>${blogEsc(caption || alt)}</figcaption>` : ''
                }</figure>`);
            }
            i++; continue;
        }

        // Encabezados H2/H3
        const h = line.match(/^(#{2,3})\s+(.*)$/);
        if (h) { blocks.push(`<h${h[1].length}>${blogInline(h[2])}</h${h[1].length}>`); i++; continue; }

        // Cita (>...), agrupa líneas consecutivas
        if (line.startsWith('>')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
                i++;
            }
            blocks.push(`<blockquote><p>${blogInline(quoteLines.join(' '))}</p></blockquote>`);
            continue;
        }

        // Tabla: fila de cabecera + fila separadora (---|---) + filas de datos
        if (/^\|.*\|$/.test(line) && lines[i + 1] && /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim())) {
            const parseRow = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
            const header = parseRow(line);
            i += 2;
            const rows = [];
            while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) { rows.push(parseRow(lines[i].trim())); i++; }
            blocks.push(
                '<table><thead><tr>' + header.map(c => `<th>${blogInline(c)}</th>`).join('') + '</tr></thead><tbody>' +
                rows.map(r => '<tr>' + r.map(c => `<td>${blogInline(c)}</td>`).join('') + '</tr>').join('') +
                '</tbody></table>'
            );
            continue;
        }

        // Lista ordenada
        if (/^\d+\.\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s+/, '')); i++; }
            blocks.push('<ol>' + items.map(t => `<li>${blogInline(t)}</li>`).join('') + '</ol>');
            continue;
        }

        // Lista no ordenada
        if (/^[-*]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, '')); i++; }
            blocks.push('<ul>' + items.map(t => `<li>${blogInline(t)}</li>`).join('') + '</ul>');
            continue;
        }

        // Párrafo: acumula líneas hasta la próxima línea en blanco o bloque especial
        const paraLines = [];
        while (i < lines.length && lines[i].trim() &&
               !/^(#{2,3})\s+/.test(lines[i].trim()) && !lines[i].trim().startsWith('>') &&
               !/^\|.*\|$/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim()) &&
               !/^[-*]\s+/.test(lines[i].trim()) && !/^!\[/.test(lines[i].trim()) && !/^:::/.test(lines[i].trim())) {
            paraLines.push(lines[i].trim()); i++;
        }
        if (paraLines.length) blocks.push(`<p>${blogInline(paraLines.join(' '))}</p>`);
        else i++;
    }

    return blocks;
}

function blogMdToHtml(md) {
    if (!md) return '';
    md = blogStripInternalMarkers(md);
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    return blogParseBlocks(lines).join('\n');
}

function blogReadingTime(md) {
    const words = (md || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

const BLOG_NEXT_ACTION_LABEL = {
    cta_contextual: 'Ver más', enlace_interno: 'Leer más', articulo_relacionado: 'Artículo relacionado',
    articulo_pilar: 'Ver la guía completa', recurso: 'Ver recurso', diagnostico: 'Solicita tu diagnóstico gratuito',
    servicio: 'Conoce el servicio', whatsapp: 'Escríbenos por WhatsApp'
};

function blogNextActionHref(post) {
    if (post.next_action_type === 'whatsapp') {
        return `https://wa.me/523329683200?text=${encodeURIComponent('Hola Fernanda, leí tu artículo "' + post.titulo + '" y quiero saber más')}`;
    }
    if (post.next_action_destino) return post.next_action_destino;
    if (post.next_action_type === 'diagnostico') return '/#diagnostico';
    if (post.next_action_type === 'servicio') return '/#servicios';
    return null;
}

function blogBaseHead({ title, description, canonical, ogImage }) {
    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blogEsc(title)}</title>
    <meta name="description" content="${blogEsc(description || '')}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${blogEsc(canonical)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="MédicoEstético.Marketing">
    <meta property="og:title" content="${blogEsc(title)}">
    <meta property="og:description" content="${blogEsc(description || '')}">
    <meta property="og:url" content="${blogEsc(canonical)}">
    ${ogImage ? `<meta property="og:image" content="${blogEsc(ogImage)}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Raleway:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = { theme: { extend: {
        colors: { brand: { primary: '#ff008a', secondary: '#000000', bg: '#f8f8f8' } },
        fontFamily: { sans: ['Raleway','sans-serif'], display: ['Bricolage Grotesque','sans-serif'] }
      } } };
    </script>
    <link rel="icon" href="/assets/logo/favicon_de_perfil_me.svg" type="image/svg+xml">
    <style>
      .prose-blog { color: #262626; line-height: 1.75; }
      .prose-blog h2 { font-size: 1.5rem; font-weight: 900; margin: 2rem 0 0.75rem; color: #0a0a0a; }
      .prose-blog h3 { font-size: 1.2rem; font-weight: 800; margin: 1.5rem 0 0.5rem; color: #0a0a0a; }
      .prose-blog p { margin: 0 0 1rem; }
      .prose-blog ul, .prose-blog ol { margin: 0 0 1rem; padding-left: 1.4rem; }
      .prose-blog li { margin-bottom: 0.35rem; }
      .prose-blog ul { list-style: disc; }
      .prose-blog ol { list-style: decimal; }
      .prose-blog a { color: #ff008a; font-weight: 600; text-decoration: underline; }
      .prose-blog strong { font-weight: 800; color: #0a0a0a; }
      .prose-blog blockquote { border-left: 4px solid #ff008a; padding: 0.25rem 1.25rem; margin: 1.5rem 0; color: #555; font-style: italic; background: #FDF6F3; border-radius: 0 0.75rem 0.75rem 0; }
      .prose-blog blockquote p { margin: 0; }
      .prose-blog table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
      .prose-blog th, .prose-blog td { border: 1px solid #eee; padding: 0.6rem 0.8rem; text-align: left; }
      .prose-blog th { background: #FDF6F3; font-weight: 800; color: #0a0a0a; }
      .prose-blog figure { margin: 1.5rem 0; }
      .prose-blog figure img { width: 100%; border-radius: 1rem; display: block; }
      .prose-blog figcaption { font-size: 0.8rem; color: #999; text-align: center; margin-top: 0.5rem; }
      .hero-blog { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 1.25rem; display: block; margin: 1.25rem 0 2rem; }
      .card-hero { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 1rem; display: block; margin-bottom: 0.75rem; }
      .prose-blog .callout { border-left: 4px solid; border-radius: 0 1rem 1rem 0; padding: 1rem 1.25rem; margin: 1.5rem 0; }
      .prose-blog .callout p { margin: 0.4rem 0 0; }
      .prose-blog .callout p:first-of-type { margin-top: 0.4rem; }
      .prose-blog .callout-label { display: block; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
      .prose-blog .callout-accent { border-color: #ff008a; background: #FDF0F7; }
      .prose-blog .callout-accent .callout-label { color: #ff008a; }
      .prose-blog .callout-highlight { border-color: #f5a623; background: #FFF8E9; }
      .prose-blog .callout-highlight .callout-label { color: #b8860b; }
      .prose-blog .callout-tip { border-color: #2e9e5b; background: #EAFAF0; }
      .prose-blog .callout-tip .callout-label { color: #1e7a44; }
      .prose-blog .callout-warning { border-color: #d64545; background: #FDECEA; }
      .prose-blog .callout-warning .callout-label { color: #b13030; }
    </style>`;
}

// Header/footer ligeros del blog — mismo lenguaje visual que la landing, sin tocar
// la navbar bloqueada de index.html (plantilla nueva, independiente).
function blogHeader() {
    return `
    <header class="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="/" class="flex items-center" aria-label="Inicio MédicoEstético.Marketing">
                <img src="/assets/logo/logo_me_original.svg" alt="MédicoEstético.Marketing" class="h-10 w-auto object-contain">
            </a>
            <a href="/#diagnostico" class="hidden sm:inline-block text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full text-white" style="background:${BLOG_BRAND.primary}">Diagnóstico gratuito</a>
        </div>
    </header>`;
}

function blogFooter() {
    return `
    <footer class="border-t border-gray-100 mt-20 py-10">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">&copy; 2026 MédicoEstético.Marketing</p>
            <a href="/" class="text-xs font-black uppercase tracking-widest" style="color:${BLOG_BRAND.primary}">Volver al inicio →</a>
        </div>
    </footer>`;
}

async function renderBlogIndex(env, url) {
    const db = env.BLOG_DB;
    const catSlug = url.searchParams.get('categoria');

    const cats = (await db.prepare("SELECT * FROM blog_categories WHERE activa=1 ORDER BY orden, nombre").all()).results;
    let cat = null;
    if (catSlug) cat = cats.find(c => c.slug === catSlug) || null;

    const sql = cat
        ? "SELECT * FROM blog_posts WHERE estado='PUBLISHED' AND category_id=? ORDER BY fecha_publicacion DESC"
        : "SELECT * FROM blog_posts WHERE estado='PUBLISHED' ORDER BY fecha_publicacion DESC";
    const stmt = cat ? db.prepare(sql).bind(cat.id) : db.prepare(sql);
    const posts = (await stmt.all()).results;

    const catNombre = Object.fromEntries(cats.map(c => [c.id, c.nombre]));
    const canonical = BLOG_SITE + '/blog/' + (catSlug ? '?categoria=' + encodeURIComponent(catSlug) : '');

    const cards = posts.length ? posts.map(p => `
        <article class="border border-gray-100 rounded-[1.5rem] p-6 hover:shadow-lg transition-shadow">
            ${p.imagen_hero ? `<img src="${blogEsc(p.imagen_hero)}" alt="${blogEsc(p.titulo)}" class="card-hero" loading="lazy" onerror="this.remove()">` : ''}
            <span class="text-xs font-black uppercase tracking-widest" style="color:${BLOG_BRAND.primary}">${blogEsc(catNombre[p.category_id] || '')}</span>
            <h2 class="text-xl font-black mt-2 mb-2 text-brand-secondary"><a href="/blog/${blogEsc(p.slug)}/" class="hover:underline">${blogEsc(p.titulo)}</a></h2>
            ${p.dek ? `<p class="text-gray-500 text-sm mb-3">${blogEsc(p.dek)}</p>` : ''}
            <div class="text-xs text-gray-400 font-bold uppercase tracking-wide">${p.fecha_publicacion ? new Date(p.fecha_publicacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} · ${blogReadingTime(p.cuerpo_md)} min de lectura</div>
        </article>`).join('\n')
        : `<p class="text-gray-400 text-sm">Todavía no hay artículos publicados en esta categoría.</p>`;

    const catFilters = cats.map(c => `<a href="/blog/${c.slug === catSlug ? '' : '?categoria=' + encodeURIComponent(c.slug)}" class="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${c.slug === catSlug ? 'text-white' : 'text-gray-500 border-gray-200'}" style="${c.slug === catSlug ? `background:${BLOG_BRAND.primary};border-color:${BLOG_BRAND.primary}` : ''}">${blogEsc(c.nombre)}</a>`).join('');

    const html = `<!doctype html><html lang="es"><head>${blogBaseHead({
        title: cat ? `${cat.nombre} — Blog de MédicoEstético.Marketing` : 'Blog — MédicoEstético.Marketing',
        description: 'Recursos, estrategia y autoridad digital para médicos y clínicas estéticas.',
        canonical
    })}</head>
    <body class="bg-white text-brand-secondary font-sans antialiased">
        ${blogHeader()}
        <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="mb-10">
                <span class="text-sm font-black uppercase tracking-widest" style="color:${BLOG_BRAND.primary}">Centro de conocimiento</span>
                <h1 class="text-4xl lg:text-5xl font-display font-black mt-2 mb-4">Blog</h1>
                <p class="text-gray-500 max-w-xl">Recursos para hacer crecer tu práctica: captación de pacientes, publicidad médica, SEO y regulación — sin genéricos, sin relleno.</p>
            </div>
            <div class="flex flex-wrap gap-2 mb-10">
                <a href="/blog/" class="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${!catSlug ? 'text-white' : 'text-gray-500 border-gray-200'}" style="${!catSlug ? `background:${BLOG_BRAND.primary};border-color:${BLOG_BRAND.primary}` : ''}">Todas</a>
                ${catFilters}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${cards}</div>
        </main>
        ${blogFooter()}
    </body></html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function renderBlogPost(env, slug) {
    const db = env.BLOG_DB;
    const post = await db.prepare("SELECT * FROM blog_posts WHERE slug=? AND estado='PUBLISHED'").bind(slug).first();
    if (!post) return new Response('Artículo no encontrado', { status: 404 });

    const category = post.category_id ? await db.prepare("SELECT * FROM blog_categories WHERE id=?").bind(post.category_id).first() : null;
    const pilar = post.pilar_post_id ? await db.prepare("SELECT slug, titulo FROM blog_posts WHERE id=? AND estado='PUBLISHED'").bind(post.pilar_post_id).first() : null;

    const relacionados = (await db.prepare(
        `SELECT slug, titulo, dek FROM blog_posts
         WHERE estado='PUBLISHED' AND id<>? AND (cluster_id=? OR category_id=?)
         ORDER BY fecha_publicacion DESC LIMIT 3`
    ).bind(post.id, post.cluster_id || -1, post.category_id || -1).all()).results;

    const canonical = `${BLOG_SITE}/blog/${post.slug}/`;
    const nextHref = blogNextActionHref(post);
    const nextLabel = BLOG_NEXT_ACTION_LABEL[post.next_action_type] || null;
    const ctaHtml = (nextHref && nextLabel) ? `
            <div class="mt-12 p-6 rounded-[1.5rem] border border-gray-100" style="background:#FDF6F3">
                ${post.next_action_texto ? `<p class="font-bold mb-3">${blogEsc(post.next_action_texto)}</p>` : ''}
                <a href="${blogEsc(nextHref)}" ${/^https?:/.test(nextHref) ? 'target="_blank" rel="noopener noreferrer"' : ''} class="inline-block text-sm font-black uppercase tracking-widest px-5 py-3 rounded-full text-white" style="background:${BLOG_BRAND.primary}">${blogEsc(nextLabel)} →</a>
            </div>` : '';

    // CTA contextual (Fase 5, punto 3): por defecto (next_action_posicion NULL
    // o fuera de rango) el CTA va al final — comportamiento idéntico al de
    // siempre. Solo con una posición válida se parte el cuerpo en dos mitades
    // y el MISMO bloque de CTA (sin cambiar su markup) queda entre ellas.
    const bodyBlocks = blogParseBlocks(blogStripInternalMarkers(post.cuerpo_md || '').replace(/\r\n/g, '\n').split('\n'));
    let articleHtml = null, ctaAlFinal = ctaHtml;
    if (ctaHtml && Number.isInteger(post.next_action_posicion)) {
        const headingIdx = [];
        bodyBlocks.forEach((b, i) => { if (/^<h[23]>/.test(b)) headingIdx.push(i); });
        const n = post.next_action_posicion;
        if (n >= 0 && n < headingIdx.length) {
            const insertAt = n + 1 < headingIdx.length ? headingIdx[n + 1] : bodyBlocks.length;
            const before = bodyBlocks.slice(0, insertAt).join('\n');
            const after = bodyBlocks.slice(insertAt).join('\n');
            articleHtml = `<article class="prose-blog max-w-none">${before}</article>${ctaHtml}${after ? `<article class="prose-blog max-w-none">${after}</article>` : ''}`;
            ctaAlFinal = ''; // ya insertado a mitad de artículo, no repetirlo al final
        }
    }
    if (!articleHtml) articleHtml = `<article class="prose-blog max-w-none">${bodyBlocks.join('\n')}</article>`;

    const jsonLd = {
        '@context': 'https://schema.org', '@type': 'Article',
        headline: post.titulo, description: post.meta_description || post.dek || '',
        author: { '@type': 'Person', name: 'Fernanda Torres' },
        publisher: { '@type': 'Organization', name: 'MédicoEstético.Marketing' },
        datePublished: post.fecha_publicacion, dateModified: post.updated_at, mainEntityOfPage: canonical
    };
    const breadcrumbLd = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: BLOG_SITE + '/' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: BLOG_SITE + '/blog/' },
            { '@type': 'ListItem', position: 3, name: post.titulo, item: canonical }
        ]
    };

    const html = `<!doctype html><html lang="es"><head>${blogBaseHead({
        title: post.meta_title || post.titulo, description: post.meta_description || post.dek || '',
        canonical, ogImage: post.imagen_hero
    })}
    <script type="application/ld+json">${blogJsonLd(jsonLd)}</script>
    <script type="application/ld+json">${blogJsonLd(breadcrumbLd)}</script>
    </head>
    <body class="bg-white text-brand-secondary font-sans antialiased">
        ${blogHeader()}
        <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <nav class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6" aria-label="Breadcrumb">
                <a href="/" class="hover:underline">Inicio</a> / <a href="/blog/" class="hover:underline">Blog</a> / ${category ? blogEsc(category.nombre) : ''}
            </nav>
            <span class="text-sm font-black uppercase tracking-widest" style="color:${BLOG_BRAND.primary}">${category ? blogEsc(category.nombre) : ''}</span>
            <h1 class="text-3xl lg:text-4xl font-display font-black mt-2 mb-3 leading-tight">${blogEsc(post.titulo)}</h1>
            ${post.dek ? `<p class="text-lg text-gray-500 mb-4">${blogEsc(post.dek)}</p>` : ''}
            <div class="text-xs text-gray-400 font-bold uppercase tracking-wide mb-6">${post.fecha_publicacion ? new Date(post.fecha_publicacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} · ${blogReadingTime(post.cuerpo_md)} min de lectura</div>
            ${post.imagen_hero ? `<img src="${blogEsc(post.imagen_hero)}" alt="${blogEsc(post.titulo)}" class="hero-blog" onerror="this.remove()">` : ''}

            ${articleHtml}

            ${ctaAlFinal}

            ${pilar ? `<p class="mt-10 text-sm"><a href="/blog/${blogEsc(pilar.slug)}/" class="font-bold" style="color:${BLOG_BRAND.primary}">← Ver la guía completa: ${blogEsc(pilar.titulo)}</a></p>` : ''}

            ${relacionados.length ? `
            <div class="mt-16 pt-10 border-t border-gray-100">
                <h2 class="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Artículos relacionados</h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    ${relacionados.map(r => `<a href="/blog/${blogEsc(r.slug)}/" class="block p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                        <p class="font-bold text-sm mb-1">${blogEsc(r.titulo)}</p>
                        ${r.dek ? `<p class="text-xs text-gray-400">${blogEsc(r.dek)}</p>` : ''}
                    </a>`).join('')}
                </div>
            </div>` : ''}
        </main>
        ${blogFooter()}
    </body></html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function renderBlogSitemap(env) {
    const db = env.BLOG_DB;
    const posts = (await db.prepare("SELECT slug, updated_at FROM blog_posts WHERE estado='PUBLISHED'").all()).results;
    const urls = [
        `<url><loc>${BLOG_SITE}/blog/</loc><changefreq>daily</changefreq></url>`,
        ...posts.map(p => `<url><loc>${BLOG_SITE}/blog/${blogEsc(p.slug)}/</loc><lastmod>${(p.updated_at || '').slice(0, 10)}</lastmod></url>`)
    ].join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

function renderRobotsTxt() {
    const txt = `User-agent: *\nAllow: /\n\nSitemap: ${BLOG_SITE}/sitemap-blog.xml\n`;
    return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

// ── Router principal ──────────────────────────────────────────────────────────
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path === '/api/diagnostico-cliente')  return handleDiagnosticoCliente(request, env);
        if (path === '/api/aceptar-cotizacion')   return handleAceptarCotizacion(request, env);
        if (path === '/api/guardar-reporte')       return handleGuardarReporte(request, env);
        if (path === '/api/obtener-reporte')       return handleObtenerReporte(request, env);

        if (path === '/blog' || path === '/blog/')       return renderBlogIndex(env, url);
        const mPost = path.match(/^\/blog\/([a-z0-9-]+)\/?$/);
        if (mPost)                                        return renderBlogPost(env, mPost[1]);
        if (path === '/sitemap-blog.xml')                 return renderBlogSitemap(env);
        if (path === '/robots.txt')                        return renderRobotsTxt();

        // Para todo lo demás, servir archivos estáticos
        return env.ASSETS.fetch(request);
    }
};
