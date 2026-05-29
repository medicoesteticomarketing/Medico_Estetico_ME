// Cloudflare Workers Function — Aceptación de cotización (médico estético)
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

    const { nombre, email, folio, cliente, empresa, total, mensual, url } = data;

    const siteUrl = env.SITE_URL || 'https://medicoestetico.marketing';

    // ── 1. NOTIFICAR A FERNANDA ───────────────────────────────────────────────
    await enviarEmail(env, {
        to: env.NOTIFY_EMAIL || 'medicoestetico.marketing@gmail.com',
        subject: `✅ ${cliente} aceptó la cotización ${folio} — MédicoEstético.Marketing`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;">
                <div style="background:#0a0a0a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
                    <span style="color:#ff008a;font-size:18px;font-weight:900;letter-spacing:0.06em;">MédicoEstético.Marketing</span>
                </div>
                <div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;">
                    <h2 style="color:#0a0a0a;font-size:20px;margin:0 0 6px;">✅ ¡Cotización Aceptada!</h2>
                    <p style="color:#555;font-size:14px;margin:0 0 20px;"><strong>${cliente}</strong> ha aceptado la cotización <strong>${folio}</strong>.</p>

                    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
                        <tr><td style="padding:8px;font-weight:bold;color:#555;width:38%;">Folio</td><td style="padding:8px;">${folio || '—'}</td></tr>
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Cliente</td><td style="padding:8px;">${cliente || '—'}</td></tr>
                        ${empresa ? `<tr><td style="padding:8px;font-weight:bold;color:#555;">Empresa</td><td style="padding:8px;">${empresa}</td></tr>` : ''}
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Nombre firmante</td><td style="padding:8px;">${nombre || '—'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;color:#555;">Email firmante</td><td style="padding:8px;">${email || '—'}</td></tr>
                        <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;color:#555;">Total Mes 1</td><td style="padding:8px;font-weight:bold;color:#ff008a;">${total || '—'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;color:#555;">Mensual recurrente</td><td style="padding:8px;">${mensual || 'N/A'}</td></tr>
                    </table>

                    ${url ? `<p style="margin:16px 0 0;"><a href="${url}" style="color:#ff008a;font-size:13px;">Ver cotización completa →</a></p>` : ''}
                    <p style="color:#999;font-size:12px;margin-top:20px;">MédicoEstético.Marketing — Aceptación automática de cotización</p>
                </div>
            </div>
        `
    });

    // ── 2. CONFIRMAR AL CLIENTE ───────────────────────────────────────────────
    if (email) {
        const nombreCorto = (nombre || cliente || 'Doctor').split(' ').slice(0, 2).join(' ');
        await enviarEmail(env, {
            to: email,
            subject: `✅ Confirmación: aceptaste la cotización ${folio} — MédicoEstético.Marketing`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:auto;">
                    <div style="background:#0a0a0a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
                        <span style="color:#ff008a;font-size:18px;font-weight:900;letter-spacing:0.06em;">MédicoEstético.Marketing</span>
                    </div>
                    <div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #eee;">
                        <h2 style="color:#0a0a0a;margin:0 0 12px;">¡Excelente decisión, ${nombreCorto}!</h2>
                        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 12px;">
                            Hemos registrado tu aceptación de la cotización <strong>${folio}</strong>
                            por un total de <strong style="color:#ff008a;">${total}</strong>.
                        </p>
                        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px;">
                            Nuestro equipo se pondrá en contacto contigo a la brevedad para
                            coordinar los próximos pasos e iniciar los servicios contratados.
                        </p>
                        <div style="background:#fff0f8;border-left:4px solid #ff008a;padding:16px;border-radius:0 8px 8px 0;margin:0 0 24px;">
                            <p style="margin:0;color:#cc0070;font-weight:bold;font-size:14px;">¿Tienes alguna pregunta?</p>
                            <p style="margin:8px 0 0;color:#555;font-size:13px;">Escríbenos directamente por WhatsApp:</p>
                            <a href="https://wa.me/524425500232" style="color:#ff008a;font-weight:bold;font-size:14px;">+52 442 550 0232</a>
                        </div>
                        <p style="color:#666;font-size:14px;margin:0 0 4px;">Atentamente,</p>
                        <p style="color:#333;font-size:14px;margin:0;"><strong>Fernanda Torres</strong><br>Especialista en Marketing para Medicina Estética<br>MédicoEstético.Marketing</p>
                        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
                        <p style="color:#aaa;font-size:11px;margin:0;">
                            <a href="${siteUrl}" style="color:#ff008a;">medicoestetico.marketing</a> ·
                            hola@medicoestetico.marketing · +52 442 550 0232
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
