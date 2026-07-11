/* ============================================
   BLACK VECTR — Full SPA Application
   Router, Pages, Blog + Projects, Markdown, SEO
   ============================================ */

// ─── Configuration ───────────────────────────
const SITE = {
  name: 'BLACK VECTR',
  tagline: 'Research-Led Security Assessment',
  url: 'https://blackvectr.com',
  email: 'blackvectr@gmail.com',
  year: new Date().getFullYear(),
  assets: 'assets'
};

const PAGE_SIZE = 9;
const APP_BASE = getAppBase();

// ─── Caching ─────────────────────────────────
const mdCache = new Map();

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
  '/':         { render: homePage,     title: 'BLACK VECTR — Security Assessments, Research, and Training',        desc: 'BLACK VECTR provides research-led security assessments across web apps, APIs, cloud, external attack surface, awareness, OSINT, forensics support, and vulnerability research.' },
  '/about':    { render: aboutPage,    title: 'About — BLACK VECTR | Research-Led Security Practice',      desc: 'An independent security research practice focused on practical assessment, responsible learning, tooling, and clear security communication.' },
  '/services': { render: servicesPage, title: 'Services — BLACK VECTR | Security Testing, Awareness, and Response Support',   desc: 'Web application testing, API security testing, cloud assessment, external attack surface review, OSINT, phishing simulation, secure code review, incident support, and more.' },
  '/projects': { render: projectsPage, title: 'Projects — BLACK VECTR | Security Tools & Research',    desc: 'Open-source experiments, technical notes, and security engineering projects from BLACK VECTR.' },
  '/blog':     { render: blogPage,     title: 'Research — BLACK VECTR | Security Research & Insights',     desc: 'Technical deep-dives, vulnerability research notes, and practical security guides from BLACK VECTR.' },
  '/contact':  { render: contactPage,  title: 'Contact — BLACK VECTR | Plan a Security Assessment',                     desc: 'Reach out for security testing, research collaboration, awareness training, incident support, or a focused assessment plan.' }
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
          <h1 class="hero-title mt-7 mb-6 fade-in delay-1">Practical security testing backed by continuous research.</h1>
          <p class="hero-lead text-base sm:text-lg leading-relaxed fade-in delay-2">Web, API, cloud, OSINT, awareness, and incident-focused assessments for teams that want clear evidence, useful reporting, and honest security direction.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center mt-9 fade-in delay-3">
            <a href="/services" class="btn-primary"><i class="fa-solid fa-arrow-right"></i> View Services</a>
            <a href="/contact" class="btn-ghost"><i class="fa-regular fa-envelope"></i> Start a Conversation</a>
          </div>
          <div class="hero-metrics grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-14 pt-8 border-t border-white/10 fade-in delay-4">
            ${[['Assessment','Security Testing'],['Research','Papers & Repos'],['Training','Human Layer']].map(([n,l]) => `
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
          <h2 class="h-sec text-3xl sm:text-4xl mt-4 mb-4">Focused assessments. Clear findings. Better security decisions.</h2>
          <div class="section-line"></div>
          <p class="text-white/55 mt-5 text-sm sm:text-base leading-relaxed">BLACK VECTR combines hands-on testing, security research, practical education, and investigation support. The goal is simple: identify what matters, explain it clearly, and help you decide what to fix first.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${[
            ['fa-globe', 'Web & API Security', 'Manual assessment of web applications, APIs, authentication flows, access control, business logic, and exposed endpoints.'],
            ['fa-cloud', 'Cloud & Attack Surface', 'External attack surface review, cloud configuration assessment, DNS security review, and internet exposure analysis.'],
            ['fa-code', 'Secure Code Review', 'Source-level review focused on exploitable patterns, privilege boundaries, data handling, and remediation guidance.'],
            ['fa-magnifying-glass-chart', 'OSINT & Exposure Research', 'Open-source intelligence, data exposure checks, dark web exposure monitoring, and public footprint analysis.'],
            ['fa-user-shield', 'Awareness & Social Engineering', 'Phishing simulation, security awareness training, executive briefings, and social engineering assessment.'],
            ['fa-file-shield', 'Forensics & Incident Support', 'Log analysis, breach investigation support, digital forensics triage, and incident response guidance.']
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
        <div id="homeProjectGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${renderProjectCards(PROJECTS.slice(0, 3))}</div>
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
        <div id="homeBlogGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${renderBlogCards(BLOG_POSTS.slice(0, 3))}</div>
        <div class="text-center mt-8 sm:hidden"><a href="/blog" class="btn-ghost text-sm">View All Research</a></div>
      </div>
    </section>

    <section class="py-20 sm:py-28 border-t border-white/5">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 text-center relative overflow-hidden">
        <div class="glow-red" style="width:500px;height:300px;top:-60px;left:50%;transform:translateX(-50%);opacity:.5"></div>
        <h2 class="h-sec text-3xl sm:text-4xl mb-4 relative">Need a focused security assessment or research collaboration?</h2>
        <p class="text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed relative">Bring the problem: an application, an API, a cloud environment, a suspicious event, a training need, or a research idea. BLACK VECTR will help shape it into a practical next step.</p>
        <a href="/contact" class="btn-primary relative"><i class="fa-regular fa-paper-plane"></i> Plan Your Engagement</a>
      </div>
    </section>`;
}

function aboutPage() {
  return `
    ${pageHeader('// About Us', 'Built around curiosity,<br /><span class="text-red">discipline, and practical security research.</span>', 'BLACK VECTR is an independent security research and assessment practice focused on learning deeply, testing responsibly, and sharing useful work through reports, papers, and open-source tooling.')}

    <section class="py-16 sm:py-24">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="grid sm:grid-cols-2 gap-12 sm:gap-16">
          <div>
            <h2 class="h-sec text-2xl sm:text-3xl mb-5">Our Mission</h2>
            <div class="w-10 h-0.5 bg-red mb-6"></div>
            <p class="text-white/65 leading-relaxed mb-4">BLACK VECTR exists for serious, hands-on security work: finding weaknesses, understanding why they exist, and turning that research into practical guidance. The practice is intentionally research-led, with every assessment shaped by curiosity, evidence, and responsible methodology.</p>
            <p class="text-white/65 leading-relaxed mb-4">The current focus is security assessment, awareness, OSINT, cloud and attack-surface review, code review, log analysis, and incident-support work. As capabilities mature, selected research will be shared through technical papers, writeups, and GitHub repositories.</p>
            <p class="text-white/65 leading-relaxed">The promise is not noise, fear, or inflated claims. It is careful testing, clear communication, practical remediation direction, and a habit of learning in public where it helps the community.</p>
          </div>
          <div>
            <h2 class="h-sec text-2xl sm:text-3xl mb-5">Our Approach</h2>
            <div class="w-10 h-0.5 bg-red mb-6"></div>
            <div class="space-y-5">
              ${[['01','Mission-Led Engagements','We shape our work around the client’s real risks, business model, and operational pressure points.'],
                 ['02','Offense With Purpose','Testing is used to answer real questions about exposure, exploitability, business logic, and operational risk.'],
                 ['03','Research Mindset','New techniques, tooling experiments, and public security research inform the way each assessment is approached.'],
                 ['04','Responsible Growth','Services are expanded carefully, with capability, documentation, and evidence prioritized over marketing noise.']].map(([n, t, d]) => `
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
          <h2 class="h-sec text-2xl sm:text-3xl mt-3">What BLACK VECTR Is Built Around</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${[['fa-bug','Assessment','Web, API, cloud, code, identity, DNS, and external exposure review'],
             ['fa-flask','Research','Technical papers, proof-of-concepts, notes, and GitHub-based knowledge sharing'],
             ['fa-brain','Awareness','Training, phishing simulation, executive briefings, and social engineering education'],
             ['fa-magnifying-glass','Investigation','Log analysis, breach investigation support, forensics triage, and exposure monitoring']].map(([i, t, d]) => `
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
        <p class="text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">If you need a focused assessment, a research collaborator, or help turning a security concern into a clear plan, BLACK VECTR is built for that kind of work.</p>
        <a href="/contact" class="btn-primary"><i class="fa-regular fa-envelope"></i> Get in Touch</a>
      </div>
    </section>`;
}

function servicesPage() {
  return `
    ${pageHeader('// Services', 'Security assessment,<br /><span class="text-red">research, awareness, and response support.</span>', 'A focused service catalog for organizations that need practical testing, exposure review, training, and investigation support without vague deliverables or scanner-only output.')}

    <section class="py-16 sm:py-24">
      <div class="max-w-6xl mx-auto px-5 sm:px-8">
        <div class="grid sm:grid-cols-2 gap-5">
          ${[
            ['fa-window-restore','Web Application Security Testing','Manual and tool-assisted testing for authentication, authorization, session handling, injection, business logic, sensitive data exposure, and common OWASP-class weaknesses.',['Web App Pentest','Auth Testing','Business Logic','OWASP']],
            ['fa-network-wired','API Security Testing','Assessment of REST, GraphQL, and backend API behavior, including object-level authorization, token handling, rate limits, input validation, and data exposure paths.',['REST','GraphQL','BOLA / IDOR','Token Review']],
            ['fa-cloud','Cloud Security Assessment','Review of cloud configuration, identity permissions, storage exposure, network controls, logging posture, and practical attack paths across cloud-hosted systems.',['IAM','Storage Exposure','Logging','Misconfiguration']],
            ['fa-satellite-dish','External Attack Surface Assessment','Mapping and validation of internet-facing assets, DNS records, exposed services, stale infrastructure, weak TLS, and publicly reachable risks.',['DNS Review','Exposed Services','TLS','Shadow Assets']],
            ['fa-list-check','Vulnerability Assessment','Prioritized vulnerability discovery and validation that separates real risk from noise and gives teams a clear remediation order.',['Validation','Prioritization','Remediation','Reporting']],
            ['fa-code','Secure Code Review','Security-focused source review for access control flaws, insecure data handling, injection risk, secrets exposure, privilege boundaries, and risky implementation patterns.',['Source Review','Secrets','Data Flow','Fix Guidance']],
            ['fa-magnifying-glass-chart','OSINT & Data Exposure Assessment','Open-source intelligence research, public footprint mapping, leaked data checks, dark web exposure monitoring, and sensitive information discovery.',['OSINT','Data Exposure','Dark Web','Public Footprint']],
            ['fa-user-secret','Social Engineering & Phishing Simulation','Controlled phishing simulation, social engineering assessment, reporting behavior review, and practical recommendations for human-layer defense.',['Phishing','Pretexting','Reporting Habits','Human Risk']],
            ['fa-chalkboard-user','Security Awareness Training','Practical training for staff and executives, covering phishing, password hygiene, MFA, social engineering, incident reporting, and business-relevant security decisions.',['Staff Training','Executive Briefings','MFA','Reporting']],
            ['fa-file-shield','Digital Forensics & Incident Support','Support for log analysis, breach investigation, evidence review, incident timeline reconstruction, and response planning when something suspicious has happened.',['Log Analysis','Breach Review','Timeline','IR Support']],
            ['fa-users-gear','Active Directory & Privilege Review','Assessment of identity paths, privilege escalation opportunities, weak delegation, excessive permissions, admin exposure, and MFA coverage.',['AD Security','Privilege Escalation','MFA Review','Identity Risk']],
            ['fa-flask','Security Research & Tooling','Focused research, proof-of-concept development, documentation, and GitHub-based tooling or writeups for selected security topics.',['Research Notes','PoC','GitHub','Technical Writing']]
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
          <p class="text-white/55 text-sm leading-relaxed">A practical model for turning technical work into findings your team can actually use.</p>
        </div>
        <div class="grid sm:grid-cols-4 gap-6">
          ${[['1','Define the Question','Clarify the asset, concern, business context, access level, and the decision the assessment should support'],
             ['2','Test With Evidence','Combine manual review, targeted tooling, research, and validation so findings are reproducible and meaningful'],
             ['3','Explain the Risk','Translate technical impact into clear severity, exploit path, affected data, and practical business relevance'],
             ['4','Deliver Next Steps','Provide remediation guidance, retest options, training needs, or investigation direction where appropriate']].map(([n, t, d]) => `
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
          <span class="code-label">// Engagement Fit</span>
          <h2 class="h-sec text-2xl sm:text-3xl mt-3 mb-4">How services are positioned</h2>
          <p class="text-white/55 text-sm leading-relaxed">Some work is available as a focused assessment now; deeper research and incident work can be scoped carefully based on the evidence and complexity involved.</p>
        </div>
        <div class="grid sm:grid-cols-3 gap-5">
          ${[
            ['Assess','Security Testing','Web, API, cloud, attack surface, code, DNS, identity, and vulnerability-focused work.'],
            ['Educate','Awareness & Simulation','Security awareness, executive briefings, phishing simulation, and social engineering readiness.'],
            ['Investigate','Research & Response','OSINT, exposure monitoring, log analysis, breach review, forensics triage, and technical research.']
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
        <h2 class="h-sec text-2xl sm:text-3xl mb-4">Need help choosing the right assessment?</h2>
        <p class="text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">Share the asset, concern, or incident context. BLACK VECTR will help narrow the scope into a practical assessment, training session, research task, or investigation plan.</p>
        <a href="/contact" class="btn-primary"><i class="fa-regular fa-paper-plane"></i> Discuss Your Requirements</a>
      </div>
    </section>`;
}

function projectsPage() {
  return `
    ${pageHeader('// Projects', 'Tools, experiments,<br /><span class="text-red">and security engineering notes.</span>', 'Open-source experiments, technical notes, and security engineering projects from BLACK VECTR.')}
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
    ${pageHeader('// Research', 'Insights from<br /><span class="text-red">the lab.</span>', 'Technical deep-dives, vulnerability research notes, and practical security guides from BLACK VECTR.')}
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
        <h1 class="page-title mt-5 mb-4 max-w-3xl">Let's define<br /><span class="text-red">the right security next step.</span></h1>
        <p class="text-white/55 max-w-2xl leading-relaxed">Whether you need a web or API assessment, cloud review, OSINT work, awareness training, phishing simulation, log analysis, or incident support, share the context and we’ll shape a practical scope.</p>
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
                <select id="cinterest" class="inp" required>
                  <option value="" selected disabled hidden>Select a service</option>
                  <option>Web Application Security Testing</option>
                  <option>API Security Testing</option>
                  <option>External Attack Surface Assessment</option>
                  <option>Cloud Security Assessment</option>
                  <option>Vulnerability Assessment</option>
                  <option>Secure Code Review</option>
                  <option>OSINT / Data Exposure Assessment</option>
                  <option>Phishing Simulation</option>
                  <option>Security Awareness Training</option>
                  <option>Executive Security Awareness Training</option>
                  <option>Social Engineering Assessment</option>
                  <option>Digital Forensics / Incident Response Support</option>
                  <option>Log Analysis / Breach Investigation</option>
                  <option>Active Directory / Privilege Escalation Review</option>
                  <option>MFA Security Review</option>
                  <option>Dark Web Exposure Monitoring</option>
                  <option>DNS Security Review</option>
                  <option>Bug Bounty Program Setup</option>
                  <option>Security Research / GitHub Collaboration</option>
                  <option>Other / Not Sure</option>
                </select>
              </div>
              <div class="mb-5">
                <label for="cmsg" class="form-label">Message</label>
                <textarea id="cmsg" class="inp" rows="4" placeholder="Tell us about the asset, concern, timeline, or security question..." required></textarea>
              </div>
              <button type="submit" class="btn-primary w-full justify-center"><i class="fa-regular fa-paper-plane"></i> Open Email Draft</button>
              <div id="formSuccess" class="hidden mt-4 p-3 rounded bg-red/10 border border-red/25 text-center text-sm text-white/70">
                <i class="fa-regular fa-circle-check mr-1.5 text-red"></i>Your email draft is ready. Review it, then press send from your mail app.
              </div>
              <p class="text-xs text-white/20 text-center mt-4"><i class="fa-solid fa-envelope-open-text mr-1"></i> Opens Gmail when available, with a mail-app fallback.</p>
            </form>
          </div>
          <div class="sm:col-span-2 space-y-4">
            ${[['fa-regular fa-envelope','Email',SITE.email,null],
               ['fa-solid fa-flask','Research','Papers, writeups, and GitHub tooling','Shared when ready'],
               ['fa-regular fa-clock','Response','Scope-first discussion',null]].map(([icon, t, v, sub]) => `
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

const generatedContentIndex = window.BLACKVECTR_CONTENT_INDEX || {};
const generatedResearch = Array.isArray(generatedContentIndex.research) ? generatedContentIndex.research : [];
const generatedProjects = Array.isArray(generatedContentIndex.projects) ? generatedContentIndex.projects : [];

const BLOG_POSTS = generatedResearch;
const PROJECTS = generatedProjects;

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
  if (!cfg.items.length) {
    const label = type === '/projects' ? 'projects' : 'research posts';
    grid.innerHTML = `<div class="col-span-full py-12 text-center text-sm text-white/40">No ${label} published yet.</div>`;
    const pager = document.getElementById(cfg.pagerId);
    if (pager) pager.innerHTML = '';
    return;
  }
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
  const collection = isProject ? 'projects' : 'research';
  const dir = `markdowns/${collection}`;
  const entries = isProject ? generatedProjects : generatedResearch;
  const entry = entries.find(item => item.slug === slug);
  const cacheKey = `${collection}:${slug}:${entry?.content_hash || ''}`;
  const listHref = isProject ? '/projects' : '/blog';
  const listLabel = isProject ? 'Back to Projects' : 'Back to Research';
  const app = document.getElementById('app');
  app.innerHTML = `<div class="max-w-4xl mx-auto px-5 sm:px-8 py-32 text-center text-white/20"><i class="fa-solid fa-spinner fa-spin text-2xl"></i></div>`;

  try {
    let md = mdCache.get(cacheKey);
    if (!md) {
      const source = entry?.source || `${slug}.md`;
      const res = await fetch(withBase(`/${dir}/${source}`));
      if (!res.ok) throw new Error('not found');
      md = await res.text();
      mdCache.set(cacheKey, md);
    }

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
function getFieldValue(id) {
  return document.getElementById(id)?.value.trim() || '';
}

function buildContactEmail() {
  const name = getFieldValue('cname');
  const email = getFieldValue('cemail');
  const service = getFieldValue('cinterest') || 'Security Assessment';
  const message = getFieldValue('cmsg');
  const page = window.location.href;
  const date = new Date().toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subject = `[BLACK VECTR Inquiry] ${service} - ${name}`;
  const body = [
    'Hello BLACK VECTR,',
    '',
    'I would like to discuss a security engagement.',
    '',
    'Inquiry Details',
    '----------------',
    `Name: ${name}`,
    `Email: ${email}`,
    `Service Interest: ${service}`,
    `Submitted From: ${page}`,
    `Prepared At: ${date}`,
    '',
    'Message',
    '-------',
    message,
    '',
    'Preferred next step:',
    'Please review this request and reply with scope questions, availability, and recommended next steps.',
    '',
    'Regards,',
    name
  ].join('\n');

  return { subject, body };
}

function openEmailDraft() {
  const { subject, body } = buildContactEmail();
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: SITE.email,
    su: subject,
    body
  });
  const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;
  const mailtoUrl = `mailto:${encodeURIComponent(SITE.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const draftWindow = window.open(gmailUrl, '_blank');

  if (!draftWindow) {
    window.location.href = mailtoUrl;
    return 'mail';
  }

  draftWindow.opener = null;
  return 'gmail';
}

function setupForm() {
  document.addEventListener('submit', e => {
    if (e.target.id === 'contactForm') {
      e.preventDefault();
      if (!e.target.reportValidity()) return;
      const success = document.getElementById('formSuccess');
      const openedWith = openEmailDraft();
      if (success) {
        success.classList.remove('hidden');
        success.innerHTML = openedWith === 'gmail'
          ? '<i class="fa-regular fa-circle-check mr-1.5 text-red"></i>Gmail opened with your draft. Review it, then press send.'
          : '<i class="fa-regular fa-circle-check mr-1.5 text-red"></i>Your mail app opened with the draft. Review it, then press send.';
      }
    }
  });
}

// ─── Service Worker ──────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const swPath = withBase('/sw.js');
      navigator.serviceWorker.register(swPath, { scope: withBase('/') }).catch(() => {});
    } catch (e) {}
  }
}

// ─── Initialization ──────────────────────────
function init() {
  document.querySelector('base[data-pages-base]')?.remove();
  setupNavigation();
  setupForm();
  setupCodeCopy();
  setupPager();
  routePage();
  normalizeInternalLinks();
  registerSW();

  try {
    configureMarked();
  } catch (err) {
    console.warn('Markdown enhancements unavailable:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
