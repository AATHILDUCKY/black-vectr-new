---
title: "SigmaVault — Detection Toolkit"
date: 2026-03-18
author: "BLACK VECTR Engineering"
tags: blue-team, detection, sql
status: Open Source
role: Detection Engineering
stack: Python, Sigma, ClickHouse
link: https://github.com/blackvectr/sigmavault
excerpt: "A detection-engineering toolkit for authoring, testing, and version-controlling Sigma rules against real telemetry."
---

SigmaVault brings software-engineering discipline to detection content. Rules are authored as Sigma, unit-tested against recorded telemetry, and shipped through CI — so a detection either fires on the attack it claims to catch, or the build fails.

## Overview

Every detection is a Sigma YAML file in git with an accompanying test case: a snippet of telemetry that must match, and one that must not.

```sql
-- Compiled from a Sigma rule: suspicious service creation
SELECT ts, host, user, command_line
FROM   process_events
WHERE  parent_image  = 'services.exe'
  AND  image ILIKE '%\\cmd.exe'
  AND  command_line ILIKE '%/c %'
ORDER  BY ts DESC;
```

> [!NOTE]
> A detection rule without a test is a hypothesis. SigmaVault turns every rule into a verified, regression-tested control.

## Backend Compilation

SigmaVault compiles the same rule to multiple backends — ClickHouse SQL, Elastic, Splunk — so detection logic is written once and deployed everywhere.

## Status & Roadmap

- [x] Sigma authoring + linting
- [x] Telemetry-backed unit tests
- [x] Multi-backend compilation
- [] Coverage dashboard vs ATT&CK
