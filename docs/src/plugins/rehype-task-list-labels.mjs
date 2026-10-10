// rehype plugin: give GFM task-list checkboxes an accessible name.
// <li class="task-list-item"><input type="checkbox" disabled> Item text</li>
//   -> <li class="task-list-item"><label><input type="checkbox" disabled> Item text</label></li>
// Only the checkbox and the inline content after it go into the label; a nested list or other
// block stays outside. In a loose list the checkbox sits in a <p>, so the label goes inside it.

const BLOCK_TAGS = new Set([
  'address', 'aside', 'blockquote', 'details', 'div', 'dl', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'ol', 'p', 'pre', 'section', 'table', 'ul',
]);

export default function rehypeTaskListLabels() {
  return (tree) => {
    visit(tree);
  };
}

function visit(node) {
  if (!Array.isArray(node.children)) return;
  if (isElement(node, 'li') && hasClass(node, 'task-list-item')) {
    const first = node.children.find((c) => c.type === 'element');
    labelCheckbox(first && first.tagName === 'p' ? first : node);
  }
  for (const child of node.children) visit(child);
}

function labelCheckbox(host) {
  const kids = host.children;
  const start = kids.findIndex((c) => isElement(c, 'input') && c.properties?.type === 'checkbox');
  if (start === -1 || !kids.slice(0, start).every(isBlankText)) return;
  let end = kids.findIndex((c, i) => i > start && c.type === 'element' && BLOCK_TAGS.has(c.tagName));
  if (end === -1) end = kids.length;
  while (end - 1 > start && isBlankText(kids[end - 1])) end--;
  const label = { type: 'element', tagName: 'label', properties: {}, children: kids.slice(start, end) };
  kids.splice(start, end - start, label);
}

function isElement(node, tagName) {
  return node?.type === 'element' && node.tagName === tagName;
}

function hasClass(node, name) {
  const cls = node.properties?.className;
  return Array.isArray(cls) ? cls.includes(name) : typeof cls === 'string' && cls.split(/\s+/).includes(name);
}

function isBlankText(node) {
  return node?.type === 'text' && node.value.trim() === '';
}
