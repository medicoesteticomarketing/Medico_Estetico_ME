// Cloudflare Pages Function — Proxy para PageSpeed Insights API
// Variable de entorno opcional: PAGESPEED_KEY (aumenta el cupo de consultas)

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

    const reqUrl   = new URL(request.url);
    const siteUrl  = reqUrl.searchParams.get('url');
    const strategy = reqUrl.searchParams.get('strategy') || 'mobile';

    if (!siteUrl) {
        return new Response(JSON.stringify({ error: 'Falta el parámetro url' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    const apiKey = env.PAGESPEED_KEY || '';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(siteUrl)}&strategy=${strategy}${apiKey ? '&key=' + apiKey : ''}`;

    try {
        const res  = await fetch(apiUrl);
        const data = await res.json();

        return new Response(JSON.stringify(data), {
            status: res.status,
            headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Error al consultar PageSpeed: ' + e.message }), {
            status: 502, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }
}
