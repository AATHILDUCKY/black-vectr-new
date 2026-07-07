---
title: "FuzzCore — Coverage Fuzzer"
date: 2026-04-05
author: "BLACK VECTR Engineering"
tags: fuzzing, c, research
status: Research
role: Security Research
stack: C, LLVM, libFuzzer
excerpt: "A coverage-guided fuzzing harness generator that turns library headers into runnable fuzz targets automatically."
---

FuzzCore lowers the cost of fuzzing third-party C libraries. It parses public headers, infers plausible argument types, and emits libFuzzer harnesses — turning a day of harness-writing into minutes.

## Overview

FuzzCore uses libclang to walk exported functions, classify parameters (buffer, length, handle), and wire the fuzzer input into the most buffer-like argument.

```c
#include <stdint.h>
#include <stddef.h>
#include "target.h"

// Auto-generated harness for parse_packet()
int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    if (size < 4) return 0;
    struct packet pkt;
    if (parse_packet(data, size, &pkt) == 0) {
        process_packet(&pkt);   // exercise the happy path too
    }
    return 0;
}
```

> [!TIP]
> The hardest part of fuzzing is not the fuzzer — it is writing good harnesses. Automating harness generation is where the leverage is.

## Triage

Crashes are automatically minimized and bucketed by stack hash so a thousand crashing inputs collapse into a handful of unique bugs.

## Status & Roadmap

- [x] Header-driven harness gen
- [x] Crash minimization + bucketing
- [] C++ overload resolution
- [] Structured input grammars
