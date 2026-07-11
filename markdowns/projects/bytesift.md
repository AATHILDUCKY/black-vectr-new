---
title: "ByteSift — Binary Diffing Suite"
date: 2026-02-26
author: "BLACK VECTR Engineering"
tags: reverse-engineering, rust
status: Internal
role: Tooling
stack: Rust, Capstone
excerpt: "Fast function-level binary diffing to accelerate patch analysis and 1-day vulnerability discovery."
---

When a vendor ships a silent security patch, the fix itself is a map to the bug. ByteSift diffs two binary versions at the function level and ranks the changes most likely to be the patched vulnerability.

## Overview

ByteSift hashes each function by its control-flow structure rather than raw bytes, so it tolerates recompilation noise and still matches functions across versions.

```rust
/// A structural fingerprint of a single function.
pub struct FnHash {
    pub name: String,
    pub bb_count: usize,   // basic blocks
    pub call_count: usize, // outgoing calls
    pub hash: u64,         // structural hash
}

pub fn changed(old: &[FnHash], new: &[FnHash]) -> Vec<&FnHash> {
    let prev: HashMap<_, _> = old.iter().map(|f| (&f.name, f.hash)).collect();
    new.iter()
        .filter(|f| prev.get(&f.name).map_or(true, |h| *h != f.hash))
        .collect()
}
```

> [!IMPORTANT]
> A one-day exploit is often just a diff away. Fast, accurate binary diffing turns a patch release into an attack window.

## Patch Ranking

Changed functions are scored by proximity to memory operations, input parsing, and prior CVE hotspots to float the likely fix to the top.

## Status & Roadmap

- [x] Function matching
- [x] Structural hashing
- [] Decompiler-assisted diff
- [] ARM64 support
