/* ============================================
   BLACK VECTR — Full SPA Application
   Router, Pages, Blog + Projects, Markdown, SEO
   ============================================ */

// ─── Configuration ───────────────────────────
const SITE = {
  name: 'BLACK VECTR',
  tagline: 'Research-Driven Offensive Security',
  url: 'https://blackvectr.com',
  email: 'contact@blackvectr.com',
  year: new Date().getFullYear(),
  assets: 'assets'
};

const PAGE_SIZE = 9;
const APP_BASE = getAppBase();

function getAppBase() {
  if (window.location.protocol === 'file:') return '';
  const scriptPath = document.currentScript?.src ? new URL(document.currentScript.src).pathname : '';
  const suffix = '/assets/js/app.js';
  if (scriptPath.endsWith(suffix)) return scriptPath.slice(0, -suffix.length);
  return '';
}

function stripBase(pathname) {
  if (window.location.protocol === 'file:') return '/';
  if (APP_BASE && (pathname === APP_BASE || pathname.startsWith(APP_BASE + '/'))) {
    return pathname.slice(APP_BASE.length) || '/';
  }
  return pathname || '/';
}

function withBase(path) {
  const clean = path || '/';
  if (!APP_BASE) return clean;
  return clean === '/' ? APP_BASE + '/' : APP_BASE + clean;
}

// ─── Routes ──────────────────────────────────
const ROUTES = {
  '/':         { render: homePage,     title: 'BLACK VECTR — Security Solutions, Research, and Red Teaming',        desc: 'BLACK VECTR builds security solutions across offensive red teaming, penetration testing, security research, tooling, awareness, and incident-focused services.' },
  '/about':    { render: aboutPage,    title: 'About — BLACK VECTR | Research-Led Security Partner',      desc: 'Built by researchers. Growing into a broader security solutions company spanning red teaming, tooling, awareness, and incident-focused capabilities.' },
  '/services': { render: servicesPage, title: 'Services — BLACK VECTR | Red Teaming, Research, and Security Solutions',   desc: 'Offensive red teaming, penetration testing, tooling, security awareness, digital forensics, asset recovery support, and custom security solutions.' },
  '/projects': { render: projectsPage, title: 'Projects — BLACK VECTR | Security Tools & Engineering',    desc: 'Open-source tools, internal platforms, and security engineering projects built by the BLACK VECTR team.' },
  '/blog':     { render: blogPage,     title: 'Research — BLACK VECTR | Security Research & Insights',     desc: 'Technical deep-dives, vulnerability research, and practical security guides from the BLACK VECTR team.' },
  '/contact':  { render: contactPage,  title: 'Contact — BLACK VECTR | Get in Touch',                     desc: 'Reach out for penetration testing, security research, and offensive security services. We respond within 24 hours.' }
};

// ─── Core Functions ──────────────────────────
function renderPage(title, description, html) {
  document.title = title;
  document.getElementById('app').innerHTML = html;
  const meta = document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]');
  meta.forEach(m => m.setAttribute('content', description));
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  normalizeInternalLinks();
  updateActiveLink();
  observeElements();
  hydrateListings();
}

function navigateTo(path) {
  const target = withBase(path);
  if (window.location.pathname !== target) history.pushState({ path }, '', target);
  routePage();
}

function getCleanPath() {
  let p = stripBase(window.location.pathname);
  p = p.replace(/\/index\.html$/, '').replace(/\/$/, '');
  return p || '/';
}

function routePage() {
  const path = getCleanPath();
  updateSEO(path);

  const projMatch = path.match(/^\/projects\/(.+)$/);
  const blogMatch = path.match(/^\/blog\/(.+)$/);
  if (projMatch) { renderMarkdownPost(projMatch[1], 'project'); return; }
  if (blogMatch) { renderMarkdownPost(blogMatch[1], 'blog'); return; }

  // fresh visit to a listing resets to page 1
  if (path === '/blog') listingState['/blog'] = 1;
  if (path === '/projects') listingState['/projects'] = 1;

  const route = ROUTES[path];
  if (route) renderPage(route.title, route.desc, route.render());
  else renderPage('Page Not Found — BLACK VECTR', 'The requested page could not be found.', notFoundPage());
}

// ─── Navigation ──────────────────────────────
function updateActiveLink() {
  const path = getCleanPath();
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = stripBase(a.getAttribute('href') || '/');
    const active = href === '/' ? path === '/' : (path === href || path.startsWith(href + '/'));
    a.classList.toggle('active', active);
  });
}

function normalizeInternalLinks(root = document) {
  root.querySelectorAll('a[href^="/"]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('//')) return;
    a.setAttribute('href', withBase(stripBase(href)));
  });
}

function setupNavigation() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || link.hasAttribute('download') || link.hasAttribute('target')) return;
    e.preventDefault();
    if (href.startsWith('/')) navigateTo(stripBase(href));
  });
  window.addEventListener('popstate', routePage);
  document.getElementById('mobileToggle')?.addEventListener('click', () => {
    document.getElementById('mobileNav').classList.toggle('hidden');
  });
  document.querySelectorAll('.mobile-close, .mobile-link').forEach(el => {
    el.addEventListener('click', () => document.getElementById('mobileNav').classList.add('hidden'));
  });
}

// ─── Shared UI helpers ───────────────────────
function pageHeader(eyebrow, titleHtml, sub) {
  return `
    <section class="relative overflow-hidden pt-28 sm:pt-36 pb-14 sm:pb-20">
      <div class="grid-bg"></div>
      <div class="glow-red" style="width:440px;height:440px;top:-180px;left:-90px"></div>
      <div class="relative max-w-6xl mx-auto px-5 sm:px-8">
        <span class="eyebrow">${eyebrow}</span>
        <h1 class="page-title mt-5 mb-4 max-w-3xl">${titleHtml}</h1>
        ${sub ? `<p class="text-white/55 max-w-xl leading-relaxed text-base">${sub}</p>` : ''}
      </div>
    </section>`;
}

// =============================================
// PAGE TEMPLATES
// =============================================

