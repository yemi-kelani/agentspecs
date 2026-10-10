// Shared loader for the check harness. Builds one context object every check reads from.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { splitFrontmatter, maskCode, isStub } from '../../src/lib/md-utils.mjs';

export const CONTENT_DIR = 'src/content/docs';

/** Recursively list files under dir (absolute paths). Missing dir -> []. */
export function walkFiles(dir, filter = () => true) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.DS_Store') continue;
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) out.push(...walkFiles(abs, filter));
    else if (filter(abs)) out.push(abs);
  }
  return out.sort();
}

export function toPosix(p) {
  return p.split(sep).join('/');
}

/** Slug of a content file relative to the content dir: "concepts/sizing", "index", "reference/index". */
export function slugOf(rel) {
  return toPosix(rel).replace(/\.(md|mdx)$/, '');
}

function loadPage(root, abs) {
  const raw = readFileSync(abs, 'utf8');
  const rel = toPosix(relative(join(root, CONTENT_DIR), abs));
  const { frontmatter: fmRaw, body, bodyStartLine } = splitFrontmatter(raw);
  let data = null;
  let fmError = null;
  if (fmRaw !== null) {
    try {
      data = parseYaml(fmRaw) ?? {};
    } catch (e) {
      fmError = e.message.split('\n')[0];
    }
  }
  // Masked text keeps line numbers; frontmatter is blanked so prose scans skip it.
  const fmLen = raw.length - body.length;
  const maskedBody = maskCode(body);
  const masked = raw.slice(0, fmLen).replace(/[^\n]/g, ' ') + maskedBody;
  return {
    abs,
    rel, // relative to content dir, posix
    file: toPosix(relative(root, abs)), // relative to site root, for messages
    slug: slugOf(rel),
    format: abs.endsWith('.mdx') ? 'mdx' : 'md',
    raw,
    body,
    bodyStartLine,
    fmRaw,
    data,
    fmError,
    masked, // code and frontmatter blanked
    codeMasked: raw.slice(0, fmLen) + maskedBody, // code blanked, frontmatter kept
    stub: isStub(masked),
  };
}

export function loadContext({ root, paths = [], allowStubs = false }) {
  root = resolve(root);
  const contentRoot = join(root, CONTENT_DIR);
  const allPages = walkFiles(contentRoot, (f) => /\.(md|mdx)$/.test(f)).map((f) => loadPage(root, f));
  const scoped = paths.map((p) => resolve(p));
  const inScope = (abs) => scoped.length === 0 || scoped.some((p) => abs === p || abs.startsWith(p + sep));
  return {
    root,
    contentRoot,
    allPages,
    pages: allPages.filter((p) => inScope(p.abs)),
    scoped,
    inScope,
    allowStubs,
    readJson(rel) {
      const abs = join(root, rel);
      if (!existsSync(abs)) return { error: `${rel} not found` };
      try {
        return { value: JSON.parse(readFileSync(abs, 'utf8')) };
      } catch (e) {
        return { error: `${rel} is not valid JSON: ${e.message}` };
      }
    },
  };
}

/** Helper to build a result object. */
export function result() {
  return { errors: [], warnings: [], skipped: null };
}
