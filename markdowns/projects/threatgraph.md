---
title: "ThreatGraph — Recon Correlation"
date: 2026-01-20
author: "BLACK VECTR Engineering"
tags: osint, graph, python
status: Active
role: Research & Engineering
stack: Python, Neo4j, FastAPI
excerpt: "Correlates OSINT, DNS, and certificate data into a queryable graph for large-scale reconnaissance."
---

ThreatGraph fuses noisy reconnaissance data — DNS records, certificates, WHOIS, breach data, and OSINT — into a single connected graph, so relationships that are invisible in flat tool output become one query away.

## Overview

By modeling assets and their shared infrastructure as a graph, ThreatGraph reveals pivot points — a shared IP, reused certificate, or common name server that ties assets together.

```python
from threatgraph import Graph

g = Graph()
g.ingest_dns("example.com")
g.ingest_certs("example.com")

# Which unrelated-looking domains share infrastructure?
shared = g.query("""
    MATCH (a:Domain)-[:RESOLVES_TO]->(ip:IP)<-[:RESOLVES_TO]-(b:Domain)
    WHERE a <> b
    RETURN a.name, b.name, ip.addr
""")
```

> [!TIP]
> Reconnaissance is a data-correlation problem long before it is a scanning problem. The pivots hide in the relationships, not the raw records.

## Scale

An incremental ingestion model lets ThreatGraph keep a live picture of large, fast-moving target scopes without re-scanning from scratch.

## Status & Roadmap

- [x] DNS + cert ingestion
- [x] Graph query API
- [] Breach-data enrichment
- [] Visual exploration UI