function homePage() {
  return `
    <section class="hero-shell relative min-h-screen flex items-center justify-center overflow-hidden text-center">
      <div class="hero-bg"></div>
      <div class="grid-bg opacity-40"></div>
      <div class="glow-red" style="width:min(760px,90vw);height:520px;top:-100px;left:50%;transform:translateX(-50%);opacity:.32"></div>
      <div class="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 w-full pt-28 pb-20">
        <div class="hero-copy">
          <div class="fade-in flex justify-center">
            <span class="hero-pill">
              <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-red"></span></span>
              ${SITE.tagline}
            </span>
          </div>
          <h1 class="hero-title mt-7 mb-6 fade-in delay-1">Professional offensive security for modern organizations.</h1>
          <p class="hero-lead text-base sm:text-lg leading-relaxed fade-in delay-2">Red teaming, penetration testing, research, and tailored security solutions.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center mt-9 fade-in delay-3">
            <a href="/services" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> View Services</a>
            <a href="/contact" class="btn-ghost"><i class="fa-regular fa-envelope"></i> Contact Our Team</a>
          </div>
          <div class="hero-metrics grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-14 pt-8 border-t border-white/10 fade-in delay-4">
            ${[['Red Teaming','Offensive'],['Security Research','Technical'],['Custom Solutions','Services']].map(([n,l]) => `
              <div class="hero-metric">
                <div class="stat-num text-2xl sm:text-3xl">${n}</div>
                <div class="text-[11px] text-white/50 mt-1 font-mono uppercase tracking-[0.18em]">${l}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/15 text-lg animate-bounce"><i class="fa-solid fa-chevron-down"></i></div>
    </section>

    <section class="py-20 sm:py-28">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16" data-observe>
          <span class="code-label">// Core Capabilities</span>
          <h2 class="h-sec text-3xl sm:text-4xl mt-4 mb-4">More Than Testing. Built for Real Security Outcomes.</h2>
          <div class="section-line"></div>
          <p class="text-white/55 mt-5 text-sm sm:text-base leading-relaxed">We combine offensive operations, research, tool development, awareness, and incident-oriented support so clients can strengthen security from multiple angles, not just one engagement type.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${[
            ['fa-crosshairs', 'Offensive Red Teaming', 'Adversary-style engagements that pressure-test people, process, detection, and response against realistic attack paths.'],
            ['fa-bug', 'Penetration Testing', 'Manual testing across web, API, mobile, cloud, wireless, and internal environments with chained exploit thinking.'],
            ['fa-terminal', 'Security Tooling & Solutions', 'Custom internal tools, automation flows, and engineering support built around your real operational needs.'],
            ['fa-flask', 'Research & Exploit Development', 'Deep technical research, proof-of-concept development, reverse engineering, and novel attack analysis.'],
            ['fa-user-shield', 'Security Awareness', 'Practical awareness programs and adversary-informed education to strengthen human-layer defense.'],
            ['fa-magnifying-glass-location', 'Forensics & Recovery Support', 'Incident-oriented investigation support, evidence preservation, recovery planning, and asset-focused triage as capabilities expand.']
          ].map(([icon, title, desc]) => `
            <div class="card-hover p-6 sm:p-7">
              <div class="w-10 h-10 rounded-lg border border-white/8 flex items-center justify-center text-red mb-4"><i class="fa-solid ${icon}"></i></div>
              <h3 class="font-display text-base font-semibold mb-2">${title}</h3>
              <p class="text-sm text-white/55 leading-relaxed">${desc}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="py-20 sm:py-28 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="flex items-end justify-between mb-12">
          <div>
            <span class="code-label">// Built In-House</span>
            <h2 class="h-sec text-3xl sm:text-4xl mt-3">Research and Tooling</h2>
          </div>
          <a href="/projects" class="btn-ghost text-sm hidden sm:flex">View All <i class="fa-solid fa-arrow-right text-xs"></i></a>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${renderProjectCards(PROJECTS.slice(0, 3))}</div>
        <div class="text-center mt-8 sm:hidden"><a href="/projects" class="btn-ghost text-sm">View All Projects</a></div>
      </div>
    </section>

    <section class="py-20 sm:py-28 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="flex items-end justify-between mb-12">
          <div>
            <span class="code-label">// Latest Research</span>
            <h2 class="h-sec text-3xl sm:text-4xl mt-3">From the Lab</h2>
          </div>
          <a href="/blog" class="btn-ghost text-sm hidden sm:flex">View All <i class="fa-solid fa-arrow-right text-xs"></i></a>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${renderBlogCards(BLOG_POSTS.slice(0, 3))}</div>
        <div class="text-center mt-8 sm:hidden"><a href="/blog" class="btn-ghost text-sm">View All Research</a></div>
      </div>
    </section>

    <section class="py-20 sm:py-28 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 text-center relative overflow-hidden">
        <div class="glow-red" style="width:500px;height:300px;top:-60px;left:50%;transform:translateX(-50%);opacity:.5"></div>
        <h2 class="h-sec text-3xl sm:text-4xl mb-4 relative">Need a security partner that can grow with your mission?</h2>
        <p class="text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed relative">From offensive red teaming and penetration testing to research, tooling, awareness, and future incident-focused services, we’re building BLACK VECTR to support deeper security outcomes over time.</p>
        <a href="/contact" class="btn-primary relative"><i class="fa-regular fa-paper-plane"></i> Plan Your Engagement</a>
      </div>
    </section>`;
}

function aboutPage() {
  return `
    ${pageHeader('// About Us', 'Built by researchers.<br /><span class="text-red">Growing into a wider security practice.</span>', 'BLACK VECTR started in offensive security and is evolving into a broader security solutions company with research, tooling, awareness, and incident-oriented capabilities.')}

    <section class="py-16 sm:py-24">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="grid sm:grid-cols-2 gap-12 sm:gap-16">
          <div>
            <h2 class="h-sec text-2xl sm:text-3xl mb-5">Our Mission</h2>
            <div class="w-10 h-0.5 bg-red mb-6"></div>
            <p class="text-white/65 leading-relaxed mb-4">BLACK VECTR was founded by practitioners who wanted to build a company around real security work, not checkbox outputs. Our roots are in offensive testing, but our direction is larger: security solutions that help organizations prepare, detect, respond, recover, and improve.</p>
            <p class="text-white/65 leading-relaxed mb-4">We approach each client problem as both an operational challenge and a research challenge. That means understanding the environment, developing tailored methods, and producing work that is useful long after the engagement ends.</p>
            <p class="text-white/65 leading-relaxed">Our long-term vision includes deeper red teaming, forensics support, asset recovery assistance, internal tooling, awareness initiatives, and specialized security programs that expand with the needs of serious organizations.</p>
          </div>
          <div>
            <h2 class="h-sec text-2xl sm:text-3xl mb-5">Our Approach</h2>
            <div class="w-10 h-0.5 bg-red mb-6"></div>
            <div class="space-y-5">
              ${[['01','Mission-Led Engagements','We shape our work around the client’s real risks, business model, and operational pressure points.'],
                 ['02','Offense With Purpose','We use offensive methods to expose gaps that matter, not to generate noise or vanity findings.'],
                 ['03','Build While We Break','Where needed, we design tools, workflows, and supporting assets that make the results more usable for the client team.'],
                 ['04','Capability Expansion','We are intentionally growing toward a broader service line that includes awareness, forensics, recovery support, and more.']].map(([n, t, d]) => `
                <div class="flex gap-4">
                  <span class="text-red font-mono text-sm shrink-0 font-semibold">${n}</span>
                  <div><h3 class="font-display text-sm font-semibold mb-1">${t}</h3><p class="text-sm text-white/55 leading-relaxed">${d}</p></div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="text-center mb-14">
          <span class="code-label">// Focus Areas</span>
          <h2 class="h-sec text-2xl sm:text-3xl mt-3">What We’re Building Around</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${[['fa-crosshairs','Red Teaming','Adversary emulation, attack path analysis, and control validation'],
             ['fa-screwdriver-wrench','Security Solutions','Internal tools, workflow design, and practical operational support'],
             ['fa-brain','Awareness & Readiness','Human-layer education, drills, and resilience-minded preparation'],
             ['fa-magnifying-glass','Forensics & Recovery','Incident investigation support and asset-focused response direction']].map(([i, t, d]) => `
            <div class="card-hover p-6 text-center">
              <div class="text-2xl mb-3 text-red"><i class="fa-solid ${i}"></i></div>
              <h3 class="font-display text-sm font-semibold mb-1">${t}</h3>
              <p class="text-xs text-white/55">${d}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="py-20 sm:py-28 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 text-center">
        <h2 class="h-sec text-2xl sm:text-3xl mb-4">Work with us</h2>
        <p class="text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">If you need an offensive partner today and a broader security ally tomorrow, BLACK VECTR is being built for exactly that path.</p>
        <a href="/contact" class="btn-primary"><i class="fa-regular fa-envelope"></i> Get in Touch</a>
      </div>
    </section>`;
}

function servicesPage() {
  return `
    ${pageHeader('// What We Do', 'Security services that start with offense<br /><span class="text-red">and expand into solutions.</span>', 'BLACK VECTR delivers research-led offensive work today while building toward a broader security practice that includes awareness, forensics, recovery support, and specialized security programs.')}

    <section class="py-16 sm:py-24">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="grid sm:grid-cols-2 gap-5">
          ${[
            ['fa-crosshairs','Offensive Red Teaming','Our lead service. We simulate realistic adversaries across people, process, applications, infrastructure, and detection workflows to show how a motivated attacker would actually move.',['Adversary Emulation','Attack Paths','Control Validation','Purple Teaming']],
            ['fa-shield','Penetration Testing','Manual-first testing for web, mobile, API, cloud, internal, and hybrid environments with a focus on exploitability, chained weaknesses, and business impact.',['Web','API','Cloud','Internal']],
            ['fa-terminal','Research & Tool Development','We research attack surfaces, build proof-of-concepts, and create internal tools or custom security workflows that help teams move faster with less noise.',['PoC Development','Internal Tools','Automation','Reverse Engineering']],
            ['fa-user-shield','Security Awareness','Awareness that is grounded in real attacker behavior, not generic slides. We help teams build sharper instincts, better reporting habits, and stronger everyday security judgment.',['Leadership Briefings','Team Sessions','Threat Education','Readiness']],
            ['fa-magnifying-glass-location','Digital Forensics Support','As our practice expands, we are building incident-focused capabilities for evidence handling, investigative support, attack reconstruction, and post-incident clarity.',['Evidence Review','Timeline Analysis','Incident Support','Case Triage']],
            ['fa-life-ring','Asset Recovery Support','For organizations facing fraud, compromise, or operational loss, we are expanding into structured support for asset tracing, coordination, and recovery-oriented workflows.',['Recovery Planning','Tracing Support','Partner Coordination','Escalation Support']]
          ].map(([icon, title, desc, tags]) => `
            <div class="card-hover p-7 sm:p-8">
              <div class="w-11 h-11 rounded-lg border border-white/8 flex items-center justify-center text-red mb-5"><i class="fa-solid ${icon}"></i></div>
              <h2 class="font-display text-lg font-bold mb-3">${title}</h2>
              <p class="text-sm text-white/55 leading-relaxed mb-5">${desc}</p>
              <div class="flex flex-wrap gap-2">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="py-20 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="max-w-2xl mx-auto text-center mb-12">
          <span class="code-label">// Our Process</span>
          <h2 class="h-sec text-2xl sm:text-3xl mt-3 mb-4">How we engage</h2>
          <p class="text-white/55 text-sm leading-relaxed">A practical model for turning offensive insights into stronger long-term capability.</p>
        </div>
        <div class="grid sm:grid-cols-4 gap-6">
          ${[['1','Scope the Mission','Understand your environment, risk model, business priorities, and likely attacker motivations'],
             ['2','Apply the Right Pressure','Run the right mix of red teaming, testing, research, or awareness activity for the objective'],
             ['3','Translate Into Action','Turn findings into decision-ready outputs, remediation direction, and operational next steps'],
             ['4','Expand Capability','Use each engagement to inform future tooling, readiness, forensics, or recovery support where needed']].map(([n, t, d]) => `
            <div class="text-center">
              <div class="w-11 h-11 rounded-full border border-red/40 flex items-center justify-center mx-auto mb-4 text-red text-sm font-bold font-mono">${n}</div>
              <h3 class="font-display text-sm font-semibold mb-2">${t}</h3>
              <p class="text-xs text-white/55 leading-relaxed">${d}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="py-20 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="max-w-2xl mx-auto text-center mb-12">
          <span class="code-label">// Capability Roadmap</span>
          <h2 class="h-sec text-2xl sm:text-3xl mt-3 mb-4">Where the company is heading</h2>
          <p class="text-white/55 text-sm leading-relaxed">We’re intentionally growing beyond a narrow testing model into a wider security partner for high-trust organizations.</p>
        </div>
        <div class="grid sm:grid-cols-3 gap-5">
          ${[
            ['Now','Offensive Core','Red teaming, penetration testing, exploit research, and technical tooling.'],
            ['Next','Readiness Layer','Security awareness, response preparation, internal process hardening, and practical education.'],
            ['Expanding','Incident & Recovery Support','Forensics-aligned services, asset recovery support, and specialist response capabilities over time.']
          ].map(([phase, title, desc]) => `
            <div class="card-hover p-6 sm:p-7 text-center">
              <div class="code-label mb-3">${phase}</div>
              <h3 class="font-display text-lg font-semibold mb-2">${title}</h3>
              <p class="text-sm text-white/55 leading-relaxed">${desc}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="py-20 sm:py-28 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 text-center">
        <h2 class="h-sec text-2xl sm:text-3xl mb-4">Need something outside a standard pentest?</h2>
        <p class="text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">Tell us whether you need red teaming, custom tooling, awareness support, incident-oriented help, or a roadmap toward broader security capability. We’ll shape the engagement around the outcome, not a template.</p>
        <a href="/contact" class="btn-primary"><i class="fa-regular fa-paper-plane"></i> Discuss Your Requirements</a>
      </div>
    </section>`;
}

function projectsPage() {
  return `
    ${pageHeader('// Projects', 'Tools we build<br /><span class="text-red">to break things.</span>', 'Open-source tools, internal platforms, and security engineering projects from the BLACK VECTR team.')}
    <section class="py-12 sm:py-16">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div id="projectGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="text-center py-12 text-white/20 col-span-full"><i class="fa-solid fa-spinner fa-spin text-xl"></i></div>
        </div>
        <div id="projectPager"></div>
      </div>
    </section>`;
}

function blogPage() {
  return `
    ${pageHeader('// Research', 'Insights from<br /><span class="text-red">the lab.</span>', 'Technical deep-dives, vulnerability research, and practical security guides from the BLACK VECTR team.')}
    <section class="py-12 sm:py-16">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div id="blogGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="text-center py-12 text-white/20 col-span-full"><i class="fa-solid fa-spinner fa-spin text-xl"></i></div>
        </div>
        <div id="blogPager"></div>
      </div>
    </section>`;
}

function contactPage() {
  return `
    <section class="relative overflow-hidden pt-28 sm:pt-36 pb-16">
      <div class="grid-bg"></div>
      <div class="glow-red" style="width:440px;height:440px;top:-180px;right:-90px"></div>
      <div class="relative max-w-6xl mx-auto px-5 sm:px-8">
        <span class="eyebrow">// Contact</span>
        <h1 class="page-title mt-5 mb-4 max-w-3xl">Let's talk about<br /><span class="text-red">the security outcome you need.</span></h1>
        <p class="text-white/55 max-w-2xl leading-relaxed">Whether you're planning a red team, a penetration test, security awareness work, tooling support, or future forensic and recovery-oriented services, we’ll help shape the right next step.</p>
      </div>
    </section>

    <section class="pb-20 sm:pb-28">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="grid sm:grid-cols-5 gap-10 sm:gap-16">
          <div class="sm:col-span-3">
            <form id="contactForm" class="card-hover p-6 sm:p-8">
              <div class="grid sm:grid-cols-2 gap-4 mb-4">
                <div><label for="cname" class="form-label">Name</label><input type="text" id="cname" class="inp" placeholder="Your name" required /></div>
                <div><label for="cemail" class="form-label">Email</label><input type="email" id="cemail" class="inp" placeholder="you@company.com" required /></div>
              </div>
              <div class="mb-4">
                <label for="cinterest" class="form-label">Service Interest</label>
                <select id="cinterest" class="inp">
                  <option value="" selected disabled hidden>Select a service</option>
                  <option>Offensive Red Teaming</option>
                  <option>Penetration Testing</option>
                  <option>Research &amp; Tool Development</option>
                  <option>Security Awareness</option>
                  <option>Digital Forensics Support</option>
                  <option>Asset Recovery Support</option>
                  <option>Custom Security Solutions</option>
                  <option>Other / Not Sure</option>
                </select>
              </div>
              <div class="mb-5">
                <label for="cmsg" class="form-label">Message</label>
                <textarea id="cmsg" class="inp" rows="4" placeholder="Tell us about your project, infrastructure, or security needs..."></textarea>
              </div>
              <button type="submit" class="btn-primary w-full justify-center"><i class="fa-regular fa-paper-plane"></i> Send Message</button>
              <div id="formSuccess" class="hidden mt-4 p-3 rounded bg-red/10 border border-red/25 text-center text-sm text-white/70">
                <i class="fa-regular fa-circle-check mr-1.5 text-red"></i>Thank you. We'll respond within 24 hours.
              </div>
              <p class="text-xs text-white/20 text-center mt-4"><i class="fa-solid fa-lock mr-1"></i> All communications are confidential.</p>
            </form>
          </div>
          <div class="sm:col-span-2 space-y-4">
            ${[['fa-regular fa-envelope','Email','contact@blackvectr.com',null],
               ['fa-solid fa-lock','Encrypted','encrypted@blackvectr.com','PGP: 0xDEADBEEF'],
               ['fa-regular fa-clock','Response Time','< 24 hours',null]].map(([icon, t, v, sub]) => `
              <div class="card-hover p-6">
                <div class="text-red text-lg mb-3"><i class="${icon}"></i></div>
                <h3 class="font-display text-sm font-semibold mb-1">${t}</h3>
                <p class="text-sm text-white/65">${v}</p>
                ${sub ? `<p class="text-xs text-white/25 mt-1 font-mono">${sub}</p>` : ''}
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>`;
}

function notFoundPage() {
  return `
    <div class="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
      <div class="grid-bg"></div>
      <div class="glow-red" style="width:400px;height:400px;top:50%;left:50%;transform:translate(-50%,-50%);opacity:.4"></div>
      <div class="text-center relative">
        <div class="font-display text-7xl font-bold text-red/20 mb-4">404</div>
        <h2 class="h-sec text-2xl font-bold mb-3">Page not found</h2>
        <p class="text-white/55 mb-8 text-sm">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" class="btn-primary"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
      </div>
    </div>`;
}

// =============================================
// CONTENT INDEX (Blog + Projects)
// =============================================

const BLOG_POSTS = [
  { slug: 'sample-blog', title: 'The Art of Manual Penetration Testing', date: '2026-06-15', tags: ['Penetration Testing','Methodology'], excerpt: 'Why automated scanners miss critical vulnerabilities and how manual testing reveals what tools can\'t find.' },
  { slug: 'api-attack-surfaces', title: 'Modern API Attack Surfaces', date: '2026-05-28', tags: ['API Security','Cloud'], excerpt: 'Mapping the growing attack surface of REST, GraphQL, and gRPC APIs in modern cloud-native applications.' },
  { slug: 'firmware-reversing', title: 'Firmware Reversing for Pentesters', date: '2026-04-10', tags: ['IoT','Firmware','Reverse Engineering'], excerpt: 'A practical guide to extracting, analyzing, and exploiting vulnerabilities in embedded device firmware.' },
  { slug: 'exploit-chains', title: 'Building Custom Exploit Chains', date: '2026-03-05', tags: ['Exploit Dev','Red Team'], excerpt: 'Methodology for chaining multiple low-severity vulnerabilities into high-impact exploit chains.' },
  { slug: 'cloud-attack-paths', title: 'Cloud Infrastructure Attack Paths', date: '2026-02-18', tags: ['Cloud','AWS','GCP'], excerpt: 'Common misconfigurations and attack paths in AWS, GCP, and Azure environments.' },
  { slug: 'red-team-methodology', title: 'Red Team Engagement Methodology', date: '2026-01-22', tags: ['Red Team','Methodology'], excerpt: 'How we plan and execute red team operations, from initial recon to final report delivery.' }
];

const PROJECTS = [
  { slug: 'sample-project', title: 'Vantage — Attack Surface Monitor', date: '2026-06-20', status: 'Open Source', tags: ['Recon','Python','Automation'], excerpt: 'Continuous external attack-surface discovery and change monitoring across an organization\'s entire internet-facing footprint.' },
  { slug: 'redlens', title: 'RedLens — Adversary Emulation', date: '2026-06-02', status: 'Internal', tags: ['Red Team','C2','Go'], excerpt: 'A modular adversary-emulation platform for running repeatable, MITRE ATT&CK-mapped red team campaigns.' },
  { slug: 'firmforge', title: 'FirmForge — Firmware Pipeline', date: '2026-05-14', status: 'Open Source', tags: ['IoT','Firmware','Python'], excerpt: 'An automated pipeline that unpacks, analyzes, and diffs firmware images to surface secrets and vulnerable binaries.' },
  { slug: 'cloudbreak', title: 'CloudBreak — Cloud Attack Paths', date: '2026-04-28', status: 'Active', tags: ['Cloud','AWS','Graph'], excerpt: 'Graph-based analysis of IAM and network relationships to reveal exploitable privilege-escalation paths in AWS.' },
  { slug: 'fuzzcore', title: 'FuzzCore — Coverage Fuzzer', date: '2026-04-05', status: 'Research', tags: ['Fuzzing','C','Research'], excerpt: 'A coverage-guided fuzzing harness generator that turns library headers into runnable fuzz targets automatically.' },
  { slug: 'sigmavault', title: 'SigmaVault — Detection Toolkit', date: '2026-03-18', status: 'Open Source', tags: ['Blue Team','Detection','SQL'], excerpt: 'A detection-engineering toolkit for authoring, testing, and version-controlling Sigma rules against real telemetry.' },
  { slug: 'bytesift', title: 'ByteSift — Binary Diffing Suite', date: '2026-02-26', status: 'Internal', tags: ['Reverse Engineering','Rust'], excerpt: 'Fast function-level binary diffing to accelerate patch analysis and 1-day vulnerability discovery.' },
  { slug: 'authstorm', title: 'AuthStorm — SSO Testing Toolkit', date: '2026-02-08', status: 'Open Source', tags: ['AppSec','OAuth','SAML'], excerpt: 'A toolkit for probing OAuth, OIDC, and SAML flows for the misconfigurations that lead to account takeover.' },
  { slug: 'threatgraph', title: 'ThreatGraph — Recon Correlation', date: '2026-01-20', status: 'Active', tags: ['OSINT','Graph','Python'], excerpt: 'Correlates OSINT, DNS, and certificate data into a queryable graph for large-scale reconnaissance.' },
  { slug: 'packetproxy', title: 'PacketProxy — Protocol Interception', date: '2026-01-06', status: 'Open Source', tags: ['Network','Go','Tooling'], excerpt: 'An extensible intercepting proxy for arbitrary binary protocols, with a plugin API for custom codecs.' }
];

// ─── Card renderers (image-less, modern) ─────
function contentCard(base, p, primaryLabel) {
  const date = new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `
    <a href="${base}/${p.slug}" class="card-hover no-underline group flex flex-col p-6">
      <div class="flex items-center gap-2 text-[11px] font-mono text-white/30 mb-4 uppercase tracking-wider">
        <span class="text-red font-medium">${primaryLabel}</span>
        <span class="text-white/15">/</span><span>${date}</span>
      </div>
      <h2 class="font-display text-lg font-semibold text-white/90 group-hover:text-white transition-colors mb-2 leading-snug">${p.title}</h2>
      <p class="text-sm text-white/50 leading-relaxed mb-5 flex-1">${p.excerpt}</p>
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-wrap gap-1.5">${p.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <span class="text-red text-sm opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0"><i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </a>`;
}

function renderBlogCards(posts) {
  return posts.map(p => contentCard('/blog', p, p.tags[0])).join('');
}
function renderProjectCards(posts) {
  return posts.map(p => contentCard('/projects', p, p.status || 'Project')).join('');
}

// ─── Pagination ──────────────────────────────
const listingState = { '/blog': 1, '/projects': 1 };

function paginate(items, page) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const p = Math.min(Math.max(1, page || 1), pages);
  return { slice: items.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE), page: p, pages };
}

function pagerHtml(page, pages) {
  if (pages <= 1) return '';
  let dots = '';
  for (let i = 1; i <= pages; i++) dots += `<button data-page="${i}" class="${i === page ? 'active' : ''}">${i}</button>`;
  return `
    <div class="pager">
      <button data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Previous page"><i class="fa-solid fa-chevron-left text-xs"></i></button>
      ${dots}
      <button data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="Next page"><i class="fa-solid fa-chevron-right text-xs"></i></button>
    </div>`;
}

function renderListing(type) {
  const cfg = type === '/projects'
    ? { items: PROJECTS, gridId: 'projectGrid', pagerId: 'projectPager', cards: renderProjectCards }
    : { items: BLOG_POSTS, gridId: 'blogGrid', pagerId: 'blogPager', cards: renderBlogCards };
  const grid = document.getElementById(cfg.gridId);
  if (!grid) return;
  const { slice, page, pages } = paginate(cfg.items, listingState[type]);
  listingState[type] = page;
  grid.innerHTML = cfg.cards(slice);
  normalizeInternalLinks(grid);
  const pager = document.getElementById(cfg.pagerId);
  if (pager) pager.innerHTML = pagerHtml(page, pages);
}

function hydrateListings() {
  if (document.getElementById('blogGrid')) renderListing('/blog');
  if (document.getElementById('projectGrid')) renderListing('/projects');
}

function setupPager() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.pager button[data-page]');
    if (!btn || btn.disabled) return;
    const type = btn.closest('#projectPager') ? '/projects' : '/blog';
    listingState[type] = parseInt(btn.dataset.page, 10) || 1;
    renderListing(type);
    const gridId = type === '/projects' ? 'projectGrid' : 'blogGrid';
    const top = document.getElementById(gridId);
    if (top) window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  });
}

// =============================================
// MARKDOWN ENGINE (enhanced, multi-language)
// =============================================

const LANG_LABELS = {
  js:'JavaScript', javascript:'JavaScript', ts:'TypeScript', typescript:'TypeScript',
  py:'Python', python:'Python', sh:'Bash', bash:'Bash', shell:'Shell', zsh:'Zsh',
  sql:'SQL', html:'HTML', xml:'XML', css:'CSS', scss:'SCSS', go:'Go', golang:'Go',
  rust:'Rust', rs:'Rust', perl:'Perl', pl:'Perl', c:'C', cpp:'C++', 'c++':'C++',
  ruby:'Ruby', rb:'Ruby', php:'PHP', java:'Java', kotlin:'Kotlin', swift:'Swift',
  json:'JSON', yaml:'YAML', yml:'YAML', toml:'TOML', ini:'INI', diff:'Diff',
  powershell:'PowerShell', ps1:'PowerShell', dockerfile:'Dockerfile', docker:'Dockerfile',
  makefile:'Makefile', nginx:'Nginx', md:'Markdown', markdown:'Markdown',
  graphql:'GraphQL', lua:'Lua', r:'R', text:'Text', plaintext:'Text'
};

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/<[^>]+>/g,'').replace(/&[a-z]+;/g,'')
    .replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
}

let _mdReady = false;
function configureMarked() {
  if (_mdReady || typeof marked === 'undefined') return;
  const renderer = new marked.Renderer();
  const used = {};

  renderer.code = (code, infostring) => {
    if (code && typeof code === 'object') {
      infostring = code.lang || '';
      code = code.text || '';
    }
    const raw = (infostring || '').trim().split(/\s+/)[0].toLowerCase();
    const lang = raw || 'text';
    let out;
    try {
      if (typeof hljs !== 'undefined' && raw && hljs.getLanguage(raw)) {
        out = hljs.highlight(code, { language: raw, ignoreIllegals: true }).value;
      } else if (typeof hljs !== 'undefined') {
        out = hljs.highlightAuto(code).value;
      } else {
        out = escapeHtml(code);
      }
    } catch (e) { out = escapeHtml(code); }
    const label = LANG_LABELS[lang] || lang.toUpperCase();
    return `<div class="code-block" data-lang="${lang}">`
      + `<div class="code-head"><span class="code-lang">${label}</span>`
      + `<button class="code-copy" type="button" aria-label="Copy code"><i class="fa-regular fa-copy"></i> Copy</button></div>`
      + `<pre><code class="hljs language-${lang}">${out}</code></pre></div>`;
  };

  renderer.heading = (text, level) => {
    if (text && typeof text === 'object') {
      level = text.depth;
      text = text.text || '';
    }
    if (level > 3) return `<h${level}>${text}</h${level}>`;
    const base = slugify(text) || 'section';
    let slug = base, i = 1;
    while (used[slug]) slug = base + '-' + (++i);
    used[slug] = 1;
    return `<h${level} id="${slug}"><a href="#${slug}" class="anchor" aria-hidden="true">#</a>${text}</h${level}>`;
  };

  renderer.link = (href, title, text) => {
    if (href && typeof href === 'object') {
      text = href.text || '';
      title = href.title || '';
      href = href.href || '';
    }
    const ext = /^https?:\/\//.test(href || '');
    const t = title ? ` title="${title}"` : '';
    const rel = ext ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${t}${rel}>${text}</a>`;
  };

  marked.setOptions({ renderer, gfm: true, breaks: false, headerIds: false, mangle: false });
  _mdReady = true;
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function simpleMarkdown(md) {
  const lines = md.split('\n');
  const html = [];
  let paragraph = [];
  let list = [];
  let quote = [];
  let inCode = false;
  let codeLang = '';
  let code = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
    list = [];
  };
  const flushQuote = () => {
    if (!quote.length) return;
    html.push(`<blockquote><p>${inlineMarkdown(quote.join(' '))}</p></blockquote>`);
    quote = [];
  };
  const flushBlocks = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  lines.forEach(line => {
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (inCode) {
        const lang = codeLang || 'text';
        html.push(`<div class="code-block" data-lang="${lang}"><div class="code-head"><span class="code-lang">${LANG_LABELS[lang] || lang.toUpperCase()}</span><button class="code-copy" type="button" aria-label="Copy code"><i class="fa-regular fa-copy"></i> Copy</button></div><pre><code>${escapeHtml(code.join('\n'))}</code></pre></div>`);
        inCode = false;
        codeLang = '';
        code = [];
      } else {
        flushBlocks();
        inCode = true;
        codeLang = (fence[1] || 'text').toLowerCase();
      }
      return;
    }
    if (inCode) {
      code.push(line);
      return;
    }
    if (!line.trim()) {
      flushBlocks();
      return;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushBlocks();
      const level = heading[1].length;
      const text = inlineMarkdown(heading[2]);
      const id = slugify(heading[2]) || 'section';
      html.push(`<h${level} id="${id}"><a href="#${id}" class="anchor" aria-hidden="true">#</a>${text}</h${level}>`);
      return;
    }
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      flushQuote();
      list.push(bullet[1]);
      return;
    }
    const blockquote = line.match(/^>\s?(.+)$/);
    if (blockquote) {
      flushParagraph();
      flushList();
      quote.push(blockquote[1]);
      return;
    }
    paragraph.push(line.trim());
  });

  if (inCode) {
    const lang = codeLang || 'text';
    html.push(`<div class="code-block" data-lang="${lang}"><div class="code-head"><span class="code-lang">${LANG_LABELS[lang] || lang.toUpperCase()}</span><button class="code-copy" type="button" aria-label="Copy code"><i class="fa-regular fa-copy"></i> Copy</button></div><pre><code>${escapeHtml(code.join('\n'))}</code></pre></div>`);
  }
  flushBlocks();
  return html.join('');
}

