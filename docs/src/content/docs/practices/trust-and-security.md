---
title: Trust and security
description: What can go wrong when an agent reads untrusted content or keeps memory across sessions, and which controls limit the damage.
---

A coding agent reads issue text, web pages, dependencies, skills and its own saved notes, and it runs commands with your permissions. This page asks what can go wrong when someone else wrote some of that content, and what limits the damage.

## Short answer

[Evidence] Instructions planted in content an agent reads can steer it, and Willison argues that no one can yet prevent this reliably ([R122](/evidence/ledger/#r122), [R128](/evidence/ledger/#r128)). His lethal trifecta names when that turns into data theft: one agent with private data, untrusted content and a way to send data out ([R129](/evidence/ledger/#r129)). Planted instructions can outlive a session: one memory-poisoning attack fired in later sessions, and a prompt defence barely changed that ([R28](/evidence/ledger/#r28), [R28a](/evidence/ledger/#r28a)). No row measures a defence that stops injection; the controls the rows describe narrow what an agent may use and catch secrets before they leave ([R117](/evidence/ledger/#r117), [R118](/evidence/ledger/#r118), [R125](/evidence/ledger/#r125)).

## What the evidence shows

### Instructions hidden in what the agent reads

- [Evidence] Indirect prompt injection plants instructions in content an LLM application later retrieves, steering it without direct access. A 2023 paper showed it against Bing Chat and code-completion tools; it sets out the threat, not current attack rates ([R122](/evidence/ledger/#r122)).
- [Evidence] Willison argues that prompt injection cannot yet be prevented reliably, that guardrails claiming to stop about 95% of attacks fall short because 95% is a failing grade in security, and that MCP makes mixing tools from different sources easy. This is one practitioner's view as of June 2025 ([R128](/evidence/ledger/#r128)).
- [Evidence] His lethal trifecta is an agent that combines access to private data, exposure to untrusted content and the ability to communicate externally, which lets injected instructions send data out. He sees avoiding that combination as the only safe approach. It is a threat model, not a measure of how often attacks succeed ([R129](/evidence/ledger/#r129)).

### Skills and the scripts they carry

- [Evidence] Researchers showed that one added instruction and a script in a public skill made Claude Code send a user's file to an outside server, and that a "don't ask again" approval for a harmless action carried over to the malicious script. The demonstrations report no success rates ([R26](/evidence/ledger/#r26)). The authors argue that agents treat every line of a skill as an instruction ([R26a](/evidence/ledger/#r26a)).
- [Evidence] On a benchmark of 23 skills, contextual injections succeeded 8.6% to 67.6% of the time across models and safety policies, and payloads in bundled scripts succeeded more often than payloads in the skill text, 71.8% against 53.8% ([R27](/evidence/ledger/#r27), [R27a](/evidence/ledger/#r27a)). In one preprint, a payload disguised as ordinary-looking vulnerable code reached 58.8% success with few agent warnings ([R123](/evidence/ledger/#r123)).
- [Evidence] An automated scan flagged 26.1% of 31,132 marketplace skills with a vulnerability pattern, and skills with scripts had 2.12 times the odds of a flag ([R27e](/evidence/ledger/#r27e), [R27f](/evidence/ledger/#r27f)). Among 157 confirmed malicious skills, 84.2% of the vulnerabilities sat in the SKILL.md text rather than in code ([R27b](/evidence/ledger/#r27b)).
- [Evidence] An adaptive attacker evaded one open-source skill scanner in up to 97% of runs ([R124](/evidence/ledger/#r124)). When an injected skill first had to win retrieval among many benign ones, an attack built for that retrieval step succeeded 22% of the time, against 10% for existing injections, in the authors' main setting ([R27d](/evidence/ledger/#r27d)).
- [Evidence] Anthropic warns that malicious skills can direct an agent to exfiltrate data, and advises installing skills only from trusted sources and auditing less-trusted ones, scripts and network calls included ([R121](/evidence/ledger/#r121)).

### Memory across sessions

- [Evidence] A memory-poisoning attack stored malicious rules in agent memory and triggered them in later sessions, with 66.9% injection and 81.7% cross-session success in a Claude Code harness. The workspace was simulated and the harness ran DeepSeek-V4 and Qwen3-Max, not Claude models ([R28](/evidence/ledger/#r28)).
- [Evidence] A sandwich-style prompt defence in the same study reduced injection but left cross-session success nearly unchanged ([R28a](/evidence/ledger/#r28a)).
- [Evidence] Memory also goes stale with no attacker. On a benchmark of memories made outdated by later evidence, the best model scored 55.2%, and all but one memory framework scored below the plain model, 5.1% to 17.8% against 8.7%. The scenarios were personal-assistant ones generated by an LLM, not coding ([R24](/evidence/ledger/#r24)).
- [Evidence] In the best-scoring memory framework, the outdated evidence ranked first in 84.5% to 88.2% of cases, even when the new evidence was also retrieved ([R24a](/evidence/ledger/#r24a)).

### Tool permissions

- [Evidence] In Claude Code, a skill's allowed-tools field pre-approves the listed tools for the turn that invokes it; it does not restrict which tools are available ([R116](/evidence/ledger/#r116)).
- [Evidence] A Claude Code subagent definition can limit tools with an allowlist or a denylist, and the denylist applies first. A denylist entry removes the whole tool, so blocking specific commands takes permission rules ([R117](/evidence/ledger/#r117)).
- [Evidence] VS Code's docs say worktree isolation keeps an agent's changes apart but does not restrict its commands or network access ([R115](/evidence/ledger/#r115)); [Subagents and parallel work](/practices/subagents/) covers worktrees.

### Secrets

- [Evidence] GitHub says that after you rewrite history and force-push, removed commits may still be reachable in clones, forks, cached views and pull requests, and that its Support team removes only data whose risk rotating credentials cannot fix ([R120](/evidence/ledger/#r120)).
- [Evidence] GitHub's docs say Git data in a fork network may be reachable from any repository in it, even after a fork is deleted ([R119](/evidence/ledger/#r119)). Truffle Security reported in 2024 that it could reach deleted and private fork data this way ([R127](/evidence/ledger/#r127)).
- [Evidence] Scanners can stop a secret before it is pushed. GitHub secret scanning takes custom patterns with push protection ([R118](/evidence/ledger/#r118)). git-secrets can read its banned patterns from a program outside any repository and install a pre-commit hook ([R125](/evidence/ledger/#r125)), and Gitleaks reads its configuration from a flag, an environment variable or a file and scans history ([R126](/evidence/ledger/#r126)). In both tools, files inside the repository can still cancel matches ([R125](/evidence/ledger/#r125), [R126](/evidence/ledger/#r126)).

## What to do

- Treat issue text, web pages, fetched documents and tool output as data that may carry planted instructions, not as instructions to follow ([R122](/evidence/ledger/#r122), [R128](/evidence/ledger/#r128)).
- Check each agent set-up against the lethal trifecta: where one agent has private data, untrusted content and a way to send data out, Willison's framing says to remove one of the three ([R129](/evidence/ledger/#r129)).
- Limit tools with controls that restrict, such as a subagent's tools allowlist or permission rules, not with fields that only pre-approve, such as a skill's allowed-tools ([R116](/evidence/ledger/#r116), [R117](/evidence/ledger/#r117)).
- Do not count a worktree or a prompt-level defence as containment, since neither limits commands or stopped cross-session poisoning ([R115](/evidence/ledger/#r115), [R28a](/evidence/ledger/#r28a)).
- Read what an agent saves to memory or instruction files before later sessions load it, and remove entries that have gone stale ([R28](/evidence/ledger/#r28), [R24a](/evidence/ledger/#r24a)).
- Be wary of standing approvals such as "don't ask again", which in one demonstration carried over to a malicious script ([R26](/evidence/ledger/#r26)).
- Install skills only from sources you trust, and read their scripts and network calls before use ([R121](/evidence/ledger/#r121), [R27a](/evidence/ledger/#r27a)); [agentskills.io](https://agentskills.io) covers skills in depth.
- Do not take a scanner's clean result as proof that a skill is safe, since an adaptive attacker evaded one scanner in most runs ([R124](/evidence/ledger/#r124)).
- Scan for secrets before they are pushed, with a tool such as GitHub push protection, git-secrets or Gitleaks ([R118](/evidence/ledger/#r118), [R125](/evidence/ledger/#r125), [R126](/evidence/ledger/#r126)).
- Consider keeping the scanner's patterns outside the repository, since files inside it can cancel matches ([R125](/evidence/ledger/#r125), [R126](/evidence/ledger/#r126)).
- Rotate a secret that was pushed, since rewriting history may not remove it from clones, forks or caches ([R120](/evidence/ledger/#r120), [R119](/evidence/ledger/#r119)).

## Not yet known

- Whether any defence stops prompt injection reliably for coding agents. No row measures one that does ([R128](/evidence/ledger/#r128)).
- How often injection through issues, web pages or dependencies succeeds against coding agents on real tasks. The measured attack rates come from skills and a simulated memory workspace ([R27](/evidence/ledger/#r27), [R28](/evidence/ledger/#r28)).
- Whether reading memory and instruction files by hand stops poisoning in real use ([R28](/evidence/ledger/#r28)).
- How stale memory affects coding agents. The staleness benchmark used personal-assistant scenarios ([R24](/evidence/ledger/#r24)).
- How much tool allowlists, sandboxes and network limits each cut the damage of an injection that succeeds.
- More gaps are listed under [Open questions](/evidence/open-questions/).
