import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/slugify.js';

test('lowercases words and joins them with hyphens', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('drops accents and punctuation', () => {
  assert.equal(slugify('Café, crème & brûlée!'), 'cafe-creme-brulee');
});

test('trims hyphens at both ends and collapses repeats', () => {
  assert.equal(slugify('  --Release   notes--  '), 'release-notes');
});

test('returns an empty string when nothing is left', () => {
  assert.equal(slugify('!!!'), '');
});

test('maxLength cuts at the last whole word that fits', () => {
  assert.equal(slugify('Release notes for May', { maxLength: 15 }), 'release-notes');
  assert.equal(slugify('Release notes for May', { maxLength: 13 }), 'release-notes');
  assert.equal(slugify('Release notes for May', { maxLength: 12 }), 'release');
});

test('maxLength cuts a single long word at the limit', () => {
  assert.equal(slugify('Supercalifragilistic', { maxLength: 5 }), 'super');
});

test('maxLength leaves short slugs unchanged', () => {
  assert.equal(slugify('Hello World', { maxLength: 50 }), 'hello-world');
});

test('maxLength must be a positive integer', () => {
  assert.throws(() => slugify('Hello', { maxLength: 0 }), RangeError);
  assert.throws(() => slugify('Hello', { maxLength: 2.5 }), RangeError);
});
