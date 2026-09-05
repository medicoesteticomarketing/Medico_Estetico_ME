// Cloudflare Pages Function — Formulario de solicitud de diagnóstico (médico estético)
// Variables de entorno requeridas: BREVO_KEY_DIAGNOSTICO, NOTIFY_EMAIL, SITE_URL

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

    const {
        nombre, email, whatsapp, especialidad, ciudad,
        web, estrategias, redes, objetivo, presupuesto, valorServicio, notas
    } = data;

    const siteUrl = env.SITE_URL || 'https://medico-estetico-me.pages.dev';

    // ── Construir link a diagnostico.html con todos los campos pre-llenados ──
    const diagParams = new URLSearchParams({
        nombre:        nombre        || '',
        especialidad:  especialidad  || '',
        ciudad:        ciudad        || '',
        web:           web           || '',
        estrategias:   estrategias   || '',
        redes:         redes         || '',
        objetivo:      objetivo      || '',
        presupuesto:   presupuesto   || '',
        valorServicio: valorServicio || '',
        notas:         notas         || '',
        email:         email         || '',
        whatsapp:      whatsapp      || '',
    });
    const diagUrl = `${siteUrl}/diagnostico.html?${diagParams.toString()}`;

    // ── 1. NOTIFICAR A FERNANDA con todos los datos ────────────────────────────
    await enviarEmail(env, {
        to: env.NOTIFY_EMAIL || 'medicoestetico.marketing@gmail.com',
        subject: `⚡ Nuevo diagnóstico: ${nombre} — ${especialidad}`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;">
                <div style="background:#0a0a0a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
                    <span style="color:#ff008a;font-size:18px;font-weight:900;letter-spacing:0.06em;">MédicoEstético.Marketing</span>
                </div>
                <div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;">
                    <h2 style="color:#0a0a0a;font-size:20px;margin:0 0 6px;">🩺 Nuevo diagnóstico solicitado</h2>
                    <p style="color:#555;font-size:14px;margin:0 0 20px;">${nombre || '—'} (${especialidad || '—'}) quiere su Diagnóstico Estético Digital 360°</p>

                    <div style="margin-bottom:24px;">
                        <a href="${diagUrl}"
                           style="background:#ff008a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;font-size:15px;">
                            ⚡ Generar Diagnóstico 360° ahora
                        </a>
                    </div>

                    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
                        <tr><td style="padding:8px;font-weight:bold;color:#555;width:38%;">Nombre</td><td style="padding:8px;">${nombre || '—'}</td></tr>
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Email</td><td style="padding:8px;">${email || '—'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;color:#555;">WhatsApp</td><td style="padding:8px;">${whatsapp || '—'}</td></tr>
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Especialidad</td><td style="padding:8px;">${especialidad || '—'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;color:#555;">Ciudad / País</td><td style="padding:8px;">${ciudad || '—'}</td></tr>
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Sitio web</td><td style="padding:8px;">${web || 'No tiene'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;color:#555;">Estrategia actual</td><td style="padding:8px;">${estrategias || 'Ninguna indicada'}</td></tr>
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Redes sociales</td><td style="padding:8px;">${redes || 'No tiene'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;color:#555;">Objetivo principal</td><td style="padding:8px;">${objetivo || '—'}</td></tr>
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Presupuesto</td><td style="padding:8px;">${presupuesto || 'No mencionado'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;color:#555;">Valor de procedimientos</td><td style="padding:8px;">${valorServicio || 'No especificado'}</td></tr>
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Notas adicionales</td><td style="padding:8px;">${notas || '—'}</td></tr>
                    </table>
                    <p style="color:#999;font-size:12px;margin-top:20px;">MédicoEstético.Marketing — Solicitud de diagnóstico automática</p>
                </div>
            </div>
        `
    });

    // ── 2. CONFIRMAR AL MÉDICO ────────────────────────────────────────────────
    if (email) {
        const nombreCorto = (nombre || 'Doctor').split(' ').slice(0, 2).join(' ');
        await enviarEmail(env, {
            to: email,
            subject: `${nombreCorto}, tu Diagnóstico Estético Digital está en preparación 💖`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:auto;">
                    <div style="background:#0a0a0a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
                        <span style="color:#ff008a;font-size:18px;font-weight:900;letter-spacing:0.06em;">MédicoEstético.Marketing</span>
                    </div>
                    <div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;">
                        <h2 style="color:#0a0a0a;margin:0 0 12px;">¡Perfecto, ${nombreCorto}!</h2>
                        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 12px;">
                            Hemos recibido toda la información necesaria para preparar tu
                            <strong>Diagnóstico de Autoridad Estética Digital 360°</strong>.
                        </p>
                        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px;">
                            Nuestro equipo lo analizará y recibirás tu diagnóstico personalizado
                            en las próximas <strong>24 horas hábiles</strong>.
                        </p>
                        <div style="background:#fff0f8;border-left:4px solid #ff008a;padding:16px;border-radius:0 8px 8px 0;margin:0 0 24px;">
                            <p style="margin:0;color:#cc0070;font-weight:bold;font-size:14px;">¿Tienes alguna pregunta?</p>
                            <p style="margin:8px 0 0;color:#555;font-size:13px;">Escríbenos directamente por WhatsApp:</p>
                            <a href="https://wa.me/523329683200" style="color:#ff008a;font-weight:bold;font-size:14px;">+52 33 2968 3200</a>
                        </div>
                        <p style="color:#666;font-size:14px;margin:0 0 4px;">Atentamente,</p>
                        <p style="color:#333;font-size:14px;margin:0;"><strong>Fernanda Torres</strong><br>Especialista en Marketing para Medicina Estética<br>MédicoEstético.Marketing</p>
                        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
                        <p style="color:#aaa;font-size:11px;margin:0;">
                            <a href="${siteUrl}" style="color:#ff008a;">medicoestetico.marketing</a> ·
                            hola@medicoestetico.marketing · +52 33 2968 3200
                        </p>
                    </div>
                </div>
            `
        });
    }

    return new Response(JSON.stringify({ ok: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
    });
}

// ── Helper: enviar email via Brevo API ────────────────────────────────────────
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