function renderMarkdownHtml(md) {
  try {
    configureMarked();
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
      return enhancePostHtml(marked.parse(md));
    }
  } catch (e) {
    console.warn('Falling back to built-in markdown renderer:', e);
  }
  return enhancePostHtml(simpleMarkdown(md));
}

const CALLOUTS = {
  note:     { icon: 'fa-circle-info',          title: 'Note' },
  tip:      { icon: 'fa-lightbulb',            title: 'Tip' },
  important:{ icon: 'fa-star',                 title: 'Important' },
  warning:  { icon: 'fa-triangle-exclamation', title: 'Warning' },
  caution:  { icon: 'fa-triangle-exclamation', title: 'Caution' },
  danger:   { icon: 'fa-skull-crossbones',     title: 'Danger' }
};

function enhancePostHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  tmp.querySelectorAll('blockquote').forEach(bq => {
    const firstP = bq.querySelector('p');
    if (!firstP) return;
    const m = firstP.textContent.match(/^\s*\[!(\w+)\]/);
    if (!m) return;
    const type = m[1].toLowerCase();
    const cfg = CALLOUTS[type];
    if (!cfg) return;
    firstP.innerHTML = firstP.innerHTML.replace(/^\s*\[!\w+\]\s*(<br\s*\/?>)?\s*/i, '');
    if (!firstP.textContent.trim() && !firstP.querySelector('img,a,code')) firstP.remove();
    const div = document.createElement('div');
    div.className = 'callout ' + type;
    div.innerHTML = `<div class="callout-ico"><i class="fa-solid ${cfg.icon}"></i></div>`
      + `<div class="callout-body"><div class="callout-title">${cfg.title}</div>${bq.innerHTML}</div>`;
    bq.replaceWith(div);
  });

  tmp.querySelectorAll('li').forEach(li => {
    const cb = li.querySelector('input[type="checkbox"]');
    if (!cb) return;
    if (li.parentElement) li.parentElement.classList.add('task-list');
    if (cb.checked) li.classList.add('done');
    cb.remove();
  });

  const fc = tmp.firstElementChild;
  if (fc && fc.tagName === 'P') fc.classList.add('lead');

  return tmp.innerHTML;
}

