---
name: backbrain-memory
description: >
  Use this skill when the user asks about past work, previous debugging attempts,
  decisions, or “what was I doing?” on a codebase, or when they ask you to remember
  or log what you just did. It teaches you how to use the Backbrain MCP tools as a
  persistent, git-aware memory layer for development sessions.
---

# Backbrain Memory

Backbrain is a git-aware developer journal and memory layer.
It keeps short notes about what the user was doing in each repo, branch, and directory.
You access it through an MCP server with tools like:

- `search_notes(query, scope?)` — search notes, usually scoped to the current repo/branch.
- `list_recent(limit?, scope?)` — list the most recent notes, usually for the current repo.
- `add_note(content, tags?)` — add a new note; git context is captured automatically.
- `get_status()` — get current repo, branch, and quick stats.

The exact tool names may differ slightly by implementation; rely on the MCP schema
you see at runtime, but use the patterns below.

## When to use Backbrain

Use this skill in these situations:

1. **User asks about past work or “what did we try last time?”**

   Examples:
   - “What did I try last time on this auth timeout bug?”
   - “What was I doing on this payments branch?”
   - “Remind me what we did with JWT refresh yesterday.”

   In these cases:
   1. Call `get_status()` to learn the current repo/branch if available.
   2. Call `search_notes()` with a short query like `"auth timeout"` or `"payments"`,
      ideally scoped to the current repo/branch.
   3. If notes exist, summarise what was tried, what worked, and what’s pending,
      and base your answer on those notes.

2. **User wants you to remember what you just did**

   Examples:
   - “Log what we just did to Backbrain.”
   - “Save a note about this debugging session.”
   - “Make sure we don’t forget what fixed this.”

   In these cases:
   1. Briefly recap the important points.
   2. Call `add_note()` with:
      - a one- or two-sentence summary of the work/decision,
      - any key details (endpoints, errors, root cause),
      - optional tags like `["bug", "decision", "auth"]`.
   3. Confirm to the user that you’ve saved it.

3. **User is returning to a repo/branch and wants context**

   Examples:
   - “Catch me up on this repo.”
   - “What was I doing on this branch last time?”
   - “I’ve been away from this project; remind me where we left off.”

   In these cases:
   1. Call `get_status()` to identify the repo/branch.
   2. Call `list_recent()` (or `search_notes()` with a broad query) scoped to that repo.
   3. Give a short recap using the most recent notes.

## Usage patterns

- **Search before guessing**

  Before you speculate about the history of a bug or feature, check Backbrain.
  If Backbrain has relevant notes, prioritise them as context.

- **Summarise, don’t dump**

  When adding notes via `add_note`, do not paste large logs or full stack traces.
  Summarise what matters so future searches stay readable.

- **Stay scoped**

  Prefer repo- and branch-scoped queries so you don’t mix unrelated projects.
  Use `get_status()` first to understand the current scope.

## Example flows

**User:** “I’m back on this auth timeout bug. What did we try last time?”

1. Call `get_status()` to get the current repo/branch.
2. Call `search_notes("auth timeout")` scoped to that repo/branch.
3. If results exist, summarise:
   - what was tried,
   - what helped or didn’t,
   - what’s still open.
4. Then propose next steps.

**User:** “Log what we just did so we don’t forget next week.”

1. Recap the key outcome in one or two sentences.
2. Call `add_note()` with that recap and any relevant tags.
3. Confirm: “Saved this session to Backbrain for this repo/branch.”
