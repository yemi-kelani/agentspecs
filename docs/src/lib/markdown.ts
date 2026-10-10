// Markdown export shared by `/<slug>.md` (src/pages/[...slug].md.ts) and, later, llms-full.txt.
// Output: "# <title>", blank line, "> <description>", blank line, body (frontmatter removed).
// Label tokens such as [Proposal] stay as raw text. Code (fenced and inline) is never altered.
// Keep this file to erasable TypeScript syntax so `node --test` can import it directly.
import { splitFences, splitFrontmatter } from './md-utils.mjs';

export interface PageMarkdownInput {
  title: string;
  description?: string;
  /** Page source; a leading frontmatter block is removed if present. */
  body: string;
  /** 'mdx' also drops imports/MDX comments and converts components to Markdown. */
  format?: 'md' | 'mdx';
}

/** Render one docs page as standalone Markdown. */
export function pageToMarkdown({ title, description, body, format = 'md' }: PageMarkdownInput): string {
  const source = splitFrontmatter(body).body;
  const text = format === 'mdx' ? mdxToMarkdown(source) : proseToMarkdown(source, false);
  const header = `# ${title}\n` + (description ? `\n> ${description}\n` : '');
  const content = text.trim();
  return content ? `${header}\n${content}\n` : header;
}

/** Convert an MDX body (no frontmatter) to plain Markdown. */
export function mdxToMarkdown(body: string): string {
  return proseToMarkdown(body, true);
}

function proseToMarkdown(body: string, isMdx: boolean): string {
  const { text: masked, restore } = mask(body);
  let text = masked;
  if (isMdx) text = convertMdx(text);
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = convertAsides(text);
  text = text.replace(/^[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  return text ? restore(text) + '\n' : '';
}

// ---------- code masking ----------

const PH = '\u0000';

function mask(body: string): { text: string; restore: (s: string) => string } {
  const saved: string[] = [];
  const keep = (s: string, kind: 'F' | 'I') => {
    saved.push(s);
    return `${PH}${kind}${saved.length - 1}${PH}`;
  };
  const text = splitFences(body)
    .map((seg: { code: boolean; text: string }) =>
      seg.code ? keep(seg.text, 'F') : seg.text.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (m) => keep(m, 'I')),
    )
    .join('\n');
  const restore = (s: string) =>
    s
      .split('\n')
      .map((line) =>
        line.replace(new RegExp(`^(.*?)${PH}F(\\d+)${PH}`), (_m, prefix: string, i: string) => {
          // Continuation lines of a restored fence keep the prefix (blockquote) or its width (list).
          const cont = /^[>\s]*$/.test(prefix) ? prefix : ' '.repeat(prefix.length);
          return saved[Number(i)]
            .split('\n')
            .map((l, n) => ((n === 0 ? prefix : cont) + l).replace(/^(>[> ]*?) +$/, '$1'))
            .join('\n');
        }),
      )
      .join('\n')
      .replace(new RegExp(`${PH}I(\\d+)${PH}`, 'g'), (_m, i: string) => saved[Number(i)]);
  return { text, restore };
}

// ---------- MDX ----------

function attrs(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([A-Za-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|\{\s*["'`]([^"'`]*)["'`]\s*\})/g;
  for (const m of src.matchAll(re)) out[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  return out;
}

function dedent(s: string): string {
  const lines = s.replace(/^\n+|\s+$/g, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => /^[ \t]*/.exec(l)![0].length);
  const n = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(n)).join('\n');
}

function listItem(lead: string, body: string): string {
  const lines = dedent(body).split('\n');
  const first = lines.shift() ?? '';
  const rest = lines.map((l) => (l ? '  ' + l : l));
  return [`- ${lead}${first}`.trimEnd(), ...rest].join('\n');
}

function convertMdx(text: string): string {
  return (
    text
      // ESM lines
      .replace(/^(?:import|export)\s[^\n]*(?:\n|$)/gm, '')
      // MDX comments {/* ... */}
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      // <LinkCard title href description />
      .replace(/^[ \t]*<LinkCard\b([\s\S]*?)\/>[ \t]*$/gm, (_m, a: string) => {
        const { title = '', href = '', description } = attrs(a);
        return `- [${title}](${href})` + (description ? `: ${description}` : '');
      })
      // <Card title>body</Card>
      .replace(/^[ \t]*<Card\b([^>]*)>([\s\S]*?)^[ \t]*<\/Card>[ \t]*$/gm, (_m, a: string, body: string) => {
        const { title } = attrs(a);
        return listItem(title ? `**${title}**: ` : '', body);
      })
      // <Aside type title>body</Aside> -> directive, converted with the other asides
      .replace(/^[ \t]*<Aside\b([^>]*)>([\s\S]*?)<\/Aside>[ \t]*$/gm, (_m, a: string, body: string) => {
        const { type = 'note', title } = attrs(a);
        return `:::${type}${title ? `[${title}]` : ''}\n${dedent(body)}\n:::`;
      })
      // <TabItem label> -> bold label line
      .replace(/^[ \t]*<TabItem\b([^>]*)>[ \t]*$/gm, (_m, a: string) => `**${attrs(a).label ?? ''}**\n`)
      // <Badge text /> -> text
      .replace(/<Badge\b([^>]*?)\/>/g, (_m, a: string) => attrs(a).text ?? '')
      // Remaining component tags on their own line (wrappers like CardGrid, Tabs, Steps, FileTree)
      .replace(/^[ \t]*<\/?[A-Z][\w.]*\b[^>]*>[ \t]*(?:\n|$)/gm, '')
      // Remaining inline self-closing components
      .replace(/<[A-Z][\w.]*\b[^>]*\/>/g, '')
  );
}

// ---------- asides ----------

const ASIDE_OPEN = /^:::(note|tip|caution|danger)(?:\[([^\]]*)\])?\s*(?:\{[^}]*\})?\s*$/;

function convertAsides(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = ASIDE_OPEN.exec(lines[i]);
    if (!m) {
      out.push(lines[i]);
      continue;
    }
    let j = i + 1;
    while (j < lines.length && !/^:::\s*$/.test(lines[j])) j++;
    const kind = m[1][0].toUpperCase() + m[1].slice(1);
    const body = lines.slice(i + 1, j).join('\n').replace(/^\n+|\s+$/g, '');
    out.push(`> **${m[2] ? `${kind}: ${m[2]}` : kind}**`, '>');
    for (const l of body.split('\n')) out.push(l ? `> ${l}` : '>');
    i = j;
  }
  return out.join('\n');
}
