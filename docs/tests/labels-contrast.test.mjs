// Label badge colours: four distinct kinds, WCAG AA (4.5:1) text contrast in light and dark.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/labels.css', import.meta.url), 'utf8');
const KINDS = ['established', 'evidence', 'heuristic', 'proposal'];

function block(selectorRe) {
  const m = selectorRe.exec(css);
  assert.ok(m, `missing block ${selectorRe}`);
  return m[1];
}
function tokens(text) {
  const out = {};
  for (const m of text.matchAll(/--label-(\w+)-(fg|bg):\s*(#[0-9a-f]{6})/gi)) out[`${m[1]}-${m[2]}`] = m[3];
  return out;
}
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const themes = {
  dark: tokens(block(/:root\s*\{([^}]*)\}/)),
  light: tokens(block(/:root\[data-theme='light'\]\s*\{([^}]*)\}/)),
};

for (const [theme, t] of Object.entries(themes)) {
  test(`${theme}: every label has fg/bg with ≥4.5:1 contrast`, () => {
    for (const k of KINDS) {
      assert.ok(t[`${k}-fg`] && t[`${k}-bg`], `${theme} ${k} tokens missing`);
      const ratio = contrast(t[`${k}-fg`], t[`${k}-bg`]);
      assert.ok(ratio >= 4.5, `${theme} ${k}: ${ratio.toFixed(2)}:1`);
    }
  });
  test(`${theme}: the four labels use distinct colours`, () => {
    assert.equal(new Set(KINDS.map((k) => t[`${k}-fg`])).size, 4);
    assert.equal(new Set(KINDS.map((k) => t[`${k}-bg`])).size, 4);
  });
}

test('each kind has a class rule', () => {
  for (const k of KINDS) assert.match(css, new RegExp(`\\.label--${k}\\s*\\{`));
});
