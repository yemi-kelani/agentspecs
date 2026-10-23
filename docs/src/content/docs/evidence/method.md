---
title: Method
description: How rows are selected, checked and graded, and what the three claim labels mean.
---

[Judgment] This page explains how the [Ledger](/evidence/ledger/) is built and what the labels on every page mean.

## Labels

Every non-trivial claim on this site starts with one label. A label covers the text up to the next label or the end of its paragraph, list item or table cell.

- **`[Evidence]`** What one or more ledger rows report, read with their strength and caveat. It must link at least one row, such as [R1](/evidence/ledger/#r1).
- **`[Proposal]`** What the packet does, when it follows directly from the linked rows. It must link at least one row.
- **`[Judgment]`** A design choice the evidence does not settle: file names, slice size, reminder frequency, the reviewer checklist, the handoff schema and any sizing guidance. It needs no row.

[Judgment] A site check enforces this: any sentence that recommends something must link a ledger row or sit under a `[Judgment]` label.

## Strength

- **strong:** a peer-reviewed controlled study with adequate sample size and ground-truth scoring, or an independent replication. A tool's own documentation counts as strong, but only for how that tool behaves.
- **moderate:** a controlled study with a disclosed method and sample size, including preprints and workshop papers.
- **weak:** partial disclosure, a small sample or one model, an LLM judge, a post-hoc analysis, or a row checked only at abstract level.
- **anecdotal:** a practitioner report, vendor advice or a design description without an evaluation, or a qualitative demonstration.

## Kinds

- **finding:** something measured.
- **practice:** advice, or a design someone reports using.
- **documentation:** how a tool or format behaves, from its own documentation.

## Selection

[Judgment] Rows R1 to R30 come from a research review of how coding agents use plans, context, tests and memory. Rows from R31 on are claims verified for the first version of this site and kept because a page or the ledger still uses them. Secondary write-ups, newsletters and aggregator sites are never cited; each row cites the primary paper, documentation or post.

## Verification

[Judgment] For each row we fetched the primary source, confirmed the claim, its numbers, sample size and caveats against the full text (not only the abstract, unless the row says so), and recorded:

- the date of the check;
- a quote of fewer than 15 words copied from the source, or a locator such as a section, table or figure;
- a caveat that says what the row does not show.

[Judgment] Figures read from charts are marked in the source notes. Where a paper's text and its own figure disagree, the row says so and cites the figure. A row the source did not support is dropped with its reason, never deleted, and no page may cite a dropped row.

## Conflicts

[Judgment] Where rows point different ways, the Ledger records a conflict that names the rows and says what the disagreement does and does not cover. Pages cite the conflict rather than picking a side.
