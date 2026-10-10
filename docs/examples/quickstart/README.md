# slugify-demo

A tiny, dependency-free Node project: one `slugify` function and its tests.

```js
import { slugify } from './src/slugify.js';
slugify('Café, crème & brûlée!'); // 'cafe-creme-brulee'
```

## Run the tests

```bash
node --test
```

Needs Node 22 or later. There is nothing to install.

## Why it exists

This is the starting point for the [Agent Specs Quickstart](https://agentspecs.io/quickstart/). It holds no spec files yet: you add `AGENTS.md` and a `work/` spec set while following the Quickstart.
