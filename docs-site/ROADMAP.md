# Roadmap

Agent Specs is at v0.1 (draft). This file lists what v0.1 leaves out on purpose and the questions no source has tested yet. It is a repository file, not a site page.

## Out of scope for v0.1

- **Validator CLI.** A command that checks a spec set against the Specification: required sections in plan.md and phase files, the state.json shape, phase table rows that match files on disk, and a valid HANDOFF.md for every phase marked done. Today the checks are manual (Reference > Checklist).
- **GitHub Action.** Runs the validator on pull requests that touch `work/`, so a broken spec set fails review instead of a later phase.
- **Registry.** A shared index of reusable phase files, skills and example spec sets, with versions. Needs the validator first.
- **Translations.** The site is English only. Starlight supports localized pages; translation waits until the format stops changing.

## Open questions (untested)

This section holds every item on the Evidence page's "Untested parts of Agent Specs" list (https://agentspecs.io/evidence/), plus open design questions the v0.1 Specification leaves undecided. Change both together.

- **Does splitting a task spec change compliance?** No study tests a plan split into phase files and handoffs. The closest result, a factorial study of agent configuration files, found no compliance gain from splitting one file into several.
- **Do the size budgets matter for compliance?** The plan.md, phase file and HANDOFF.md budgets rest on cost and focus. The same study found no detectable effect of file length between 25 and 500 lines.
- **When should a task escalate to the full tree?** The roughly 150-line plan.md trigger is the owner's rule of thumb with no source, and the roughly 40% context trigger is a practitioner warning that has since moved.
- **Does the HANDOFF.md template help the next phase?** Its fields follow qualitative advice on briefing subagents; no study tests whether a fixed report beats a free-form one.
- **Do the one-hop rule, landing spots and the sizing gate work as a whole?** Each is a design choice; none has been tested on its own or together.
- **One agent or several?** Anthropic says it is still unclear whether one general-purpose coding agent or a multi-agent setup works best across contexts, and multi-agent runs cost far more tokens. No study compares phased spec sets with a single long session.
- **Do the injection mitigations work?** Read-only sources with a hashed MANIFEST.md, distilled handoffs and output scanning are design choices with no supporting study, and published attacks show that skill scanners can be evaded.
- **How do nested AGENTS.md files combine?** Tools disagree (nearest file wins versus concatenation), and v0.1 does not define it.
- **Does every agent read AGENTS.md at the start?** No cross-tool source confirms it. Some tools read it only when their own instruction file is absent.
- **Is JSON safer than Markdown for status?** The choice of state.json follows one vendor's observation that models changed JSON less often by mistake. It has not been measured.
