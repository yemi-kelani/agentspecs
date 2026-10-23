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

This is the starting point for the [Agent Specs Quickstart](https://agentspecs.io/quickstart/). It holds no packet yet: you add `packets/add-max-length/` (plan, acceptance check, slice brief, state and handoff) while following the Quickstart, and keep a hold-out check beside the project in `../max-length-holdout/`.
