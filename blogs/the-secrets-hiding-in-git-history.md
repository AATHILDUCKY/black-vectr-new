---
title: "The Secrets Hiding in Your Git History"
date: 2026-07-11
author: "BlackVectr Research Team"
tags: osint, secret-scanning, git, appsec, reconnaissance
excerpt: "A deleted commit is not a deleted secret. How one GitHub username becomes a full map of a developer's leaked credentials — and how to find them before an attacker does."
---

## One username is enough

Hand a security tool a single GitHub username and watch what happens next. It does
not ask for a repository list. It does not need an API key. It enumerates every
public repository that account owns, clones each one, and walks the **entire commit
history** of every branch — not the current files, but every version of every file
that has ever existed. Then it reads each of those historical blobs against a
ruleset built to recognize what a secret looks like.

This is not a hypothetical. It is a workflow that takes a couple of minutes, and it
is exactly the workflow an attacker runs against your team the moment they learn one
developer's handle. We built ReconForge to run that same workflow first — so you find
your own leaks before someone else turns them into an incident.

This post is about the single most common, most damaging, and most quietly persistent
mistake in modern software development: **pushing a secret to a public repository.**

## The mistake everyone makes at least once

I have done it. If you have shipped code for any length of time, you probably have
too. You are moving fast, you hardcode an API key to test something "just for a
second," you commit, you push, and you move on. Later you remember, you delete the
line, you commit the fix, and you feel like you cleaned it up.

You didn't.

Beginners make this mistake constantly, and it is not because they are careless — it
is because Git's behavior is genuinely counterintuitive. A new developer reasonably
assumes that deleting a line and committing removes it. Nobody tells them that Git is
an **append-only history**, that every commit is a permanent snapshot, and that the
"deleted" secret is still sitting one `git log` away forever.

The disasters are almost always small human moments:

- A `.env` file committed before anyone wrote a `.gitignore`.
- An AWS access key pasted into a script to get a demo working before a deadline.
- A `config.py` with a live database password, committed on day one and "fixed" on
  day two.
- A private key checked in "temporarily" and never rotated.
- A personal access token in a CI file, copied from a tutorial that hardcoded it.

None of these are exotic. They are the ordinary texture of learning to build
software. And that is precisely why they are so dangerous — because the mistake is
universal, but the consequences are not evenly distributed. An attacker only needs to
find one.

## Why "I deleted it" is not a fix

Here is the mental model that trips people up. When you remove a secret and commit the
change, your **working tree** is clean. `git status` is happy. The file on GitHub, as
displayed in the browser, no longer shows the key. Everything *looks* fine.

But GitHub is showing you the tip of the branch. The commit that introduced the secret
is still there, reachable by its hash, visible to anyone who clones the repository and
runs:

```bash
git log -p                       # every commit, every diff, in full
git log --all --oneline          # every branch and tag, including old ones
```

The secret lives in that history until the history itself is rewritten (a
`filter-repo` or BFG pass) **and** every fork and cache is dealt with. In practice,
almost nobody does that. So the real remediation for a leaked credential is not
deletion — it is **rotation**. If a key ever touched a public commit, assume it is
compromised and revoke it. Cleaning the history is housekeeping; rotating the secret
is the fix.

This is the gap automated history scanning exists to close: the surface of the
repository looks clean, but the history is where the secrets actually are.

## How the automated scan works

ReconForge's GitHub-user flow is deliberately shaped like an attacker's
reconnaissance, because that is the threat you are trying to get ahead of. It runs in
three stages.

**1. Discover — no API, no key, no rate limit.**
Give it a username and it enumerates every public repository the account owns using
plain HTTP and HTML parsing. There is no GitHub API token to provision and no search
quota to burn. Each repository is scored with heuristic risk flags so the noisy,
high-signal targets rise to the top.

