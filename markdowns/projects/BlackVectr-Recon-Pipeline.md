---
title: "BlackVectr Recon Pipeline — Automated Recon & Attack-Surface Pipeline"
date: 2026-07-12
author: "BLACK VECTR Engineering"
tags: recon, osint, attack-surface, appsec, pentest-automation, nuclei, secret-scanning
status: Research
role: Security Research & Engineering
stack: Python, Flask, SQLite, Go tooling, Nuclei
excerpt: "A staged, scope-safe reconnaissance orchestrator that automates the repetitive early phases of a pentest — from passive OSINT to bounded vulnerability checks — and normalizes every tool's output into one queryable inventory behind an authenticated web console."
---

# BlackVectr ReconCloud — Automated Recon & Attack-Surface Pipeline

## What this tool is

**ReconCloud** is a Python orchestrator that automates the repetitive early phases
of an *authorized* penetration test or bug-bounty engagement. Instead of running two
dozen recon tools by hand and copy-pasting their output, the pipeline drives each
best-of-breed CLI tool in a fixed, scope-safe order, normalizes every result into a
single SQLite inventory, preserves raw evidence, and renders a self-contained
dark-mode HTML report.

On top of the scanner sits an authenticated **Flask web console** ("ReconCloud")
that turns the pipeline into a managed service: named projects, persistent scan
queues, live log progress, and per-scan result pages backed by each run's database.

Two entry points, one engine:

- `recon_pipeline.py` — the CLI orchestrator (a single ~140 KB module).
- `webapp.py` — the authenticated control plane that queues and supervises scans.

Everything is gated behind an explicit `--i-have-authorization` acknowledgement,
accepts only apex domains, filters crawled URLs back to scope, rate-limits every
active tool, and passes argument arrays directly to subprocesses (never a shell).

---

## What gets automated

The pipeline runs as an ordered set of numbered stages. Each stage is skippable
(`--skip-stages`), individually rate-limited, timeout-bounded, and recorded in a
**tool-execution ledger** so a failed optional tool never aborts the run.

| Phase | Stage(s) | What it automates | Tooling |
|---|---|---|---|
| **Scope guard** | `00-scope-preflight` | Validates in-scope hosts before any traffic | internal |
| **Passive OSINT** | `00-domain`, `00-osint`, `00-recon-ng` | WHOIS + RDAP registration, keyless host enrichment, public emails/hosts | `whois`, RDAP, Recon-ng, theHarvester, SpiderFoot |
| **Subdomain enum** | `01-enumerate`, `01-active-dns` | Passive sources + active DNS brute force with CNAME validation | `ducky-subs`, `gobuster` (dns) |
| **DNS** | `02-dns`, `02-resolve` | Record collection + bulk resolution | `dig`, `dnsrecon`, `dnsenum`, `dnsx` |
| **Ports & takeover** | `03-ports`, `03-takeover` | Port discovery + subdomain-takeover fingerprinting | `naabu`, `nmap`, `subjack`, `subover` |
| **HTTP & services** | `04-http`, `04-open-ports` | Live HTTP probing, full-range service/version detection | `httpx`, `nmap -p-` |
| **Crawl & archive** | `05-crawl`, `05-wayback`, `05-archive` | Live crawl + historical URL recovery | `katana`, `gau`, `waybackurls` |
| **Technology** | `06-tech` | Wappalyzer fingerprints, headers, CDN/WAF, framework/version detection | `httpx`, `whatweb` |
| **Secrets** | `07-jsminer`, `07-secrets`, `08-repos` | JS endpoint mining + credential exposure in JS/JSON/source maps + linked-repo secret scanning | `jsminer`, `mantra`, `gitleaks`, `trufflehog`, `ducky-ana` |
| **Content discovery** | `08-content` | Recursive, auto-calibrated directory/file fuzzing per live origin | `ffuf` |
| **Active checks** | `08-xss`, `09-parameters`, `09-sqli` | Parameter discovery + bounded XSS + detection-only SQLi | `arjun`, `dalfox`, `xsstrike`, `sqlmap` |
| **Inputs & TLS** | `10-inputs`, `10-tls` | Form/input inventory + TLS posture | internal, `sslyze`, `sslscan`, `testssl.sh` |
| **Vulnerability scans** | `11-wapiti`, `12-nuclei`, `18-nikto` | Adaptive black-box scan, template scans (generic + Wappalyzer-driven), bounded server checks | `wapiti`, `nuclei`, `nikto` |

### The tools it orchestrates

Roughly **30 integrated tools**, weighted by how heavily they're driven in the code:
`nuclei`, `wapiti`, `nikto`, `httpx`, `recon-ng`, `testssl.sh`, `nmap`, `mantra`,
`subover`, `sslyze`, `jsminer`, `xsstrike`, `subjack`, `sqlmap`, `gitleaks`,
`trufflehog`, `theHarvester`, `dnsx`, `arjun`, `waybackurls`, `sslscan`,
`spiderfoot`, `gobuster`, `ducky-subs`, `dnsenum`, `dalfox`, `whatweb`, `ffuf`,
`dnsrecon`, `naabu`, `gau`, `katana`, plus the bundled `ducky-ana` encoded/hash
classifier. Python tools with conflicting dependency sets run in isolated
environments; Go tools are built into `tools/bin/`.

