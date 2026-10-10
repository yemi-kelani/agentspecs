// citations: every external URL in content (outside code) is a verified source in
// src/data/evidence.json or is listed in src/data/links-allowlist.json.
// Matching is exact string equality after lowercasing the scheme (no trailing-slash or fragment
// normalisation); protocol-relative (//host) and bare www. links never match a source, so they fail;
// allowlist `prefixes` match by startsWith.
import { result } from './lib.mjs';
import { lineOf } from '../../src/lib/md-utils.mjs';

export const EVIDENCE = 'src/data/evidence.json';
export const ALLOWLIST = 'src/data/links-allowlist.json';

const URL_RE = /https?:\/\/[^\s<>()[\]"'`{}|\\^]+/gi;
// Protocol-relative targets in Markdown links or href/src attributes: [x](//host/a), href="//host/a".
const PROTOCOL_RELATIVE_RE = /(?:\]\(\s*<?|\b(?:href|src)=["'])(\/\/[^\s<>()"']+)/g;
// GFM bare autolinks: www.host.tld/...
const WWW_RE = /(?<![\w./@-])www\.[a-z0-9-]+\.[^\s<>()[\]"'`{}|\\^]+/gi;
const trimTail = (u) => u.replace(/[.,;:!?*_]+$/, '');

/** External URLs in text: http(s) in any letter case (scheme lowercased), protocol-relative and www. links. */
export function extractUrls(text) {
  const out = [];
  for (const m of text.matchAll(URL_RE)) {
    const raw = trimTail(m[0]);
    out.push({ url: raw.replace(/^https?/i, (s) => s.toLowerCase()), index: m.index });
  }
  for (const m of text.matchAll(PROTOCOL_RELATIVE_RE)) out.push({ url: trimTail(m[1]), index: m.index + m[0].indexOf(m[1]) });
  for (const m of text.matchAll(WWW_RE)) out.push({ url: trimTail(m[0]), index: m.index });
  return out.sort((a, b) => a.index - b.index);
}

export default {
  name: 'citations',
  run(ctx) {
    const r = result();
    const ev = ctx.readJson(EVIDENCE);
    if (ev.error) {
      r.errors.push({ file: EVIDENCE, message: ev.error });
      return r;
    }
    const al = ctx.readJson(ALLOWLIST);
    if (al.error) {
      r.errors.push({ file: ALLOWLIST, message: al.error });
      return r;
    }
    const sources = Array.isArray(ev.value.sources) ? ev.value.sources : [];
    const status = new Map(sources.map((s) => [s.url, s.status]));
    const urls = new Set(al.value.urls ?? []);
    const prefixes = al.value.prefixes ?? [];
    const allowed = (u) => status.get(u) === 'verified' || urls.has(u) || prefixes.some((p) => u.startsWith(p));

    for (const p of ctx.pages) {
      for (const { url, index } of extractUrls(p.codeMasked)) {
        if (allowed(url)) continue;
        const why = status.has(url) ? ` (source status is "${status.get(url)}", not "verified")` : '';
        r.errors.push({
          file: p.file,
          line: lineOf(p.codeMasked, index),
          message: `${url} is not a verified source in ${EVIDENCE} or listed in ${ALLOWLIST}${why}`,
        });
      }
    }
    return r;
  },
};
