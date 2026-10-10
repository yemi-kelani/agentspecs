// specsets: every work/<task-id>/ spec set under the site root conforms to the Specification
// (structure only; verify commands are not run here — see scripts/lib/conformance.mjs).
import { result } from './lib.mjs';
import { findSpecSets, validateSpecSet } from '../lib/conformance.mjs';

export default {
  name: 'specsets',
  run(ctx) {
    const r = result();
    for (const dir of findSpecSets(ctx.root)) {
      for (const message of validateSpecSet(dir).errors) r.errors.push({ file: 'work', message });
    }
    return r;
  },
};
