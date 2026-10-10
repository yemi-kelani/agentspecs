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
