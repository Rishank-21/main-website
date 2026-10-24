/* ==========================================================================
   THE BLANK STATE — Digital Growth Company
   Interactive Functionality & WhatsApp Lead Automation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initSmoothScroll();
    initServiceTabs();
    initKnowMoreLinks();
    initConsultationForm();
    initActiveNavScroll();
    initScrollReveal();
    initShapeDividers();
    initSplitHeadings();
    initDoodles();
    initWorkFilters();
    initEcosystem();
    initFaqAccordion();
    initYear();
    initServiceIndex();
    initBrandBand();
});

/* --------------------------------------------------------------------------
   Mobile Navigation Toggle
   -------------------------------------------------------------------------- */
function initMobileNav() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (!mobileMenuBtn || !navLinks) return;

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('nav-open');
        const isOpen = navLinks.classList.contains('nav-open');
        mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when clicking on any link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('nav-open');
        });
    });
}

/* --------------------------------------------------------------------------
   FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!question || !answer) return;

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            items.forEach(other => {
                other.classList.remove('open');
                const otherAnswer = other.querySelector('.faq-answer');
                const otherQuestion = other.querySelector('.faq-question');
                if (otherAnswer) otherAnswer.style.maxHeight = null;
                if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   "Know More" links — jump from service feature rows into detail tabs
   -------------------------------------------------------------------------- */
function initKnowMoreLinks() {
    document.querySelectorAll('[data-tab-link]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const tabKey = link.getAttribute('data-tab-link');
            const tabBtn = document.querySelector(`.service-tab[data-tab="${tabKey}"]`);
            if (tabBtn) tabBtn.click();
            const tabsWrapper = document.querySelector('.service-tabs-wrapper');
            if (tabsWrapper) {
                const header = document.querySelector('.navbar');
                const offset = (header?.getBoundingClientRect().height || 78) + 16;
                const top = tabsWrapper.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Smooth anchor scrolling with sticky-header offset
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            const target = targetId ? document.querySelector(targetId) : null;
            if (!target) return;
            event.preventDefault();
            const header = document.querySelector('.navbar');
            const offset = (header?.getBoundingClientRect().height || 78) + 16;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
            window.history.replaceState(null, '', targetId);
            window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        });
    });
}

/* --------------------------------------------------------------------------
   Service Tabs Switching
   -------------------------------------------------------------------------- */
function initServiceTabs() {
    const tabButtons = document.querySelectorAll('.service-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    if (!tabButtons.length || !tabPanels.length) return;

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Deactivate all buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch active panel
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `tab-${targetTab}`) {
                    panel.classList.add('active');
                }
            });
        });
    });

    // Support deep-linking via URL hash (e.g. #tab-sell or #services-sell)
    const hash = window.location.hash;
    if (hash) {
        if (hash.includes('sell') || hash.includes('ecommerce')) {
            switchTab('sell');
        } else if (hash.includes('advertise') || hash.includes('ads')) {
            switchTab('advertise');
        } else if (hash.includes('seo') || hash.includes('maps')) {
            switchTab('seo');
        } else if (hash.includes('social')) {
            switchTab('social');
        }
    }

    function switchTab(tabKey) {
        const btn = document.querySelector(`.service-tab[data-tab="${tabKey}"]`);
        if (btn) btn.click();
    }
}

/* --------------------------------------------------------------------------
   Consultation Form -> Direct WhatsApp Dispatch
   -------------------------------------------------------------------------- */
