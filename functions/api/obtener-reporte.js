// Cloudflare Pages Function — Obtener diagnóstico del KV por ID
// Variables de entorno requeridas: REPORTES (KV Namespace)

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
    const { env, request } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const id  = url.searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ ok: false, error: 'ID requerido' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    const data = await env.REPORTES.get(id);

    if (!data) {
        return new Response(JSON.stringify({ ok: false, error: 'Reporte no encontrado o expirado' }), {
            status: 404, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    return new Response(data, {
        headers: { ...CORS, 'Content-Type': 'application/json' }
    });
}
