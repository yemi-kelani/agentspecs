---
title: Large codebases
description: How coding agents locate the code a task touches in a large repository, and what maps, search tools and code graphs have been shown to do.
---

In a repository with thousands of files, an agent first locates the few places a change touches, and only then makes the change. This page asks how agents locate the right code in a large repository, and what helps them do it.

## Short answer

[Evidence] Agents resolved fewer tasks on larger repositories in three benchmarks, but in each one size is tangled with the project and the difficulty of its tasks ([R169](/evidence/ledger/#r169), [R170](/evidence/ledger/#r170), [CN3](/evidence/ledger/#cn3-does-repository-size-lower-agent-success)). On systems of millions of lines, locating the code took the largest share of an agent's turns ([R171](/evidence/ledger/#r171)). Cheap structure helped in the pipelines tested: a file tree to pick files from, a skeleton view instead of whole files, and summarised search results ([R172](/evidence/ledger/#r172), [R172a](/evidence/ledger/#r172a), [R173](/evidence/ledger/#r173)). Code graphs added a few points with older or smaller models and almost nothing with a more capable one ([R160](/evidence/ledger/#r160), [R163a](/evidence/ledger/#r163a)), and whether an embedding index beats agentic search is unsettled ([CN1](/evidence/ledger/#cn1-does-an-embedding-index-beat-agentic-grep-style-search-for-finding-code)).

## What the evidence shows

### Does success fall as repositories grow?

| Benchmark | Task | Smaller repositories | Larger repositories |
|---|---|---|---|
| FeatBench ([R169](/evidence/ledger/#r169)) | 157 feature tasks, 27 repositories | GPT-5: 60-70% under 200 files | All models: 10-30% over 800 files |
| SWE-bench-Live ([R170](/evidence/ledger/#r170)) | 1,319 issues, OpenHands with Claude 3.7 Sonnet | Often above 20% under 100 files | Rarely above 5% over 500 files |
| RepoMod-Bench ([R167](/evidence/ledger/#r167)) | Translating 21 whole repositories to another language | 91.3% under 10,000 lines | 15.3% over 50,000 lines |

- [Evidence] Each of these reads size from figures or small bins, and size goes with project identity and difficulty ([R169](/evidence/ledger/#r169), [R170](/evidence/ledger/#r170), [R167](/evidence/ledger/#r167)). SWE-bench-Live's newer repositories were smaller than the original SWE-bench ones, yet the best agent resolved fewer of their issues (18.89% against 22.96%), which the authors read as agents overfitting to familiar repositories ([R170a](/evidence/ledger/#r170a)).
- [Evidence] On SWE-Bench Pro, resolve rates fell sharply as the reference patch spanned more files, which measures the size of the change, not of the repository ([R168](/evidence/ledger/#r168)).
- [Evidence] A code question-answering study found no significant link between repository size and the extra cost of agentic exploration across 15 repositories, and called the result inconclusive ([R165c](/evidence/ledger/#r165c)). No study varies size while holding the project and task fixed; see conflict [CN3](/evidence/ledger/#cn3-does-repository-size-lower-agent-success).

### Is locating the code the bottleneck?

- [Evidence] On LoLBench (100 tasks in 29 systems averaging 2.4 million lines), localisation was the largest share of agent turns (60.4% of turns while first writing a change), and missing cross-module context was the largest failure category, both as labelled by the authors' classifier; the best agent resolved 14% ([R171](/evidence/ledger/#r171)).
- [Evidence] Appending a file tree and API specification taken from the reference solution raised three agents' resolved rates by 16 to 22 points ([R171a](/evidence/ledger/#r171a)). The tree came from the answer and was bundled with the specification, so this shows what knowing where to work is worth, not what a generated map is worth.
- [Evidence] On SWE-Explore (848 issues, 203 repositories, 10 languages), general-purpose coding agents' line-level recall of the relevant code was only about 0.14 to 0.19 ([R177](/evidence/ledger/#r177)).
- [Evidence] In one study of AGENTS.md-style context files, repository overviews did not get agents to the files they needed to change any sooner ([R1b](/evidence/ledger/#r1b)).

### Maps of the repository

- [Evidence] In Agentless with GPT-4o on SWE-bench Lite, showing the model the repository's file tree located the file to edit in 78.67% of issues for $0.02, embedding retrieval located it in 70.33% for $0.04, and combining both reached 81.67% ([R172](/evidence/ledger/#r172)).
- [Evidence] Narrowing from files to classes and functions before lines located more and cost less than going from files straight to lines (50.67% at $0.06 against 47.00% at $0.18), and a skeleton of each file beat whole files (58.33% at $0.02 against 53.67% at $0.15) ([R172a](/evidence/ledger/#r172a)). The full pipeline resolved 32.00% of SWE-bench Lite at $0.70 per issue, with localisation bundled with patch sampling and test-based selection ([R172b](/evidence/ledger/#r172b)).
- [Evidence] Aider's documentation describes a map of files and key symbols, ranked by a graph of file dependencies and cut to a token budget (1,000 tokens by default); it publishes no measurement of the map's effect ([R164](/evidence/ledger/#r164)).
- [Evidence] OpenAI's Codex team keeps an AGENTS.md of about 100 lines that points into a structured docs/ directory ([R56](/evidence/ledger/#r56)), and Vercel cut a docs index from 40KB to 8KB, pointing to files read on demand, with no loss in pass rate ([R20b](/evidence/ledger/#r20b)). Both index documentation, not code.

### Code graphs and structure-aware tools

- [Evidence] Adding RepoGraph raised SWE-bench Lite resolve rates by 2.0 to 2.7 points on four frameworks with GPT-4 and GPT-4o, where each point is 3 of 300 issues ([R160](/evidence/ledger/#r160)), and raised cost per issue on agent frameworks, for example from $2.53 to $2.69 for SWE-agent ([R160a](/evidence/ledger/#r160a)).
- [Evidence] With Claude 3.5, LocAgent's graph tools put the right file in the top five for 94.16% of issues against 90.15% for SWE-agent and OpenHands ([R161](/evidence/ledger/#r161)), and feeding its localisation into Agentless raised Pass@1 by 1.6 points ([R161c](/evidence/ledger/#r161c)). The graph's own effect was isolated only inside a fine-tuned 7B model ([R161a](/evidence/ledger/#r161a)).
- [Evidence] CodexGraph's graph-database queries matched but did not beat AutoCodeRover's AST search with GPT-4o (22.96% each) and used more tokens ([R162](/evidence/ledger/#r162)); with less capable models it fell well behind, for example 1.95% against 9.34% with Qwen2-72B ([R162a](/evidence/ledger/#r162a)).
- [Evidence] ARISE's graph and data-flow tools raised a 32B open model's Pass@1 from 17.3% to 22.0% ([R163](/evidence/ledger/#r163)), but with a more capable model gave almost nothing (33.3% to 34.0%) and lowered AutoCodeRover's rate from 36.3% to 32.0% ([R163a](/evidence/ledger/#r163a)). See conflict [CN4](/evidence/ledger/#cn4-do-code-graphs-and-structure-aware-tools-raise-agent-success).
- [Evidence] A graph-derived map of the tests each change affects cut regressions from 6.08% to 1.82% for one open model on 100 instances, while a TDD prompt without the map raised them to 9.94% ([R17](/evidence/ledger/#r17)); packaged as a skill with another model, it resolved 2 more of 25 instances ([R17a](/evidence/ledger/#r17a)).

### Search tool design

- [Evidence] In SWE-agent ablations with GPT-4 Turbo on SWE-bench Lite, a search tool that summarised its results resolved 18.0%, no search tool 15.7%, and a tool that showed one result at a time 12.0% ([R173](/evidence/ledger/#r173)). A 100-line file viewer resolved 18.0%, a 30-line one 14.3% and a whole-file one 12.7% ([R173a](/evidence/ledger/#r173a)). The gaps are 7 to 18 of 300 issues.
- [Evidence] AutoCodeRover, which searches through class and method lookups, resolved 19.00% of SWE-bench Lite at about $0.43 per issue against SWE-agent's reported 18.00% at $2.51; no ablation isolates the search design ([R174](/evidence/ledger/#r174)).

### An embedding index or agentic search?

- [Evidence] In a question-answering study over 15 Python repositories and four models, an agent with a vector index answered 65.2% of questions correctly against 46.2% for a planner that delegated exploration to a subagent, and cost less for every model ([R165](/evidence/ledger/#r165), [R165a](/evidence/ledger/#r165a)). Coordination breakdowns between planner and subagent accounted for 41.8% of the explorer's failures ([R165b](/evidence/ledger/#r165b)). The study answered questions rather than patching code, and its explorer was not plain grep.
- [Evidence] Cursor reported that adding semantic search raised accuracy on its unreleased internal benchmark by 12.5% on average, with grep plus semantic search doing best ([R175](/evidence/ledger/#r175)). Its current documentation describes a grep engine indexed on the user's machine and no stored embeddings, without measurements ([R176a](/evidence/ledger/#r176a)); see conflict [CN2](/evidence/ledger/#cn2-did-the-vendors-own-evidence-for-semantic-search-hold-up).
- [Evidence] On SWE-Explore, every agentic explorer scored well above BM25, TF-IDF and a lightweight static word-embedding retriever, so it says little about better embedding models ([R177](/evidence/ledger/#r177)).
- [Evidence] On chat history rather than code, grep beat vector retrieval in all ten harness and model pairs when results were shown inline, vector won half the pairs when results came as files, and the same model scored 93.1% in one harness against 76.7% in Claude Code ([R166](/evidence/ledger/#r166)). See conflict [CN1](/evidence/ledger/#cn1-does-an-embedding-index-beat-agentic-grep-style-search-for-finding-code).

### Million-line codebases

- [Evidence] LoLBench, with systems averaging 2.4 million lines, is the only benchmark in these rows at that scale, and it tested no map, taxonomy or code graph an agent could build without the answer ([R171](/evidence/ledger/#r171), [R171a](/evidence/ledger/#r171a)). The code-graph studies used SWE-bench Lite's 300 Python issues ([R160](/evidence/ledger/#r160), [R161](/evidence/ledger/#r161), [R163](/evidence/ledger/#r163)), and Aider's map has no published measurement ([R164](/evidence/ledger/#r164)). The rows support cheap structure for localisation; they do not show that a taxonomy or graph helps at the scale of millions of lines.

## What to do

- Consider showing the agent a compact view of the repository's structure, such as a file tree or a symbol map, to choose files from before it reads them; in Agentless this located the right file in most issues at low cost ([R172](/evidence/ledger/#r172), [R164](/evidence/ledger/#r164)).
- When the agent reads code, consider skeletons or windows of about 100 lines over whole files; whole-file views cost more and located or resolved less in the setups tested ([R172a](/evidence/ledger/#r172a), [R173a](/evidence/ledger/#r173a)).
- If you build a search tool for an agent, consider returning a summary of matches rather than one result at a time ([R173](/evidence/ledger/#r173)).
- Consider combining search methods: a file tree with embeddings, and grep with semantic search, did best in two studies that tried them together ([R172](/evidence/ledger/#r172), [R175](/evidence/ledger/#r175)).
- Treat a code-graph tool as an experiment to measure on your own tasks and model: published gains are a few points on one benchmark, vanished or reversed in some settings, and came with added cost ([R160](/evidence/ledger/#r160), [R160a](/evidence/ledger/#r160a), [R162a](/evidence/ledger/#r162a), [R163a](/evidence/ledger/#r163a)).
- If changes risk breaking other code, consider giving the agent a map of the tests each change affects rather than a bare instruction to follow TDD ([R17](/evidence/ledger/#r17), [R17a](/evidence/ledger/#r17a)).
- Consider keeping an instruction file's description of the repository to short pointers: overviews did not speed file discovery in one study ([R1b](/evidence/ledger/#r1b)), and OpenAI's Codex team keeps its file to a short map ([R56](/evidence/ledger/#r56)).

## Not yet known

- Whether repository size itself lowers success once the project and task are held fixed ([CN3](/evidence/ledger/#cn3-does-repository-size-lower-agent-success)).
- Whether code graphs or module taxonomies help on codebases of millions of lines; the graph studies used SWE-bench Lite's Python issues ([R160](/evidence/ledger/#r160), [R163a](/evidence/ledger/#r163a)).
- Whether a map an agent builds without the answer recovers the gain seen with a file tree taken from the reference solution ([R171a](/evidence/ledger/#r171a)).
- Whether an embedding index or agentic search locates code better when patching real repositories; no head-to-head exists ([CN1](/evidence/ledger/#cn1-does-an-embedding-index-beat-agentic-grep-style-search-for-finding-code)).
- How large the reported gains are against run-to-run variance, since most of these results report no run-to-run variance ([R160](/evidence/ledger/#r160), [R173](/evidence/ledger/#r173)).
- More gaps are listed on [Open questions](/evidence/open-questions/).
