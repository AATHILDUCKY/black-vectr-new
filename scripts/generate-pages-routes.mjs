import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shell = join(root, 'index.html');

const fixedRoutes = ['about', 'services', 'projects', 'blog', 'contact'];

function markdownSlugs(dir) {
  return readdirSync(join(root, dir))
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}

function writeRoute(route) {
  const target = join(root, route, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(shell, target);
}

[
  ...fixedRoutes,
  ...markdownSlugs('blogs').map(slug => `blog/${slug}`),
  ...markdownSlugs('projects').map(slug => `projects/${slug}`)
].forEach(writeRoute);

copyFileSync(shell, join(root, '404.html'));
