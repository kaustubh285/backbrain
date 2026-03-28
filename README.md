
# Backbrain (formerly flux-cap)

[![npm version](https://img.shields.io/npm/v/backbrain)](https://www.npmjs.com/package/backbrain) [![npm downloads](https://img.shields.io/npm/dm/backbrain)](https://www.npmjs.com/package/backbrain) [![license](https://img.shields.io/npm/l/backbrain)](LICENSE)

> A git‑aware developer journal that keeps a running memory of your work that's __searchable from the CLI__ and __readable by your AI__.

```bash
bun add -g backbrain
```
*Backbrain is a personal project built incrementally over time,  not generated in one shot.*

## Backbrain in one minute

Backbrain gives you a **local, git‑aware log of your work**:
- Capture short notes as you work from the CLI (`bb note ...`).
- Search them later with **smart, git‑aware ranking** (recency, branch, directory, tags).
- Let your **AI assistants read that history** via MCP so they know what you were doing last time or make them for you!

It’s like commit messages + scratchpad + “what was I doing?” memory, all in one place.

---

## Installation

Install Backbrain globally with your preferred package manager:

```bash
# Bun (recommended)
bun add -g backbrain

# npm
npm install -g backbrain

# pnpm
pnpm add -g backbrain
```

---

## Quick start

### 1. Initialize in a project

From your project root:

```bash
bb init
```

You’ll get an interactive setup, including privacy options (what git context you’re okay tracking).

### 2. Capture notes as you work

```bash
# Simple notes
bb note "remember to add error handling to auth module"
bb note "bug in user validation - check line 42"

# Quick tagged notes
bb note -i "add dark mode toggle"              # Idea
bb note -t "refactor payment processing logic" # TODO
bb note -b "payment flow fails on Safari"      # Bug
bb note -l "https://docs.example.com/api"      # Link
```

### 3. Find things with context‑aware search

```bash
# Smart search (recency + git context)
bb search auth
bb s authentication bug    # Alias: bb s

# Examples
bb search payment bug
bb search ideas
```

Search 2.0 ranks results using:
- **Recency** (exponential decay).
- **Same git branch** as your current work.
- **Same working directory**.
- **Tag matches** when you filter by tag.

---

## Core features

### Git‑aware developer journal

- Terminal first CLI tool, i.e IDE agnostic.
- Automatically tracks branch, working directory, and whether you have uncommitted changes.
- Stores everything locally in `.bb/` as human‑readable JSON (no servers, no external APIs).
- MCP server to link your AI tools for regular entries & context sharing

### Intelligent Search 2.0

- **Multi‑signal ranking**: fuzzy match (Fuse.js) + recency + git context.
- **Smart defaults**: recent notes on your current branch and directory float to the top.

### Interactive TUI

Backbrain ships with a terminal UI for fast, interactive search:

![TUI Interface](https://github.com/kaustubh285/backbrain/blob/main/images/v0.10-rezi-interactive.png)

- Real time search as you type.
- Same Search 2.0 scoring as the CLI.
- Stable, table‑based layout (no jumping as results change).
- Visual context tags for **recent**, **same branch**, **same directory**.
- Slash commands like `/exit` for quick quitting.

```bash
# Open interactive search
bb u
```

### AI assistant integration (MCP)

Backbrain exposes an MCP server so tools like Cursor, Claude, and Zed can treat it as your long‑term memory:

![MCP Integration](https://github.com/kaustubh285/backbrain/blob/main/images/mcp-integration.png)

What this gives you:
- **Shared memory**: AI can read your Backbrain notes for context.
- **Smart captures**: AI can suggest / create notes for important insights.
- **Context‑aware help**: “What was I doing with auth last week?” actually has an answer.

Minimal MCP config:

```json
{
  "mcpServers": {
    "backbrain": {
      "command": "bb",
      "args": ["mcp-server"],
      "env": {}
    }
  }
}
```

Add it to:
- **Cursor**: `~/.cursor/mcp.json`
- **Zed**: `~/.config/zed/settings.json` (in `language_models`)
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`

---

## Commands

| Command | Description | Example |
|--------|-------------|---------|
| `bb init` | Initialize Backbrain with privacy setup | `bb init` |
| `bb note <message...>` | Capture a note | `bb note "fix the bug in auth.ts"` |
| `bb note -i <message...>` | Capture an idea | `bb note -i "add keyboard shortcuts"` |
| `bb note -n <message...>` | Capture a note | `bb note -n "meeting notes from standup"` |
| `bb note -t <message...>` | Capture a task | `bb note -t "refactor user authentication"` |
| `bb note -b <message...>` | Capture a bug | `bb note -b "tsconfig mismatch"` |
| `bb note -l <message...>` | Capture a link | `bb note -l "https://github.com/user/repo"` |
| `bb note -m` | Multiline input mode | `bb note -m` |
| `bb search [query...]` | Search notes with smart ranking | `bb search "authentication"` |
| `bb s [query...]` | Search alias | `bb s "auth"` |
| `bb u` | Open interactive TUI | `bb u` |
| `bb config [field] [value]` | View or update configuration | `bb config search.resultLimit 20` |
| `bb reset` | Complete reset (deletes all data) | `bb reset` |

### Legacy flux-cap commands

`flux` still works as an alias, but is deprecated:

| Command | Status | Replacement |
|---------|--------|-------------|
| `flux dump` | Deprecated | Use `bb note` |
| `flux d` | Deprecated | Use `bb note` |
| `flux search` | Works | Use `bb search` |
| `flux u` | Works | Use `bb u` |
| `flux` | Works as alias | Use `bb` |

---

## Tags and workflows

Backbrain ships with shortcuts for common note types:

- `-i, --ideas` – ideas and inspiration.
- `-n, --notes` – general notes and reminders.
- `-t, --tasks` – tasks and todos.
- `-b, --bugs` – bugs and investigations.
- `-l, --links` – URLs and references.

Example flows:

```bash
# Before switching tasks
bb note -t "was working on user auth, next: add validation to login form"

# After interruption
bb search "auth"
bb search "tasks"

# Bug tracking
bb note -b "payment flow fails on mobile Safari"
bb note -n "seems related to session timeout, need to  check Redis config"
bb search "payment bug"
```

---

## Configuration & data (advanced)

Backbrain stores its data in a `.bb/` directory at your project root:

```text
.bb/
├── config.json          # Your configuration
├── dumps/               # Notes organized by month
│   ├── 2026-02.json
│   └── 2026-03.json
└── sessions/            # (Future) focus session tracking
```

### Privacy

```json
{
  "privacy": {
    "hideWorkingDir": false,
    "hideBranchName": false,
    "hideUncommittedChanges": false
  }
}
```

### Search

```json
{
  "search": {
    "searchFields": ["message", "branch", "workingDir", "tags"],
    "resultLimit": 10,
    "fuseOptions": {
      "threshold": 0.3,
      "includeScore": true
    }
  }
}
```

### Example note entry

```json
{
  "id": "019c5419-671b-7000-9600-5d9b4c563579",
  "timestamp": "2026-02-12T23:04:36.891Z",
  "message": "fix auth validation bug",
  "tags": ["tasks"],
  "workingDir": "/Users/you/project",
  "branch": "feature/auth-fix",
  "hasUncommittedChanges": true
}
```

---

## Screenshots

### CLI search

![CLI Search](https://github.com/kaustubh285/backbrain/blob/main/images/v0.8-search-v2-demo.png)

### Interactive TUI

![TUI Interface](https://github.com/kaustubh285/backbrain/blob/main/images/v0.10-rezi-interactive.png)

### TUI demo

![TUI Demo](https://github.com/kaustubh285/backbrain/blob/main/images/v0.10-rezi-interactive.gif)

---

## Under the hood

Backbrain is a personal project built incrementally over time – not generated in one shot.

- Search 2.0 is implemented with a `searchV2Helper` that:
  - Inverts and weights Fuse.js scores.
  - Uses exponential decay for recency (`e^(-days/7)`).
  - Boosts matches on your current branch / working directory and when you have uncommitted changes.
- The TUI has been built twice (Ink and then Rezi) to compare performance and ergonomics.

If you care about the implementation details, the commit history tells the story best.

---

## Development

Run Backbrain locally:

```bash
git clone https://github.com/kaustubh285/backbrain
cd backbrain
bun install

# Dev
bun run dev <command>

# Build & test locally
bun run build
npm link
```

Built with:

- **Bun** – fast JS runtime
- **TypeScript**
- **Commander.js** – CLI parsing
- **Fuse.js** – fuzzy search
- **Rezi** – terminal UI
- **MCP SDK** – AI assistant integration

Project structure (simplified):

```text
src/
├── commands/            # CLI commands
│   ├── dump.command.ts
│   ├── search.command.ts
│   ├── ui.command.ts
│   └── init.command.ts
├── utils/
│   ├── privacy.ts        # Git integration
│   ├── fuse.instance.ts  # Search config
│   └── lib.ts            # File ops
├── mcp-server.ts         # MCP integration
└── types/                # TypeScript definitions
```

---

## Roadmap

### ✅ Shipped

- Search 2.0 (fuzzy + recency + git context)
- Interactive TUI with real‑time search
- MCP integration for AI assistants
- Custom tag support (`--tag`)
- Parent directory `.flux` discovery
- Backwards compatibility with `flux` command

### Next (v1.2)

- Convenience commands (`bb recent`, `bb here`, `bb notes`)
- Enhanced MCP tools for richer AI context
- Search pagination and additional filters
- Export formats tuned for AI tools

### Future ideas

- Advanced git context switching
- Session restoration and time tracking
- Cross‑IDE AI integration improvements
- Tag analytics and insights
- AI‑powered note analysis and suggestions
- Optional cross‑machine sync
- Smart tag suggestions

---

## Migration from flux-cap

If you were using the old `flux-cap` CLI:

- `flux dump` / `flux d` → `bb note`
- `flux search` → `bb search`
- `flux u` → `bb u`
- `flux` → `bb` (alias still works, but is deprecated)

The old commands still work, but **`bb` is the recommended path going forward**.

---

## Contributing

Backbrain is currently a personal learning project, but feedback, issues, and suggestions are welcome.

## License

MIT
