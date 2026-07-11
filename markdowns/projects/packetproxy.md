---
title: "PacketProxy — Protocol Interception"
date: 2026-01-06
author: "BLACK VECTR Engineering"
tags: network, go, tooling
status: Open Source
role: Design & Engineering
stack: Go, TLS
link: https://github.com/blackvectr/packetproxy
excerpt: "An extensible intercepting proxy for arbitrary binary protocols, with a plugin API for custom codecs."
---

Burp is superb for HTTP — and useless for the proprietary binary protocol your target's thick client speaks. PacketProxy is a man-in-the-middle proxy for *any* protocol, with a small plugin API for decoding, mutating, and re-encoding traffic on the fly.

## Overview

A protocol is described once as a Codec. PacketProxy then handles TLS termination, connection plumbing, and the intercept UI for free.

```go
// Codec decodes and re-encodes a proprietary framing protocol.
type Codec interface {
    Decode(r io.Reader) (*Message, error)
    Encode(m *Message, w io.Writer) error
}

func (p *Proxy) intercept(c Codec, upstream net.Conn) error {
    msg, err := c.Decode(p.client)
    if err != nil { return err }
    p.hooks.OnMessage(msg)          // let the operator mutate it
    return c.Encode(msg, upstream)
}
```

> [!NOTE]
> The interesting attack surface often speaks a protocol no off-the-shelf tool understands. PacketProxy makes that surface reachable.

## Live Mutation

Operators can rewrite decoded messages interactively or script deterministic mutations for fuzzing a binary protocol at the message layer.

## Status & Roadmap

- [x] TLS-terminating proxy core
- [x] Codec plugin API
- [] Message-level fuzzing mode
- [] Session record & replay
