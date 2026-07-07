---
title: "Vantage — Attack Surface Monitor"
date: 2026-06-20
author: "BLACK VECTR Engineering"
tags: recon, python, automation
status: Open Source
role: Design & Engineering
stack: Python, PostgreSQL, Redis, Docker
link: https://github.com/blackvectr/vantage
excerpt: "Continuous external attack-surface discovery and change monitoring across an organization's entire internet-facing footprint."
---

Vantage is our continuous attack-surface management (ASM) engine. It maps everything an organization exposes to the internet — domains, subdomains, hosts, ports, certificates, and cloud assets — then watches that surface for change over time. When something new appears, Vantage tells you before an attacker finds it.

## Why We Built It

Most attack-surface tooling produces a one-time snapshot. But real infrastructure drifts constantly: a forgotten staging box gets a public IP, a wildcard certificate leaks a new subdomain, a marketing team spins up an unmanaged SaaS. The gap between *"what security thinks is exposed"* and *"what is actually exposed"* is where breaches start.

> [!NOTE]
> Vantage is passive by default. Active probing (port scans, HTTP fingerprinting) is opt-in per scope so it stays safe to run against third parties you're authorized to assess.

## Architecture

Vantage runs as a set of stateless workers coordinated through a job queue, with results normalized into a single asset graph.

```text
 seeds ──▶ [ discovery workers ] ──▶ normalizer ──▶ asset graph (Postgres)
                    │                                   │
             passive sources                      diff engine ──▶ alerts
```

Each discovery module is a plugin that yields normalized assets. Adding a new source is a matter of implementing one method.

```python
from vantage.core import Module, Asset

class CertTransparency(Module):
    """Pull subdomains from Certificate Transparency logs."""
    name = "crt.sh"

    async def run(self, seed: str):
        rows = await self.http.get_json(
            f"https://crt.sh/?q=%25.{seed}&output=json"
        )
        for row in rows:
            for name in row["name_value"].splitlines():
                yield Asset(kind="subdomain", value=name.lstrip("*."), source=self.name)
```

## The Diff Engine

The core of Vantage is the diff engine. On every scan cycle it compares the freshly discovered surface against the last known state and emits typed change events.

```python
def diff(previous: set[Asset], current: set[Asset]) -> list[Change]:
    added   = current - previous
    removed = previous - current
    return (
        [Change("appeared", a) for a in added] +
        [Change("vanished", a) for a in removed]
    )
```

New high-signal assets (a fresh admin panel, an expired-then-renewed cert, an open database port) are pushed straight to Slack and the on-call queue.

## Storage & Querying

Assets and their relationships live in PostgreSQL so analysts can ask precise questions in plain SQL:

```sql
-- Hosts that started responding on a sensitive port in the last 24h
SELECT h.ip, p.port, p.first_seen
FROM   host h
JOIN   port p ON p.host_id = h.id
WHERE  p.port IN (22, 3389, 5432, 6379, 9200)
  AND  p.first_seen > now() - interval '24 hours'
ORDER  BY p.first_seen DESC;
```

## Results

Deployed across a dozen engagements, Vantage has consistently surfaced assets clients did not know existed:

1. **Shadow infrastructure** — forgotten cloud instances outside the managed inventory
2. **Certificate leaks** — internal hostnames exposed through public CT logs
3. **Config drift** — management ports briefly exposed during deploys
4. **Third-party sprawl** — unmanaged SaaS subdomains pointing at the org

> [!WARNING]
> An attack surface you don't monitor is an attack surface someone else is monitoring for you. ASM is not a one-time deliverable — it is a continuous control.

## Roadmap

- [x] Passive discovery pipeline
- [x] Diff engine + alerting
- [x] SQL-queryable asset graph
- [ ] Cloud-provider connectors (AWS / GCP / Azure)
- [ ] Risk scoring per asset
- [ ] Public API + Terraform provider

Vantage is open source under the Apache-2.0 license. Contributions and new discovery modules are welcome.
