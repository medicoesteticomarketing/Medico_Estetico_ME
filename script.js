/**
 * MédicoEstético.Marketing — Conversion Machine
 * script.js
 *
 * Modules:
 *  1. Fade-in observer (60fps, unobserve after trigger)
 *  2. Navbar scroll shadow
 *  3. FAQ accordion (ARIA-compliant)
 *  4. Conversion Modal (IntersectionObserver on footer, once per session)
 *  5. Social Proof Toasts (6s visible / 2min pause cycle)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. FADE-IN OBSERVER ────────────────────────────────────────────────
    const fadeObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => fadeObs.observe(el));


    // ── 2. NAVBAR SCROLL SHADOW ────────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('shadow-md', window.scrollY > 10);
        }, { passive: true });
    }


    // ── 3. FAQ ACCORDION ──────────────────────────────────────────────────
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn     = item.querySelector('.faq-button');
        const content = item.querySelector('.faq-content');
        if (!btn || !content) return;

        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';

            // Close all
            document.querySelectorAll('.faq-button').forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                const c = b.closest('.faq-item')?.querySelector('.faq-content');
                if (c) c.style.maxHeight = null;
            });

            // Open clicked if it was closed
            if (!isOpen) {
                btn.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });


    // ── 4. CONVERSION MODAL ────────────────────────────────────────────────
    const modal      = document.getElementById('conversion-modal');
    const btnClose   = document.getElementById('modal-close');
    const btnSkip    = document.getElementById('modal-skip');
    const footer     = document.getElementById('footer');
    const SESSION_KEY = 'me_modal_shown';

    let modalShown = sessionStorage.getItem(SESSION_KEY) === '1';

    const openModal = () => {
        if (modalShown) return;
        modalShown = true;
        sessionStorage.setItem(SESSION_KEY, '1');

        modal.removeAttribute('hidden');
        // Two rAF frames ensure the browser has painted before adding the
        // transition class, preventing the element from appearing mid-transition.
        requestAnimationFrame(() => requestAnimationFrame(() => {
            modal.classList.add('modal-visible');
        }));

        document.body.style.overflow = 'hidden';
        btnClose.focus();
    };

    const closeModal = () => {
        modal.classList.remove('modal-visible');
        document.body.style.overflow = '';
        modal.addEventListener('transitionend', () => {
            modal.setAttribute('hidden', '');
        }, { once: true });
    };

    // Trigger: when footer enters viewport
    if (!modalShown && footer && modal) {
        const footerObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    openModal();
                    footerObs.disconnect();
                }
            });
        }, { threshold: 0.1 });
        footerObs.observe(footer);
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnSkip)  btnSkip.addEventListener('click', closeModal);

    // Click outside glass pane
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });
    }

    // Keyboard: Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeModal();
    });


    // ── 5. SOCIAL PROOF TOASTS ─────────────────────────────────────────────
    const TOAST_DATA = [
        { initials: 'AV', name: 'Dr. Andrés V.',     text: 'Acaba de consultar sobre Facebook Ads 🎯' },
        { initials: 'CL', name: 'Clínica Lumina',    text: 'Solicitó estrategia de Instagram ✨' },
        { initials: 'SM', name: 'Dra. Sofía M.',      text: 'Preguntó por el plan de Branding 💄' },
        { initials: 'RB', name: 'Dr. Ricardo B.',     text: 'Agendó su diagnóstico gratuito 📅' },
        { initials: 'CK', name: 'Centro Estético K',  text: 'Consultó sobre Google Ads 🔍' },
        { initials: 'PE', name: 'Dra. Paulina E.',    text: 'Inició su estrategia integral 🚀' },
        { initials: 'MH', name: 'Dr. Marco H.',       text: 'Aprovechó el 20% de descuento 💖' },
        { initials: 'CR', name: 'Clínica Roseé',      text: 'Solicitó info de Instagram Strategy 📱' },
        { initials: 'EO', name: 'Dra. Elena O.',      text: 'Reservó su plaza este mes 🗓️' },
        { initials: 'FL', name: 'Dr. Fernando L.',    text: 'Está revisando los planes disponibles 👀' },
    ];

    const toastContainer = document.getElementById('toast-container');
    let toastIndex       = 0;
    let activeToast      = null;

    const dismissToast = (el) => {
        if (!el) return;
        el.classList.remove('toast-show');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
        if (activeToast === el) activeToast = null;
    };

    const showNextToast = () => {
        if (!toastContainer) return;

        const data = TOAST_DATA[toastIndex % TOAST_DATA.length];
        toastIndex++;

        // Dismiss any still-visible toast
        dismissToast(activeToast);

        const el = document.createElement('div');
        el.className = 'toast-item';
        el.setAttribute('aria-label', `${data.name}: ${data.text}`);
        el.innerHTML = `
            <div class="toast-avatar" aria-hidden="true">${data.initials}</div>
            <div class="toast-body">
                <span class="toast-name">${data.name}</span>
                <span class="toast-text">${data.text}</span>
            </div>
            <div class="toast-dot" aria-hidden="true"></div>`;

        toastContainer.appendChild(el);
        activeToast = el;

        // Animate in (two rAF frames)
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('toast-show')));

        // Auto-dismiss after 6 s, then wait 2 min before next
        setTimeout(() => {
            dismissToast(el);
            setTimeout(showNextToast, 2 * 60 * 1000); // 2 min pause
        }, 6000);
    };

    // First toast after 4 s page load
    setTimeout(showNextToast, 4000);


    // ── 9. COOKIE CONSENT ────────────────────────────────────────────────
    const cookieBar       = document.getElementById('cookie-bar');
    const cookieAcceptBtn = document.getElementById('cookie-accept-btn');
    const COOKIE_KEY      = 'me_cookies_accepted';

    if (cookieBar && !localStorage.getItem(COOKIE_KEY)) {
        cookieBar.removeAttribute('hidden');
        // Aparece 2 s después de carga para no saturar al usuario
        setTimeout(() => cookieBar.classList.add('cookie-visible'), 2000);
    }

    if (cookieAcceptBtn) {
        cookieAcceptBtn.addEventListener('click', () => {
            if (!cookieBar) return;
            cookieBar.classList.remove('cookie-visible');
            cookieBar.addEventListener('transitionend', () => {
                cookieBar.setAttribute('hidden', '');
            }, { once: true });
            localStorage.setItem(COOKIE_KEY, '1');
        });
    }


    // ── 10. PRIVACY POLICY MODAL ─────────────────────────────────────────
    const privacyModal    = document.getElementById('privacy-modal');
    const privacyOpenBtn  = document.getElementById('privacy-open-btn');
    const privacyCloseBtn = document.getElementById('privacy-close-btn');

    // También abrir desde el footer si existe el enlace
    const privacyFooterLink = document.getElementById('privacy-footer-link');

    const openPrivacyModal = () => {
        if (!privacyModal) return;
        privacyModal.removeAttribute('hidden');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            privacyModal.classList.add('privacy-visible');
        }));
        document.body.style.overflow = 'hidden';
        if (privacyCloseBtn) privacyCloseBtn.focus();
    };

    const closePrivacyModal = () => {
        if (!privacyModal) return;
        privacyModal.classList.remove('privacy-visible');
        document.body.style.overflow = '';
        privacyModal.addEventListener('transitionend', () => {
            privacyModal.setAttribute('hidden', '');
        }, { once: true });
    };

    if (privacyOpenBtn)   privacyOpenBtn.addEventListener('click', openPrivacyModal);
    if (privacyFooterLink) privacyFooterLink.addEventListener('click', e => { e.preventDefault(); openPrivacyModal(); });
    if (privacyCloseBtn)  privacyCloseBtn.addEventListener('click', closePrivacyModal);

    // Click fuera del glass → cerrar
    if (privacyModal) {
        privacyModal.addEventListener('click', e => {
            if (e.target === privacyModal) closePrivacyModal();
        });
    }

    // Escape → cerrar (sin interferir con el modal de conversión)
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && privacyModal && !privacyModal.hasAttribute('hidden')) {
            closePrivacyModal();
        }
    });


    // ── 6. ROI SIMULATOR ──────────────────────────────────────────────────
    const roiSlider   = document.getElementById('roi-slider');
    const roiSvcGroup = document.getElementById('roi-service-group');
    const roiAmount   = document.getElementById('roi-amount');
    const roiPats     = document.getElementById('roi-patients');
    const roiRev      = document.getElementById('roi-revenue');
    const roiRoas     = document.getElementById('roi-roas');

    const fmtMXN = n => '$' + Number(n).toLocaleString('es-MX');

    const updateSliderFill = () => {
        if (!roiSlider) return;
        const pct = ((roiSlider.value - roiSlider.min) / (roiSlider.max - roiSlider.min)) * 100;
        roiSlider.style.setProperty('--fill-pct', pct.toFixed(2) + '%');
    };

    const getActiveTicket = () => {
        const active = roiSvcGroup && roiSvcGroup.querySelector('.roi-svc-btn--active');
        return parseInt(active ? active.dataset.value : '6000');
    };

    const calcROI = () => {
        if (!roiSlider) return;
        const inv    = parseInt(roiSlider.value);
        const ticket = getActiveTicket();
        const CPL    = 350;     // costo por lead promedio sector estético (MXN)
        const conv   = 0.267;   // 26.7% leads → pacientes agendados
        const leads    = inv / CPL;
        const patients = Math.round(leads * conv);
        const revenue  = patients * ticket;
        const roas     = (revenue / inv).toFixed(1);

        if (roiAmount) roiAmount.textContent = fmtMXN(inv) + ' MXN';
        if (roiPats)   roiPats.textContent   = patients;
        if (roiRev)    roiRev.textContent    = fmtMXN(revenue);
        if (roiRoas)   roiRoas.textContent   = roas + 'x';
        updateSliderFill();
    };

    if (roiSlider) {
        roiSlider.addEventListener('input', calcROI, { passive: true });
    }

    // Botones de servicio — selección exclusiva (Versión A)
    if (roiSvcGroup) {
        roiSvcGroup.querySelectorAll('.roi-svc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                roiSvcGroup.querySelectorAll('.roi-svc-btn').forEach(b => {
                    b.classList.remove('roi-svc-btn--active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('roi-svc-btn--active');
                btn.setAttribute('aria-pressed', 'true');
                calcROI();
            });
        });
        roiSvcGroup.querySelectorAll('.roi-svc-btn').forEach(b => {
            b.setAttribute('aria-pressed', b.classList.contains('roi-svc-btn--active') ? 'true' : 'false');
        });
    }

    // ── 6B. ROI SIMULATOR — VERSIÓN B (dropdown) ──────────────────────
    const roi2Slider   = document.getElementById('roi2-slider');
    const roi2SvcGroup = document.getElementById('roi2-service-group');
    const roi2Amount   = document.getElementById('roi2-amount');
    const roi2Pats     = document.getElementById('roi2-patients');
    const roi2Rev      = document.getElementById('roi2-revenue');
    const roi2Roas     = document.getElementById('roi2-roas');

    const updateSlider2Fill = () => {
        if (!roi2Slider) return;
        const pct = ((roi2Slider.value - roi2Slider.min) / (roi2Slider.max - roi2Slider.min)) * 100;
        roi2Slider.style.setProperty('--fill-pct', pct.toFixed(2) + '%');
    };

    const calcROI2 = () => {
        if (!roi2Slider) return;
        const inv    = parseInt(roi2Slider.value);
        const ticket = parseInt(roi2SvcGroup ? roi2SvcGroup.value : '6000');
        const CPL    = 350;
        const conv   = 0.267;
        const leads    = inv / CPL;
        const patients = Math.round(leads * conv);
        const revenue  = patients * ticket;
        const roas     = (revenue / inv).toFixed(1);

        if (roi2Amount) roi2Amount.textContent = fmtMXN(inv) + ' MXN';
        if (roi2Pats)   roi2Pats.textContent   = patients;
        if (roi2Rev)    roi2Rev.textContent    = fmtMXN(revenue);
        if (roi2Roas)   roi2Roas.textContent   = roas + 'x';
        updateSlider2Fill();
    };

    if (roi2Slider)   roi2Slider.addEventListener('input', calcROI2, { passive: true });
    if (roi2SvcGroup) roi2SvcGroup.addEventListener('change', calcROI2);
    if (roi2Slider)   calcROI2();

    if (roiSlider) calcROI(); // inicializar con valores por defecto


    // ── 7. LEAD FORM → WHATSAPP ───────────────────────────────────────────
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', e => {
            e.preventDefault();
            const nombre      = document.getElementById('f-nombre').value.trim();
            const especialidad = document.getElementById('f-especialidad').value;
            const whatsapp    = document.getElementById('f-whatsapp').value.trim();
            const email       = document.getElementById('f-email').value.trim();
            const reto        = document.getElementById('f-reto').value.trim();

            if (!nombre || !especialidad || !whatsapp) {
                alert('Por favor completa los campos obligatorios.');
                return;
            }

            const msg = [
                'Hola Fernanda, solicito mi diagnóstico gratuito:',
                '',
                '👤 *Nombre:* ' + nombre,
                '🏥 *Especialidad:* ' + especialidad,
                '📱 *WhatsApp:* ' + whatsapp,
                '📧 *Email:* ' + email,
                '🎯 *Principal reto:* ' + reto,
                '',
                '¡Espero tu respuesta! 💖'
            ].join('\n');

            window.open('https://wa.me/524425500232?text=' + encodeURIComponent(msg), '_blank');
        });
    }


    // ── 8. STICKY BOTTOM BANNER + COUNTDOWN ──────────────────────────────
    const stickyBanner = document.getElementById('sticky-bottom');
    const stickyClose  = document.getElementById('sticky-bottom-close');
    const BANNER_KEY   = 'me_banner_closed';
    const TIMER_KEY    = 'me_timer_start';

    // Countdown: 24 h desde primera visita de la sesión
    const timerStart = parseInt(sessionStorage.getItem(TIMER_KEY) || Date.now());
    sessionStorage.setItem(TIMER_KEY, String(timerStart));
    const timerEnd = timerStart + 24 * 60 * 60 * 1000;

    const timerH = document.getElementById('timer-h');
    const timerM = document.getElementById('timer-m');
    const timerS = document.getElementById('timer-s');

    const updateCountdown = () => {
        const rem = Math.max(0, timerEnd - Date.now());
        const h = Math.floor(rem / 3600000);
        const m = Math.floor((rem % 3600000) / 60000);
        const s = Math.floor((rem % 60000) / 1000);
        if (timerH) timerH.textContent = String(h).padStart(2, '0');
        if (timerM) timerM.textContent = String(m).padStart(2, '0');
        if (timerS) timerS.textContent = String(s).padStart(2, '0');
    };
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Mostrar banner tras 3 s (solo si no fue cerrado en esta sesión)
    if (stickyBanner && !sessionStorage.getItem(BANNER_KEY)) {
        setTimeout(() => {
            stickyBanner.classList.add('sb-visible');
            document.body.classList.add('has-sticky-banner');
        }, 3000);
    }

    // Cerrar banner
    if (stickyClose) {
        stickyClose.addEventListener('click', () => {
            if (stickyBanner) stickyBanner.classList.remove('sb-visible');
            document.body.classList.remove('has-sticky-banner');
            sessionStorage.setItem(BANNER_KEY, '1');
        });
    }

});
