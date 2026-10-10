// frontmatter: `title` present and ≤60 chars; `description` present, exactly one sentence, ends with a period.
import { result } from './lib.mjs';

const MAX_TITLE = 60;
// Abbreviations that contain a period but do not end a sentence.
const ABBREVIATIONS = /\b(?:e\.g|i\.e|etc|vs|cf|approx)\./gi;

export function sentenceProblem(description) {
  const text = description.trim();
  if (!text.endsWith('.') || text.endsWith('..')) return 'description must end with a period';
  const core = text.replace(ABBREVIATIONS, 'abbr').slice(0, -1);
  if (/[.!?](?=\s|$)/.test(core) || /[!?]/.test(core)) return 'description must be exactly one sentence';
  return null;
}

export default {
  name: 'frontmatter',
  run(ctx) {
    const r = result();
    for (const p of ctx.pages) {
      const err = (message) => r.errors.push({ file: p.file, line: 1, message });
      if (p.fmRaw === null) {
        err('no frontmatter block');
        continue;
      }
      if (p.fmError) {
        err(`invalid YAML in frontmatter: ${p.fmError}`);
        continue;
      }
      const { title, description } = p.data;
      if (typeof title !== 'string' || !title.trim()) err('title is missing');
      else if (title.length > MAX_TITLE) err(`title is ${title.length} chars (max ${MAX_TITLE})`);
      if (typeof description !== 'string' || !description.trim()) err('description is missing');
      else {
        const problem = sentenceProblem(description);
        if (problem) err(`${problem}: "${description}"`);
      }
    }
    return r;
  },
};
