# Markdown content

This directory is the editable content source for the site. Public URLs remain
clean GitHub Pages routes; do not put generated HTML in this directory.

## Collections

- `research/` publishes Markdown files to `/blog/<filename>` and lists them on
  `/blog` and the home page.
- `projects/` publishes Markdown files to `/projects/<filename>` and lists them
  on `/projects` and the home page.

The About, Services, Contact, and landing pages are composed application layouts,
so their content remains in `assets/js/app.js` rather than item-based Markdown.

## Add research

Create `research/my-research.md`:

```markdown
---
title: "Research title"
date: 2026-07-11
author: "BlackVectr Research Team"
tags: appsec, research
excerpt: "A short description used on cards and in search metadata."
---

## First section

Write the article here.
```

## Add a project

Create `projects/my-project.md`:

```markdown
---
title: "Project name — Short purpose"
date: 2026-07-11
author: "BLACK VECTR Engineering"
tags: python, security, automation
status: Active
role: Research & Engineering
stack: Python, Git
link: https://github.com/example/repository
excerpt: "A short project summary used on listing cards."
---

## Overview

Describe the project here.
```

The `link` field is optional. Filenames must use lowercase kebab-case.

## Publish locally

From the repository root, run:

```bash
python3 update.py
```

This validates front matter and updates the content index, static routes,
sitemap, and service-worker version. When run locally, it also stages the
site-managed files, creates an `update generated site content` commit when needed,
and pushes the current branch to `origin`.

Use `python3 update.py --no-publish` to generate without committing or pushing.
Use `python3 update.py --check` for a read-only check that fails when generated
files are stale. GitHub Actions uses `--no-publish` to avoid deployment loops.
