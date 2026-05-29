// Cloudflare Pages Function — Guardar diagnóstico en KV y generar link
// Variables de entorno requeridas: REPORTES (KV Namespace), SITE_URL

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
    const { env, request } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    let data;
    try {
        data = await request.json();
    } catch {
        return new Response(JSON.stringify({ ok: false, error: 'Datos inválidos' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    const { contenido, doctor, especialidad } = data;

    if (!contenido || contenido.trim().length < 50) {
        return new Response(JSON.stringify({ ok: false, error: 'El contenido está vacío o muy corto' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    // ── Generar número secuencial ──────────────────────────────────────────
    const contadorActual = await env.REPORTES.get('__contador__');
    const siguiente      = contadorActual ? parseInt(contadorActual) + 1 : 1;
    await env.REPORTES.put('__contador__', String(siguiente));

    const id = `ME-${String(siguiente).padStart(3, '0')}`; // ME-001, ME-002 ...

    const payload = JSON.stringify({
        contenido:    contenido.trim(),
        doctor:       doctor       || 'Doctor',
        especialidad: especialidad || '',
        fecha:        new Date().toISOString(),
    });

    // Guardar en KV con TTL de 60 días (el contador no expira)
    await env.REPORTES.put(id, payload, { expirationTtl: 60 * 60 * 24 * 60 });

    const siteUrl = env.SITE_URL || 'https://medico-estetico-me.pages.dev';
    const url = `${siteUrl}/reporte.html?id=${id}`;

    return new Response(JSON.stringify({ ok: true, id, url }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
    });
}
