// remark plugin: render the exact evidence-label tokens as badges.
// `[Established]` -> <a class="label-link" href="/evidence/#labels" title="Established: ...">
//                      <span class="label label--established">Established</span></a>
// Only text nodes are touched, so inline code and code blocks keep the raw token.
// Inside link text the badge is a bare <span> (no nested link).
import { LABEL_HREF, LABEL_TOKEN_RE, labelByName } from '../lib/labels.mjs';

export default function remarkLabels() {
  return (tree) => {
    walk(tree, false);
  };
}

const LINK_TYPES = new Set(['link', 'linkReference']);

function walk(node, inLink) {
  if (!Array.isArray(node.children)) return;
  const insideLink = inLink || LINK_TYPES.has(node.type);
  let changed = false;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text') {
      const parts = splitText(child.value, insideLink);
      if (parts) {
        next.push(...parts);
        changed = true;
        continue;
      }
    } else {
      walk(child, insideLink);
    }
    next.push(child);
  }
  if (changed) node.children = next;
}

function splitText(value, insideLink) {
  const re = new RegExp(LABEL_TOKEN_RE.source, 'g');
  let match;
  let last = 0;
  const parts = [];
  while ((match = re.exec(value)) !== null) {
    if (match.index > last) parts.push({ type: 'text', value: value.slice(last, match.index) });
    parts.push(badge(labelByName(match[1]), insideLink));
    last = match.index + match[0].length;
  }
  if (parts.length === 0) return null;
  if (last < value.length) parts.push({ type: 'text', value: value.slice(last) });
  return parts;
}

function badge(label, insideLink) {
  const title = `${label.name}: ${label.definition}`;
  const span = {
    type: 'labelBadge',
    data: {
      hName: 'span',
      hProperties: insideLink
        ? { className: ['label', `label--${label.kind}`], title }
        : { className: ['label', `label--${label.kind}`] },
    },
    children: [{ type: 'text', value: label.name }],
  };
  if (insideLink) return span;
  return {
    type: 'labelLink',
    data: { hName: 'a', hProperties: { className: ['label-link'], href: LABEL_HREF, title } },
    children: [span],
  };
}
