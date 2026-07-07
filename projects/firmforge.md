---
title: "FirmForge — Firmware Pipeline"
date: 2026-05-14
author: "BLACK VECTR Engineering"
tags: iot, firmware, python
status: Open Source
role: Design & Engineering
stack: Python, binwalk, QEMU
link: https://github.com/blackvectr/firmforge
excerpt: "An automated pipeline that unpacks, analyzes, and diffs firmware images to surface secrets and vulnerable binaries."
---

FirmForge automates the tedious first hours of any firmware assessment. Point it at an image and it unpacks the filesystem, inventories binaries, hunts for secrets, and diffs against previous versions — before a human ever opens a disassembler.

## Overview

FirmForge wraps binwalk, sasquatch, and jefferson to reliably carve SquashFS, JFFS2, and CramFS filesystems, retrying with multiple extractors when one fails.

```python
from firmforge import Pipeline

pipe = Pipeline("router_v2.bin")
report = (
    pipe.extract()          # binwalk -Me under the hood
        .inventory()        # ELF/arch/stripped map
        .scan_secrets()     # keys, passwords, tokens
        .diff("router_v1")  # what changed vs last firmware
        .build()
)

for secret in report.secrets:
    print(f"[!] {secret.kind} in {secret.path}: {secret.preview}")
```

> [!WARNING]
> Firmware secrets are production credentials. A single key extracted from one device often unlocks an entire deployed fleet.

## Secret Hunting

A tuned ruleset scans the extracted tree for hardcoded credentials, private keys, and API tokens — the single most common critical finding in embedded devices.

## Status & Roadmap

- [x] Multi-extractor unpacking
- [x] Secret scanning ruleset
- [x] Version diffing
- [] QEMU emulation harness