function initConsultationForm() {
    const form = document.getElementById('consultationForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('clientName')?.value.trim() || 'N/A';
        const company = document.getElementById('clientCompany')?.value.trim() || 'N/A';
        const phone = document.getElementById('clientPhone')?.value.trim() || 'N/A';
        const email = document.getElementById('clientEmail')?.value.trim() || 'N/A';
        const message = document.getElementById('clientMessage')?.value.trim() || 'None';

        // Gather checked services
        const checkedServices = [];
        const checkboxes = form.querySelectorAll('input[name="services"]:checked');
        checkboxes.forEach(cb => checkedServices.push(cb.value));
        const servicesStr = checkedServices.length > 0 ? checkedServices.join(', ') : 'General Growth Consultation';

        // Formulate WhatsApp message text
        const textLines = [
            `*New Growth Inquiry — The Blank State Website*`,
            `-------------------------------------------`,
            `*Client Name:* ${name}`,
            `*Company / Business:* ${company}`,
            `*Phone:* ${phone}`,
            `*Email:* ${email}`,
            `*Services Needed:* ${servicesStr}`,
            `*Message / Goals:* ${message}`,
            `-------------------------------------------`,
            `_Sent via theblankstate.com consultation portal_`
        ];

        const encodedText = encodeURIComponent(textLines.join('\n'));
        const targetWhatsAppNumber = '918511410817';
        const whatsappUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodedText}`;

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
    });
}

/* --------------------------------------------------------------------------
   Active Nav Link Highlighting on Scroll
   -------------------------------------------------------------------------- */
function initActiveNavScroll() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Scroll-triggered reveal motion
   -------------------------------------------------------------------------- */
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        '.service-row, .pillar-card, .service-feature-card, .process-step-item, .why-card, .quote-card, .eco-node'
    );
    if (!revealTargets.length) return;

    revealTargets.forEach((element, index) => {
        element.classList.add('reveal-on-scroll');
        element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        revealTargets.forEach(element => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    revealTargets.forEach(element => observer.observe(element));
}

/* --------------------------------------------------------------------------
   Current Year in Footer
   -------------------------------------------------------------------------- */
function initYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}


/* --------------------------------------------------------------------------
   Section shape dividers (wave / zigzag / diagonal / steps / scallop)
   -------------------------------------------------------------------------- */
function initShapeDividers() {
    const dividers = document.querySelectorAll('.section-divider[data-shape]');
    if (!dividers.length) return;

    // Match the neighbouring sections' own background so no seam line shows
    const solidBg = el => {
        if (!el) return null;
        const c = getComputedStyle(el).backgroundColor;
        return (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') ? null : c;
    };

    const W = 1440, H = 104, BAND = 30;

    // Smooth sine wave: sampled at high resolution so the crest reads as a curve
    const wave = (amp = 24, cycles = 2.25, mid = 46) => {
        const steps = 120;
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * W;
            const y = mid + amp * Math.sin((i / steps) * Math.PI * 2 * cycles - Math.PI / 2);
            pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return `M${pts.join(' L')} L${W},${H} L0,${H} Z`;
    };

    const zigzag = () => {
        const count = 18, step = W / count;
        const pts = [];
        for (let i = 0; i <= count; i++) pts.push(`${(i * step).toFixed(1)},${i % 2 === 0 ? 58 : 22}`);
        return `M${pts.join(' L')} L${W},${H} L0,${H} Z`;
    };

    const diagonal = () => `M0,64 L${W},18 L${W},${H} L0,${H} Z`;

    const steps = () => {
        const count = 7, step = W / count;
        let d = `M0,72`;
        for (let i = 1; i <= count; i++) {
            const y = 72 - i * 7;
            d += ` L${((i - 1) * step).toFixed(1)},${y} L${(i * step).toFixed(1)},${y}`;
        }
        return d + ` L${W},${H} L0,${H} Z`;
    };

    const scallop = () => {
        const count = 12, r = W / count;
        let d = `M0,54`;
        for (let i = 0; i < count; i++) {
            d += ` A${r / 2},${r / 2} 0 0,${i % 2 === 0 ? 1 : 0} ${(i + 1) * r},54`;
        }
        return d + ` L${W},${H} L0,${H} Z`;
    };

    const SHAPES = { wave, zigzag, diagonal, steps, scallop };

    dividers.forEach((el, index) => {
        const build = SHAPES[el.dataset.shape] || wave;
        const path = build();
        const bg = solidBg(el.previousElementSibling) || el.dataset.bg || '#ffffff';
        const fill = solidBg(el.nextElementSibling) || el.dataset.fill || bg;
        const c1 = el.dataset.c1 || '#FF8950';
        const c2 = el.dataset.c2 || '#C191FF';
        const gid = `dv-grad-${index}`;

        el.style.background = bg;
        el.innerHTML =
            `<svg viewBox="0 0 ${W} ${H + BAND}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">` +
            `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">` +
            `<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>` +
            `</linearGradient></defs>` +
            `<path d="${path}" fill="url(#${gid})" opacity="0.9"/>` +
            `<path d="${path}" fill="url(#${gid})" opacity="0.28" transform="translate(0,7)"/>` +
            `<path d="${path}" fill="${fill}" transform="translate(0,${BAND})"/>` +
            `</svg>`;
    });
}

/* --------------------------------------------------------------------------
   SplitText-style word reveal on headings
   -------------------------------------------------------------------------- */
function initSplitHeadings() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = document.querySelectorAll(
        '.section-heading, .service-row-heading, .contact-heading, .footer-cta-line'
    );
    if (!targets.length) return;

    targets.forEach(heading => {
        const groups = [];
        const collect = (node) => {
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const tokens = child.textContent.split(/\s+/).filter(Boolean);
                    if (tokens.length && child.parentNode) groups.push({ node: child, tokens });
                } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('split-word')) {
                    collect(child);
                }
            });
        };
        collect(heading);
        if (!groups.length) return;

        let index = 0;
        groups.forEach(group => {
            const frag = document.createDocumentFragment();
            group.tokens.forEach(token => {
                const outer = document.createElement('span');
                outer.className = 'split-word';
                const inner = document.createElement('span');
                inner.className = 'split-inner';
                inner.style.setProperty('--wd', `${(index++) * 55}ms`);
                inner.textContent = token;
                outer.appendChild(inner);
                frag.appendChild(outer);
                frag.appendChild(document.createTextNode(' '));
            });
            const textNode = group.node;
            textNode.parentNode.insertBefore(frag, textNode);
            textNode.textContent = '';
        });

        heading.classList.add('has-split');

        if (!('IntersectionObserver' in window)) {
            heading.classList.add('split-done');
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('split-done');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.35 });
        observer.observe(heading);
    });
}