**2. Clone and walk the full history.**
With deep scanning enabled, each repository is cloned and its **entire commit history**
is walked. Critically, this does not scan just the current files — it scans every
*unique* file blob that has ever existed, deduplicated by content hash so a file
version shared across a thousand commits is only inspected once. That dedupe is what
makes scanning deep history on real repositories fast instead of hopeless. Every
finding is reported with its **commit, author, file, and line number**, so you know not
just *that* something leaked, but *when* and *in which commit* it entered the history.

**3. Match, validate, and redact.**
Each blob is run against a unified ruleset that recognizes a long list of concrete
credential formats — AWS, GCP, Azure, GitHub, GitLab, Stripe, Slack, Discord, Twilio,
SendGrid, OpenAI, Anthropic, npm, PyPI, JWTs, PEM private keys — alongside generic
`password=` and `api_key=` assignments, credentials embedded in URLs and database
connection strings, emails, and PII.

The hard part of secret scanning is not matching — it is **not drowning in false
positives.** ReconForge keeps the noise down with:

- **Shannon-entropy gating** on generic patterns, so `api_key = "your-key-here"` is
  ignored while a genuinely random 40-character string is flagged.
- A **placeholder denylist** (`changeme`, `${VAR}`, `xxxx`, and friends).
- **Luhn validation** for credit-card numbers and structural validation for US SSNs,
  so a random 16-digit number is not mistaken for a card.
- Per-value **deduplication**, so the same key across fifty commits is one finding,
  not fifty.

And every reported secret is **redacted** in the output. The tool proves the leak
exists and shows you the surrounding context and exact line — it does not splash the
live credential across your terminal or your database.

## Seeing it, not just listing it

Findings are only useful if you can act on them, so the web console is built around
triage rather than a wall of text. Paste a username, enable deep scanning, and launch:

- Each repository gets its **own live progress bar**, streamed over Server-Sent Events,
  with a deep-link that opens the repo in a new tab.
- Repositories with more than a thousand commits are gated behind a manual **Scan**
  button rather than run automatically — deep history is expensive, and you decide when
  to spend the budget.
- Click any finding to open a **detail drawer** with the exact code snippet, the matched
  line highlighted, the commit and author metadata, and a **"View file on GitHub"**
  deep-link that takes you straight to the offending line in history.

The point is to go from "this account has leaked something" to "here is the exact commit,
the exact line, and the link to prove it" in a couple of clicks.

## What to do when you find one

Finding the leak is the easy half. The response is what matters, and the order matters:

1. **Rotate first.** Revoke and reissue the credential before anything else. Assume any
   secret that reached a public commit is already known to someone.
2. **Check for abuse.** Review access logs and billing for the affected service. Leaked
   cloud keys are frequently found and used within *minutes* by automated scrapers — the
   same kind of automation described in this post, pointed at you.
3. **Then clean the history** — `git filter-repo` or BFG — understanding that this is
   hygiene, not remediation. Forks and caches may still hold the old commit.
4. **Prevent the next one.** Add a pre-commit secret scanner, a `.gitignore` that covers
   `.env` and key files, and — ideally — a scheduled scan of your own org's public
   footprint so a new leak is caught in hours, not after a breach.

## The uncomfortable takeaway

The reason this class of mistake causes so much damage is not that developers are
negligent. It is that the mistake is *easy to make, invisible after you "fix" it, and
trivial to find at scale.* An attacker does not need to guess. They point automation at a
username and let it read years of commit history in the time it takes to make coffee.

The defense is to run that same automation yourself, on a schedule, against your own
people and repositories — and to internalize the one rule that would prevent most of
these incidents entirely: **a secret that ever touched a commit is a secret you rotate,
not a secret you delete.**

ReconForge exists to make finding those secrets a routine, boring, five-minute part of
your week — instead of a headline.

---

*ReconForge is intended for authorized security testing, CTF, and research only. Scan
usernames, repositories, and infrastructure that you own or have explicit written
permission to assess. You are responsible for complying with all applicable laws and
platform terms of service.*