function buildTOC(host) {
  const heads = host.querySelectorAll('h2[id], h3[id]');
  if (heads.length < 2) return '';
  let items = '';
  heads.forEach(h => {
    const cls = h.tagName === 'H3' ? ' toc-h3' : '';
    const label = h.textContent.replace(/^#/, '').trim();
    items += `<a href="#${h.id}" class="${cls}" data-toc="${h.id}">${label}</a>`;
  });
  return `<div class="toc"><div class="toc-title">On this page</div>${items}</div>`;
}

let _articleScroll = null;
function initArticleUX() {
  const bar = document.getElementById('readProgress');
  const article = document.querySelector('.blog-article');
  const links = Array.from(document.querySelectorAll('.toc a[data-toc]'));
  const heads = links.map(a => document.getElementById(a.dataset.toc)).filter(Boolean);
  if (_articleScroll) window.removeEventListener('scroll', _articleScroll);
  if (!article) return;
  _articleScroll = () => {
    if (bar) {
      const total = article.offsetHeight - window.innerHeight;
      const done = total > 0 ? (window.scrollY - article.offsetTop) / total : 0;
      bar.style.width = Math.min(100, Math.max(0, done * 100)) + '%';
    }
    let cur = null;
    for (const h of heads) if (h.getBoundingClientRect().top <= 120) cur = h;
    links.forEach(a => a.classList.toggle('active', !!cur && a.dataset.toc === cur.id));
  };
  window.addEventListener('scroll', _articleScroll, { passive: true });
  _articleScroll();
}

function setupCodeCopy() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.code-copy');
    if (!btn) return;
    const code = btn.closest('.code-block')?.querySelector('code');
    if (!code) return;
    navigator.clipboard?.writeText(code.innerText).then(() => {
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'; }, 1800);
    }).catch(() => {});
  });
}

