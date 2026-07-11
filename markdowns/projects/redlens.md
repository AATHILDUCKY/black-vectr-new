---
title: "RedLens — Adversary Emulation"
date: 2026-06-02
author: "BLACK VECTR Engineering"
tags: red-team, c2, go
status: Internal
role: Platform Engineering
stack: Go, gRPC, SQLite
excerpt: "A modular adversary-emulation platform for running repeatable, MITRE ATT&CK-mapped red team campaigns."
---

RedLens is our internal adversary-emulation platform. It turns loosely-documented red team tradecraft into repeatable, versioned campaigns mapped directly to MITRE ATT&CK, so every operation is measurable and every detection gap is provable.

## Overview

Every campaign is declarative. An operator describes *what* techniques to emulate and in what order; RedLens handles execution, logging, and cleanup. Plans live in version control and diff like code.

```go
package campaign

// Step is a single ATT&CK-mapped action in an emulation plan.
type Step struct {
    Technique string   // e.g. "T1059.001"
    Name      string   // human label
    Requires  []string // step IDs that must succeed first
}

func (p *Plan) Run(ctx context.Context) error {
    for _, s := range p.Ordered() {
        if err := p.exec(ctx, s); err != nil {
            return fmt.Errorf("step %s (%s): %w", s.Technique, s.Name, err)
        }
    }
    return nil
}
```

> [!NOTE]
> RedLens is strictly internal and only ever runs against systems we are explicitly authorized to test. Every action is logged and reversible.

## ATT&CK Mapping

Each step carries its ATT&CK technique ID. After an operation, RedLens produces a coverage matrix showing which techniques the blue team detected, alerted on, or missed entirely.

## Status & Roadmap

- [x] Declarative campaign engine
- [x] ATT&CK coverage reporting
- [] Automated detection-gap tickets
- [] Purple-team replay mode
