// Turn any text into a URL slug: lowercase ASCII words joined by single hyphens.
// Pass { maxLength } to cap the length; the slug is cut at the last whole word that fits.
export function slugify(text, { maxLength = Infinity } = {}) {
  if (maxLength !== Infinity && !(Number.isInteger(maxLength) && maxLength > 0)) {
    throw new RangeError('maxLength must be a positive integer');
  }
  const slug = String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= maxLength) return slug;
  const cut = slug.lastIndexOf('-', maxLength);
  return cut > 0 ? slug.slice(0, cut) : slug.slice(0, maxLength);
}
