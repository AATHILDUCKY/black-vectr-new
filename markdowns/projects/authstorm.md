---
title: "AuthStorm — SSO Testing Toolkit"
date: 2026-02-08
author: "BLACK VECTR Engineering"
tags: appsec, oauth, saml
status: Open Source
role: Design & Engineering
stack: TypeScript, Node.js
link: https://github.com/blackvectr/authstorm
excerpt: "A toolkit for probing OAuth, OIDC, and SAML flows for the misconfigurations that lead to account takeover."
---

Federated authentication is subtle, and its failure modes are catastrophic. AuthStorm automates the well-known — and not-so-well-known — attacks against OAuth, OIDC, and SAML implementations.

## Overview

AuthStorm checks redirect_uri validation, PKCE enforcement, state/nonce handling, and the classic token-substitution and mix-up attacks.

```javascript
import { AuthStorm } from "authstorm";

const storm = new AuthStorm({ target: "https://app.example.com" });

// Probe the redirect_uri validation for open-redirect / token theft
const results = await storm.oauth.testRedirectUri([
  "https://evil.example.com",
  "https://app.example.com.evil.com",
  "https://app.example.com@evil.com",
  "//evil.example.com",
]);

results.filter(r => r.accepted).forEach(r =>
  console.warn("Weak redirect_uri accepted:", r.value)
);
```

> [!WARNING]
> An account-takeover in the SSO layer is an account-takeover everywhere. Auth bugs are force multipliers.

## SAML

For SAML it probes signature-wrapping, comment-injection in NameID, and unsigned-assertion acceptance — bugs that still ship in production IdPs.

## Status & Roadmap

- [x] OAuth/OIDC probes
- [x] SAML signature-wrapping tests
- [] Automated PoC generation
- [] Burp extension
