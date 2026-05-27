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

});
