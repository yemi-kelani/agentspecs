---
title: Method
description: How the rows in the ledger are selected and checked, and what the Evidence label means.
---

This page explains how the [Ledger](/evidence/ledger/) is built, how the pages use it, and what the one label on this site means.

## Labels

[Evidence] marks a claim that reports what one or more ledger rows found, such as [R1](/evidence/ledger/#r1). It always links the rows, and each row carries its caveat, so read the claim together with the row.

Every sentence that recommends something also links a verified row. A site check enforces this: a recommendation without a row fails the build, and there is no way around it. A question the rows do not settle goes to [Open questions](/evidence/open-questions/) instead of onto a practice page.

## How pages use the rows

The pages follow the rows, not the other way round. Each practice page answers one question that verified rows bear on, and says no more than they do. Claims are worded to fit their source: one small study is reported as one small study, vendor documentation as a description of a product, and a practitioner's account as an account. Null results, conflicts and caveats sit next to the finding they qualify.

Each row also carries a kind (a measured finding, documentation of how a product works, or a team's reported practice) and a strength grade. Both live in the data file for maintainers; the pages describe the study instead.

## Selection

Rows R1 to R30 come from a research review of how coding agents use plans, context, tests and memory. Rows R31 to R157 were verified for earlier versions of this site and kept because a page or the ledger still uses them. Rows from R160 on come from a full-text review, in October 2026, of studies on large-codebase navigation, team instruction files, task length, compaction, session handoff, progressive disclosure and test-driven development. Each of those rows was then re-checked by an independent pass against the source.

Only primary sources count: the paper, the official documentation, or the team's own post. Secondary write-ups, newsletters and aggregator sites are never cited.

## Verification

For each row we fetched the primary source, confirmed the claim, its numbers, sample size and caveats against the full text (not only the abstract, unless the row says so), and recorded:

- the date of the check;
- a quote of fewer than 15 words copied from the source, or a locator such as a section, table or figure;
- a caveat that says what the row does not show, including sample size, setting and whether the work is peer reviewed.

Figures read from charts are marked in the source notes. Where a paper's text and its own figure disagree, the row says so and cites the figure. A row the source did not support is dropped with its reason, never deleted, and no page may cite a dropped row.

## Conflicts

Where rows point different ways, the Ledger records a conflict that names the rows and says what the disagreement does and does not cover. Pages cite the conflict rather than picking a side.