// ─── Front matter ────────────────────────────
function parseFrontMatter(md) {
  const fm = {};
  if (md.startsWith('---')) {
    const end = md.indexOf('---', 3);
    if (end > 0) {
      md.substring(3, end).trim().split('\n').forEach(l => {
        const i = l.indexOf(':');
        if (i > 0) {
          const k = l.substring(0, i).trim();
          const v = l.substring(i + 1).trim().replace(/^["']|["']$/g, '');
          fm[k] = v;
        }
      });
    }
  }
  return fm;
}

function stripFrontMatter(md) {
  if (md.startsWith('---')) {
    const end = md.indexOf('---', 3);
    if (end > 0) return md.substring(end + 3).trim();
  }
  return md;
}

// ─── Markdown Post (Blog + Project) ──────────
function projectMetaPanel(fm) {
  const stack = fm.stack ? fm.stack.split(',').map(s => s.trim()).filter(Boolean) : [];
  const rows = [];
  if (fm.status) rows.push(`<div><div class="form-label mb-1">Status</div><div class="text-sm text-red font-medium">${fm.status}</div></div>`);
  if (fm.role)   rows.push(`<div><div class="form-label mb-1">Role</div><div class="text-sm text-white/75">${fm.role}</div></div>`);
  if (stack.length) rows.push(`<div class="sm:col-span-2"><div class="form-label mb-1.5">Stack</div><div class="flex flex-wrap gap-1.5">${stack.map(s => `<span class="tag">${s}</span>`).join('')}</div></div>`);
  const link = fm.link ? `<a href="${fm.link}" target="_blank" rel="noopener noreferrer" class="btn-ghost text-sm mt-1"><i class="fa-brands fa-github"></i> View Repository</a>` : '';
  if (!rows.length && !link) return '';
  return `<div class="card-hover p-5 sm:p-6 mb-8"><div class="grid sm:grid-cols-2 gap-4">${rows.join('')}</div>${link ? `<div class="mt-5">${link}</div>` : ''}</div>`;
}

async function renderMarkdownPost(slug, kind) {
  const isProject = kind === 'project';
  const dir = isProject ? 'projects' : 'blogs';
  const listHref = isProject ? '/projects' : '/blog';
  const listLabel = isProject ? 'Back to Projects' : 'Back to Research';
  const app = document.getElementById('app');
  app.innerHTML = `<div class="max-w-4xl mx-auto px-5 sm:px-8 py-32 text-center text-white/20"><i class="fa-solid fa-spinner fa-spin text-2xl"></i></div>`;

  try {
    const res = await fetch(withBase(`/${dir}/${slug}.md`));
    if (!res.ok) throw new Error('not found');
    const md = await res.text();

    const fm = parseFrontMatter(md);
    const body = stripFrontMatter(md);
    const html = renderMarkdownHtml(body);

    const words = body.replace(/```[\s\S]*?```/g, '').trim().split(/\s+/).filter(Boolean).length;
    const readMins = Math.max(1, Math.round(words / 200));

    document.title = (fm.title || (isProject ? 'Project' : 'Blog Post')) + ' — BLACK VECTR';
    const desc = fm.excerpt || 'BLACK VECTR — research-driven offensive security.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', fm.title || 'BLACK VECTR');
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    const postUrl = SITE.url + listHref + '/' + slug;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', postUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', postUrl);

    const dateStr = fm.date ? new Date(fm.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '';
    const tags = fm.tags ? fm.tags.split(',').map(s => s.trim()).filter(Boolean) : [];
    const cat = isProject ? (fm.status || '') : (tags[0] || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateActiveLink();

    const contentHost = document.createElement('div');
    contentHost.innerHTML = html;
    const toc = buildTOC(contentHost);
    const metaPanel = isProject ? projectMetaPanel(fm) : '';

    app.innerHTML = `
      <div id="readProgress"></div>
      <article class="blog-article max-w-6xl mx-auto px-5 sm:px-8 py-28 sm:py-32">
        <a href="${listHref}" class="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-red transition-colors no-underline mb-8"><i class="fa-solid fa-arrow-left text-xs"></i> ${listLabel}</a>
        <div class="article-grid">
          <div class="min-w-0">
            <header class="mb-8">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/30 mb-4 font-mono uppercase tracking-wider">
                ${cat ? `<span class="text-red">${cat}</span><span class="text-white/15">/</span>` : ''}
                ${dateStr ? `<span>${dateStr}</span>` : ''}
                <span class="text-white/15">/</span><span class="reading-meta"><i class="fa-regular fa-clock text-[10px]"></i> ${readMins} min read</span>
              </div>
              <h1 class="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15]">${fm.title || ''}</h1>
              ${fm.excerpt ? `<p class="text-white/55 mt-4 text-base leading-relaxed">${fm.excerpt}</p>` : ''}
              ${tags.length ? `<div class="flex flex-wrap gap-1.5 mt-4">${tags.map(t => `<span class="tag">${t.replace(/-/g,' ')}</span>`).join('')}</div>` : ''}
              <div class="w-12 h-0.5 bg-red mt-6"></div>
            </header>
            ${metaPanel}
            <div class="post-content">${html}</div>
            <div class="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
              <a href="${listHref}" class="btn-ghost text-sm"><i class="fa-solid fa-arrow-left"></i> ${listLabel}</a>
              <button class="btn-ghost text-sm" id="shareBtn"><i class="fa-solid fa-link"></i> Copy Link</button>
            </div>
          </div>
          <aside class="toc-wrap">${toc}</aside>
        </div>
      </article>`;
    normalizeInternalLinks(app);
    observeElements();
    initArticleUX();
    document.getElementById('shareBtn')?.addEventListener('click', function () {
      navigator.clipboard?.writeText(window.location.href).then(() => {
        this.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        setTimeout(() => { this.innerHTML = '<i class="fa-solid fa-link"></i> Copy Link'; }, 1800);
      }).catch(() => {});
    });
  } catch (e) {
    app.innerHTML = `
      <div class="max-w-4xl mx-auto px-5 sm:px-8 py-32 text-center">
        <div class="text-4xl text-red/30 mb-4"><i class="fa-regular fa-file-lines"></i></div>
        <h2 class="h-sec text-xl font-semibold mb-2">${isProject ? 'Project' : 'Post'} not found</h2>
        <p class="text-white/55 text-sm">The requested ${isProject ? 'project' : 'blog post'} could not be loaded.</p>
        <a href="${listHref}" class="btn-ghost inline-flex mt-6"><i class="fa-solid fa-arrow-left"></i> ${listLabel}</a>
      </div>`;
    normalizeInternalLinks(app);
  }
}

// ─── SEO ─────────────────────────────────────
function updateSEO(path) {
  const fullUrl = path === '/' ? SITE.url : SITE.url + path;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', fullUrl);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', fullUrl);
}

// ─── Scroll Observer ─────────────────────────
function observeElements() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-observe]').forEach(el => observer.observe(el));
  }
}

// ─── Form Handler ────────────────────────────
function setupForm() {
  document.addEventListener('submit', e => {
    if (e.target.id === 'contactForm') {
      e.preventDefault();
      const success = document.getElementById('formSuccess');
      if (success) { success.classList.remove('hidden'); e.target.reset(); }
    }
  });
}

// ─── Initialization ──────────────────────────
function init() {
  setupNavigation();
  setupForm();
  setupCodeCopy();
  setupPager();
  routePage();
  normalizeInternalLinks();

  try {
    configureMarked();
  } catch (err) {
    console.warn('Markdown enhancements unavailable:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
