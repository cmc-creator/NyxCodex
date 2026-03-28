import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const configPath = path.join(workspaceRoot, 'site.urls.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));

const canonicalLive = String(config.liveSiteUrl || '').replace(/\/+$/, '/');
const canonicalRepo = String(config.repoUrl || '').replace(/\/+$/, '');

if (!canonicalLive || !canonicalRepo) {
  console.error('site.urls.json must define liveSiteUrl and repoUrl');
  process.exit(1);
}

const oldUrls = [
  'https://cmc-creator.github.io/Training-Lab/',
  'https://github.com/cmc-creator/Training-Lab'
];

const skipDirs = new Set(['.git', 'node_modules', '.vscode']);

async function collectMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.github')) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await collectMarkdownFiles(full));
      }
      continue;
    }

    if (skipDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function normalizeRoot(url) {
  return url.replace(/\.git$/, '').replace(/\/+$/, '');
}

function findMatches(content, regex) {
  return [...content.matchAll(regex)].map(match => match[0]);
}

const markdownFiles = await collectMarkdownFiles(workspaceRoot);
const errors = [];

for (const filePath of markdownFiles) {
  const rel = path.relative(workspaceRoot, filePath).replace(/\\/g, '/');
  const content = await fs.readFile(filePath, 'utf8');

  for (const oldUrl of oldUrls) {
    if (content.includes(oldUrl)) {
      errors.push(`${rel}: contains deprecated URL ${oldUrl}`);
    }
  }

  const repoRoots = findMatches(content, /https:\/\/github\.com\/cmc-creator\/[A-Za-z0-9_.-]+(?:\.git)?/g);
  for (const rootUrl of repoRoots) {
    if (normalizeRoot(rootUrl) !== canonicalRepo) {
      errors.push(`${rel}: non-canonical GitHub repo URL ${rootUrl} (expected ${canonicalRepo})`);
    }
  }

  const pagesRoots = findMatches(content, /https:\/\/cmc-creator\.github\.io\/[A-Za-z0-9_.-]+\/?/g);
  for (const rootUrl of pagesRoots) {
    const normalized = rootUrl.endsWith('/') ? rootUrl : `${rootUrl}/`;
    if (normalized !== canonicalLive) {
      errors.push(`${rel}: non-canonical Pages URL ${rootUrl} (expected ${canonicalLive})`);
    }
  }
}

if (errors.length) {
  console.error('URL validation failed:\n');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(`URL validation passed across ${markdownFiles.length} markdown files.`);
