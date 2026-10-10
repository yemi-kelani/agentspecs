// URL helpers shared by the Markdown endpoint and the Copy page menu.

/** Content id ("index", "concepts/sizing", "reference/index") -> export slug ("index", "concepts/sizing", "reference"). */
export function mdSlug(id) {
  if (!id || id === 'index') return 'index';
  return id.replace(/\/index$/, '');
}

/** Content id -> site-relative Markdown export path, e.g. "/concepts/sizing.md". Home is "/index.md". */
export function mdPathFor(id) {
  return `/${mdSlug(id)}.md`;
}
