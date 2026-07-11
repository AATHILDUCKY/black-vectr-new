---
title: "Red Team Engagement Methodology"
date: 2026-01-22
author: "BlackVectr Research Team"
tags: red-team, methodology, adversary-simulation
excerpt: "How we plan and execute red team operations, from initial recon to final report delivery."
---

Effective red teaming goes beyond running automated tools. It requires systematic planning, creative thinking, and a deep understanding of adversary tradecraft. This is how we approach every engagement.

## Phase 1: Intelligence Gathering

Before any testing begins, we build a detailed picture of the target:

### Open Source Intelligence (OSINT)

```bash
# Employee enumeration
theHarvester -d target.com -b linkedin,google

# Technology profiling
wappalyzer-cli https://target.com

# Subdomain discovery
sublist3r -d target.com -o subs.txt
```

### Threat Modeling

We develop adversary personas based on real threat intelligence:

- **Nation-state** — Persistent, well-resourced, focused on specific data
- **Ransomware group** — Seeking maximum disruption, financially motivated
- **Insider threat** — Legitimate access, knowledge of internal systems

## Phase 2: Initial Access

Simulating how an adversary gains entry:

### Social Engineering

- Spear-phishing campaigns targeting specific roles
- Vishing (voice phishing) against help desks
- Physical social engineering at office locations

### Technical Initial Access

- Exploitation of public-facing applications
- Credential stuffing against VPN/SSO portals
- Supply chain compromise through third-party services

## Phase 3: Persistence & Evasion

Once inside, maintaining access while avoiding detection:

### C2 Infrastructure

```
[Target Network] → [Redirector] → [C2 Server] → [Team Server]
```

- Domain fronting for traffic obfuscation
- Encrypted C2 channels mimicking legitimate traffic
- Jitter-based beaconing to avoid pattern detection

### Lateral Movement

Moving through the network to reach high-value targets:

1. **Credential harvesting** — LSASS dumping, Kerberos ticket extraction
2. **Token theft** — Access token manipulation for privilege escalation
3. **Service exploitation** — Leveraging misconfigured internal services

## Phase 4: Objectives & Exfiltration

Demonstrating business impact without actual damage:

- **Data access** — Demonstrating access to sensitive data without exfiltration
- **Privilege escalation** — Proving control over critical systems
- **Impact demonstration** — Tabletop exercises showing real-world consequences

## Reporting & Remediation

Every engagement concludes with:

1. **Executive summary** — Business-level impact without technical jargon
2. **Technical findings** — Detailed reproduction steps for every finding
3. **Detection opportunities** — Where defensive controls succeeded or failed
4. **Remediation roadmap** — Prioritized fix recommendations

## Conclusion

Great red teaming is about more than getting domain admin. It's about understanding how real adversaries operate, helping organizations see their blind spots, and building defenses that actually work when tested.
