// Cloudflare Pages Function — guardar y recuperar cotizaciones por folio
// KV namespace binding requerido: QUOTES (configurar en Cloudflare Dashboard)

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
    const { env, request, params } = context;
    const folio = params.folio?.[0];

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }

    if (!folio) {
        return new Response('Folio requerido', { status: 400, headers: CORS });
    }

    // KV no enlazado → falla limpiamente (cotizador usa fallback hash)
    if (!env.QUOTES) {
        return new Response(JSON.stringify({ error: 'storage_unavailable' }), {
            status: 503,
            headers: { ...CORS, 'Content-Type': 'application/json' },
        });
    }

    // POST /api/q/:folio → guardar cotización (90 días)
    if (request.method === 'POST') {
        const body = await request.text();
        await env.QUOTES.put(folio, body, { expirationTtl: 60 * 60 * 24 * 90 });
        return new Response('OK', { headers: CORS });
    }

    // GET /api/q/:folio → recuperar cotización
    if (request.method === 'GET') {
        const data = await env.QUOTES.get(folio);
        if (!data) {
            return new Response(JSON.stringify({ error: 'not_found' }), {
                status: 404,
                headers: { ...CORS, 'Content-Type': 'application/json' },
            });
        }
        return new Response(data, {
            headers: { ...CORS, 'Content-Type': 'application/json' },
        });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
}