/* --------------------------------------------------------------------------
   Hand-drawn line art: stroke-by-stroke draw-in
   -------------------------------------------------------------------------- */
function initDoodles() {
    const doodles = document.querySelectorAll('.doodle');
    if (!doodles.length) return;

    doodles.forEach(doodle => {
        doodle.querySelectorAll('.dl, .dot').forEach((el, i) => {
            el.style.setProperty('--dd', `${i * 85}ms`);
        });
    });

    if (!('IntersectionObserver' in window)) {
        doodles.forEach(doodle => doodle.classList.add('drawn'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('drawn');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.25, rootMargin: '0px 0px -20px 0px' });

    doodles.forEach(doodle => observer.observe(doodle));
}

/* --------------------------------------------------------------------------
   Our Work — category filtering
   -------------------------------------------------------------------------- */
function initWorkFilters() {
    const buttons = document.querySelectorAll('.work-filter');
    const cards = document.querySelectorAll('.work-card');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            cards.forEach(card => {
                const match = filter === 'all' || card.getAttribute('data-cat') === filter;
                card.classList.toggle('is-hidden', !match);
            });
        });
    });
}

/* --------------------------------------------------------------------------
   Service ecosystem — draw hub -> node links, then switch on the live state
   -------------------------------------------------------------------------- */
function initEcosystem() {
    const container = document.querySelector('.ecosystem-container');
    if (!container) return;

    const svg = container.querySelector('.eco-links');
    const hub = container.querySelector('.hub-circle');
    const nodes = container.querySelectorAll('.eco-node');
    const NS = 'http://www.w3.org/2000/svg';

    const draw = () => {
        if (!svg || !hub || !nodes.length) return;
        const box = container.getBoundingClientRect();
        if (box.width < 10) return;

        svg.innerHTML = '';
        svg.setAttribute('viewBox', `0 0 ${box.width.toFixed(0)} ${box.height.toFixed(0)}`);

        const center = (el) => {
            const r = el.getBoundingClientRect();
            return {
                x: r.left - box.left + r.width / 2,
                y: r.top - box.top + r.height / 2,
                top: r.top - box.top,
                bottom: r.bottom - box.top
            };
        };
        const hubPt = center(hub);

        nodes.forEach((node, i) => {
            const pt = center(node);
            const line = document.createElementNS(NS, 'line');
            line.setAttribute('x1', hubPt.x.toFixed(1));
            line.setAttribute('y1', hubPt.bottom.toFixed(1));
            line.setAttribute('x2', pt.x.toFixed(1));
            line.setAttribute('y2', Math.max(pt.top, hubPt.top).toFixed(1));
            line.style.animationDelay = `${i * 0.16}s`;
            svg.appendChild(line);
        });
    };

    draw();
    let raf = null;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
    }, { passive: true });

    if (!('IntersectionObserver' in window)) {
        container.classList.add('is-live');
        return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            container.classList.add('is-live');
            draw();
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.2 });
    observer.observe(container);
}

/* --------------------------------------------------------------------------
   Services sticky index - highlights the row currently in view
   -------------------------------------------------------------------------- */
function initServiceIndex() {
    const links = Array.from(document.querySelectorAll('.svc-index-link'));
    const rows = links
        .map(link => document.getElementById(link.dataset.svcRow))
        .filter(row => !!row);
    if (!links.length || !rows.length) return;

    function setActive(row) {
        links.forEach(link => link.classList.toggle('is-active', link.dataset.svcRow === row.id));
        rows.forEach(r => r.classList.toggle('is-active', r === row));
    }

    setActive(rows[0]);

    links.forEach(link => {
        link.addEventListener('click', () => {
            const row = rows.find(r => r.id === link.dataset.svcRow);
            if (row) setActive(row);
        });
    });

    if (!('IntersectionObserver' in window)) return;

    const visible = new Map();
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) visible.set(entry.target, entry.intersectionRatio);
            else visible.delete(entry.target);
        });
        if (!visible.size) return;
        let best = null;
        let bestRatio = -1;
        visible.forEach((ratio, el) => {
            if (ratio > bestRatio) { bestRatio = ratio; best = el; }
        });
        if (best) setActive(best);
    }, { threshold: [0, 0.25, 0.5, 0.75], rootMargin: '-15% 0px -30% 0px' });

    rows.forEach(row => obs.observe(row));
}

/* --------------------------------------------------------------------------
   Clients band: duplicate the set so the hairline strip can loop seamlessly
   -------------------------------------------------------------------------- */
function initBrandBand() {
    const row = document.querySelector('.brand-band-row');
    if (!row) return;

    Array.from(row.querySelectorAll('.brand-cell')).forEach(cell => {
        const clone = cell.cloneNode(true);
        clone.classList.add('is-clone');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
        row.appendChild(clone);
    });
}
