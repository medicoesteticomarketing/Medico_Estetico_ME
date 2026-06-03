// _worker.js — Cloudflare Workers entry point
// Enruta las peticiones /api/* a los handlers correspondientes
// y delega el resto a los activos estáticos

import { onRequest as diagnosticoCliente } from './functions/api/diagnostico-cliente.js';
import { onRequest as aceptarCotizacion  } from './functions/api/aceptar-cotizacion.js';
import { onRequest as guardarReporte     } from './functions/api/guardar-reporte.js';
import { onRequest as obtenerReporte     } from './functions/api/obtener-reporte.js';
import { onRequest as pagespeed          } from './functions/api/pagespeed.js';

const ROUTES = {
    '/api/diagnostico-cliente': diagnosticoCliente,
    '/api/aceptar-cotizacion':  aceptarCotizacion,
    '/api/guardar-reporte':     guardarReporte,
    '/api/obtener-reporte':     obtenerReporte,
    '/api/pagespeed':           pagespeed,
};

export default {
    async fetch(request, env, ctx) {
        const url     = new URL(request.url);
        const handler = ROUTES[url.pathname];

        if (handler) {
            return handler({ request, env, ctx });
        }

        // Todo lo demás → activos estáticos (HTML, CSS, imágenes…)
        return env.ASSETS.fetch(request);
    }
};