### Secret discovery

After crawling, the pipeline inspects in-scope HTML, JavaScript, JSON, XML and
source-map resources for exposed credentials — provider-specific formats, private
keys, JWTs, database URLs and secret assignments — using regex **plus entropy and
context checks**. Linked GitHub repositories are scanned with **Gitleaks** and
**TruffleHog**. Base64/URL/hex/JWT/hash artifacts are classified with the bundled
`ducky-ana`; encodings get bounded decoded analysis, hashes are identified but
**never cracked**, and TruffleHog verification is deliberately disabled so
discovered credentials are never used. All evidence is fingerprinted and redacted
before it touches disk.

---

## Scan profiles

- **`passive`** — passive subdomain sources + DNS resolution only. Sends *no* HTTP
  traffic to the target.
- **`standard`** — adds WHOIS/Recon-ng OSINT, active Gobuster DNS enum, a restrained
  top-100 port scan, service fingerprinting, crawling, FFUF content discovery and
  exposure analysis.
- **`deep`** — full-range TCP scanning, historical URL recovery, JS endpoint mining,
  layered takeover checks, Nuclei, recursive content discovery, and **bounded**
  XSS/SQLi detection. For engagements that explicitly permit active testing.

Every active stage is bounded: `--secret-max-files` (2,000), `--secret-max-bytes`
(2 MB), `--active-max-urls` (25), `--active-delay`, per-host Nmap ceilings, and
`--rate` as the exact per-target FFUF request ceiling. sqlmap is locked to
`level=1 risk=1`, one thread, detection-only — it never enumerates or extracts data.

---

## The web console

A Flask app (`webapp.py`) provides the managed interface. Navigation surfaces:
**Recon / Cloud / Workspace / Intelligence / Security workspace**.

**Project & queue management**
- A *project* is a named assessment (e.g. `ACME deep analysis`) holding many
  authorized domains or exact hosts.
- Creating a project auto-queues background scan jobs, processed **one at a time**
  to avoid multiplying load against target infrastructure.
- Large exact-host scope lists are uploaded in chunks before queueing.
- A restart preserves queued jobs and marks an interrupted run as `failed` for
  deliberate requeue.

**Per-scan result pages** — each completed scan's SQLite DB drives tabbed views:
`Overview · Subdomains · Tech stacks · Endpoints · Findings · Infrastructure ·
Inputs · Encoded · Tools · Settings`. The **Attack-surface** view diffs consecutive
completed scans and flags newly-appeared subdomains, endpoints and services.

**Reporting** — each scope item offers a downloadable, portable **Markdown report**
containing the complete normalized inventory with project metadata; URL query values
are redacted, raw evidence stays in the protected workspace.

**Security posture of the console itself**
- Explicit written-authorization confirmation on every submission.
- Local-only default binding; sessions HTTP-only + SameSite.
- CSRF tokens on all POSTs (`hmac.compare_digest`), constant-time login.
- Scanner subprocesses never invoke a shell, and web credentials
  (`ADMIN_PASSWORD`, `FLASK_SECRET_KEY`) are stripped from the child environment.
- Path-scoping guards on every stored artifact (`scoped_path`, `scoped_child`) to
  keep reads/deletes inside their configured roots.

---

## Data model & evidence

Each run normalizes results into one SQLite database with tables for `assets`,
`dns_records`, `ports`, `http_services`, `technologies`, `endpoints`, `findings`,
`input_points`, `encoded_artifacts`, `repositories`, `domain_info` and a
`tool_runs` ledger. Alongside it: `report.html`, `summary.json`, and every tool's
raw stdout/stderr with exact command metadata. Web-console control data lives in
`instance/control.sqlite3`; per-job evidence under `results/web/`.

---

## Design principles

1. **Authorized use only.** Explicit acknowledgement required; apex-domain-only;
   crawled URLs filtered back to scope.
2. **Bounded and rate-limited.** Every active tool has timeouts, request ceilings
   and file/byte budgets so a scan can't turn into a DoS.
3. **Leads, not verdicts.** Scanner observations require manual validation. A
   detected version without a matching finding is labeled *"Version detected"* —
   never "safe" or "up to date."
4. **Non-destructive by default.** Secrets are redacted and never used; hashes are
   never cracked; SQLi/XSS checks are detection-only and idempotent.
5. **Shell-free execution.** Argument arrays passed directly to subprocesses.

---

## Quick start

```bash
python3 setup.py                       # idempotent bootstrap (env + tools)
venv/bin/python recon_pipeline.py example.com --i-have-authorization --profile standard
venv/bin/python webapp.py              # web console at http://127.0.0.1:8080
python3 -m unittest discover -v        # tests
```

---

*Authorized attack-surface inventory only. Automated observations require manual
validation. Confirm secret validity without using discovered credentials, then
revoke and rotate.*
