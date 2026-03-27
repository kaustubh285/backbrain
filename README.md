# Backbrain

> Backbrain: keep a running memory of your work, searchable from the CLI and readable by your AI.

*Backbrain was previously called flux-cap. The CLI `flux` still works as an alias, but `bb` is now the primary command.*

---

### How this was built

Backbrain is a personal project built incrementally over several weeks — not generated in one shot. The search algorithm (`searchV2Helper`) was designed from first principles: Fuse.js scores are inverted and weighted, recency uses exponential decay (`e^(-days/7)`), and git context gets a dynamic boost multiplier when you have uncommitted changes. The TUI was built twice — once in Ink, once in Rezi — to compare performance and ergonomics firsthand.

The commit history tells the story better than this paragraph.

---

[![npm version](https://img.shields.io/npm/v/@dev_desh/flux-cap)](https://www.npmjs.com/package/@dev_desh/flux-cap)
[![npm downloads](https://img.shields.io/npm/dm/@dev_desh/flux-cap)](https://www.npmjs.com/package/@dev_desh/flux-cap)
[![license](https://img.shields.io/npm/l/@dev_desh/flux-cap)](LICENSE)

**Now at v1.1.0** — with Search 2.0 multi-signal ranking, interactive TUI, and MCP integration for AI assistants.

### What's new:
- **v1.1.0:** Backbrain MCP support for AI integration!
- **v1.0.0:** First stable release with Rezi TUI
- **v0.10.0:** Rezi-based lazygit-style TUI (`bb u`)
- **v0.9.0:** Ink-powered interactive search TUI
- **v0.8.0:** Search 2.0 — multi-signal ranking with git context awareness

## What is Backbrain?

Backbrain is a git-aware developer journal that keeps a running memory of your work. It's designed for developers who context-switch frequently and need to maintain mental state across interruptions.

### Key Features:
- **Terminal-first CLI** - Capture thoughts without leaving your terminal
- **Smart Search** - Multi-signal ranking with git context awareness
- **Interactive TUI** - Real-time search with professional interface
- **AI Integration** - MCP server for seamless AI assistant access (Cursor, Claude, Zed)
- **Git-aware** - Automatically tracks branch context and uncommitted changes
- **Local & Private** - All data stored locally in human-readable JSON

## Installation

Install Backbrain globally using your preferred package manager:

```bash
# Using npm
npm install -g @dev_desh/flux-cap

# Using pnpm  
pnpm install -g @dev_desh/flux-cap

# Using bun
bun install -g @dev_desh/flux-cap
```

## Quick Start

### 1. Initialize Backbrain in your project root folder
```bash
bb init
```
*Interactive setup will ask about your privacy preferences*

### 2. Start capturing notes with tags
```bash
# Basic notes
bb note "remember to add error handling to auth module"
bb note "bug in user validation - check line 42" 

# Tagged notes for better organization
bb note -i "add dark mode toggle"              # Ideas
bb note -n "team meeting at 3pm tomorrow"      # Notes  
bb note -t "refactor payment processing logic" # Tasks
bb note -b "payment flow fails on Safari"      # Bugs
bb note -l "https://docs.example.com/api"      # Links
```

### 3. Search your notes with intelligent ranking

Backbrain features **Search 2.0** - intelligent, context-aware search that prioritizes:
- **Recent notes** (exponential decay scoring)
- **Same git branch** as your current work
- **Same working directory** context
- **Exact tag matches** for specific searches

```bash
# Smart context-aware search
bb search auth                    # Prioritizes recent + current branch matches
bb s payment                      # Quick alias
bb search "authentication bug"    # Multi-word search

# Coming soon: Convenience commands
bb recent                         # Last 10 notes
bb here                          # Current branch + directory
bb notes                         # All note-tagged entries
```

## Interactive TUI

Backbrain includes a terminal user interface for interactive searching:

![TUI Interface](https://github.com/kaustubh285/flux-cap/blob/main/images/v0.10-rezi-interactive.png)

### Features
- **Real-time Search**: Results update as you type
- **Search 2.0 Integration**: Same scoring system as CLI search
- **Professional Layout**: Fixed table format matching CLI output
- **Context Tags**: Visual indicators for recent, same-branch, same-dir
- **Stable Interface**: Fixed height prevents layout jumps
- **Slash Commands**: Type `/exit` to quit cleanly

### Usage
```bash
# Start interactive search
bb u

# Search and navigate
# Type query -> See results instantly
# /exit -> Quit cleanly
```

## AI Integration

Backbrain now integrates with AI assistants via MCP (Model Context Protocol):

![MCP Integration](https://github.com/kaustubh285/flux-cap/blob/main/images/mcp-integration.png)

### What This Gives You:
- **Shared Memory**: AI agents can access your notes as context
- **Smart Captures**: AI suggests capturing important conversation insights
- **Context Awareness**: AI knows your past work when helping with current tasks
- **Seamless Workflow**: No context switching between CLI and AI chat

### Setup:
Add Backbrain MCP integration to your AI assistant config:

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
- **Zed**: `~/.config/zed/settings.json` (add to 'language_models' section)
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`

## Screenshots

### CLI Search
![CLI Search](https://github.com/kaustubh285/flux-cap/blob/main/images/v0.8-search-v2-demo.png)

### Interactive TUI  
![TUI Interface](https://github.com/kaustubh285/flux-cap/blob/main/images/v0.10-rezi-interactive.png)

### TUI Demo
![TUI Demo](https://github.com/kaustubh285/flux-cap/blob/main/images/v0.10-rezi-interactive.gif)

## Commands

| Command | Description | Example |
|---------|-------------|---------|
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

### Legacy Commands (Deprecated)
| Command | Status | Replacement |
|---------|--------|-------------|
| `flux dump` | Deprecated | Use `bb note` |
| `flux d` | Deprecated | Use `bb note` |
| `flux search` | Works | Use `bb search` |
| `flux` | Works as alias | Use `bb` |

## Tag System

### Built-in Tags
Backbrain comes with built-in tag shortcuts:
- **`-i, --ideas`** - For capturing ideas and inspiration
- **`-n, --notes`** - For general notes and reminders  
- **`-t, --tasks`** - For tasks and todos
- **`-b, --bugs`** - For bugs and issues
- **`-l, --links`** - For URLs and references

### Custom Tags
Extend your tagging system by adding custom tags:
```bash
# Built-in shortcuts
bb note -i "idea message"
bb note -n "note message" 
bb note -t "task message"

# Custom tags
bb note --tag meeting "standup notes"
bb note --tag bug "found an issue"
bb note --tag research "performance analysis"
```

### Tag Examples
```bash
# Ideas for future features
bb note -i "add real-time collaboration to the editor"
bb note -i "implement auto-save every 30 seconds"

# Meeting notes and reminders
bb note -n "team decided to use TypeScript for new components"
bb note -n "remember to update documentation before release"

# Task tracking
bb note -t "fix memory leak in image processor"
bb note -t "write unit tests for authentication module"

# Bug reports
bb note -b "payment flow fails on mobile Safari"
bb note -b "memory leak in file upload component"

# Combine with multiline for detailed entries
bb note -t -m  # Opens editor for detailed task description
```

## Use Cases

### Context Switching
```bash
# Before switching tasks
bb note -t "was working on user auth, next: add validation to login form"

# After interruption  
bb search "auth"     # Quickly find where you left off
bb search "tasks"    # Find your pending tasks
```

### Bug Tracking & Ideas
```bash
# Track bugs and investigations
bb note -b "weird bug in payment flow - users can't checkout"
bb note -n "bug seems related to session timeout - check Redis config"

# Capture ideas as they come
bb note -i "add keyboard shortcuts to dashboard"
bb note -i "maybe use React.memo for performance optimization"

# Later...
bb search "payment bug"
bb search "ideas"
```

### Meeting Notes & Task Management  
```bash
# Capture meeting outcomes
bb note -n "team standup: focus on performance this sprint"
bb note -t "implement caching layer for API responses"

# Track follow-up tasks
bb note -t "review Sarah's PR for authentication changes"
bb note -t "update deployment documentation"
```

### AI-Enhanced Workflow
```bash
# While working with AI assistant
# AI can automatically capture insights:
# - Important code snippets discussed
# - Solutions to complex problems
# - Follow-up tasks identified
# - Links to documentation referenced

# AI can also search your notes for context:
# "What was I working on with authentication?"
# AI searches your notes and provides relevant context
```

## Configuration

Backbrain stores configuration in `.flux/config.json`. You can customize:

### Privacy Settings
```json
{
  "privacy": {
    "hideWorkingDir": false,       // Hide file paths
    "hideBranchName": false,       // Hide git branch names  
    "hideUncommittedChanges": false // Hide git status
  }
}
```

### Search Configuration  
```json
{
  "search": {
    "searchFields": ["message", "branch", "workingDir", "tags"],
    "resultLimit": 10,
    "fuseOptions": {
      "threshold": 0.3,            // 0.0 = exact match, 1.0 = match anything
      "includeScore": true
    }
  }
}
```

### Tag Configuration
```json
{
  "tags": ["meeting", "review", "research", "urgent"]  // Your custom tags
}
```

### Other Options
```json
{
  "defaultFocusDuration": 1500,    // 25 minutes in seconds
  "todoKeywords": ["TODO", "FIXME", "BUG", "OPTIMIZE", "HACK"],
  "sorted": true,                  // Sort entries chronologically
  "theme": "minimal"
}
```

## Data Structure

```
.flux/
├── config.json          # Your configuration
├── dumps/               # Notes organized by month
│   ├── 2026-02.json     
│   └── 2026-03.json     
└── sessions/            # Future: Focus session tracking
```

### Note Entry Format
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

## Features

### Note System with Smart Tags
- Instantly capture thoughts without breaking flow: `bb note "fix auth validation bug"`
- **Tag system** for better organization: `-i` for ideas, `-n` for notes, `-t` for tasks
- Git-aware context tracking (branch, working directory, uncommitted changes)
- Monthly file organization for easy browsing
- Privacy-first design - you control what gets tracked

### Intelligent Search 2.0 🚀
- **Multi-signal ranking**: Combines fuzzy matching, recency, and git context
- **Smart defaults**: Recent notes + current branch automatically ranked higher  
- **Context-aware**: Prioritizes notes from your current branch and directory
- **Debug mode**: `--debug` flag shows detailed scoring breakdown
- **Flexible filtering**: `--all`, `--since`, `--branch` flags override smart defaults
- **Fast & local**: No external APIs, blazing fast search results

### Interactive Search
```bash
bb u          # Open interactive TUI search
```

### Privacy Controls
- Choose what information to track during setup
- Hide working directory paths, branch names, or git status
- All data stored locally in human-readable JSON
- Edit or delete your data anytime

### Git Integration
- Automatic branch context detection
- Uncommitted changes tracking
- .gitignore management
- Works in non-git directories too

### Parent Directory Support
- Initialize Backbrain once in your project root and use it from any subdirectory
- Automatically discovers `.flux` configuration by traversing up the directory tree
- No need to initialize in every subfolder - works project-wide
- Seamlessly handles monorepos and complex project structures

### AI Assistant Integration
- **MCP Server**: Direct integration with Cursor, Zed, Claude Desktop
- **Smart Captures**: AI can suggest and create notes from conversations
- **Context Sharing**: AI has access to your note history for better assistance
- **Seamless Workflow**: No manual copy-paste between tools

## Development

Want to contribute or run locally?

```bash
# Clone and setup
git clone https://github.com/kaustubh285/flux-cap
cd flux-cap
bun install

# Run in development mode
bun run dev <command>

# Build and test locally  
bun run build
npm link
```

Built with:
- **Bun** - Fast JavaScript runtime
- **TypeScript** - Type safety
- **Commander.js** - CLI parsing
- **Fuse.js** - Fuzzy search
- **Rezi** - Terminal UI components
- **MCP SDK** - AI assistant integration

### Project Structure
```
src/
├── commands/           # Command implementations
│   ├── dump.command.ts # Note capture (legacy naming)
│   ├── search.command.ts
│   ├── ui.command.ts
│   └── init.command.ts
├── utils/             # Shared utilities
│   ├── privacy.ts     # Git integration
│   ├── fuse.instance.ts # Search configuration
│   └── lib.ts         # File operations
├── mcp-server.ts      # MCP integration
└── types/             # TypeScript definitions
```

## Roadmap

### ✅ Shipped
- [x] Search 2.0 multi-signal ranking (fuzzy + recency + git context)
- [x] Interactive TUI with real-time search
- [x] MCP integration for AI assistants
- [x] Custom tag support (`--tag`)
- [x] Parent directory `.flux` discovery
- [x] Backwards compatibility with `flux` command

### Phase 2 (v1.2)
- [ ] Convenience commands (`bb recent`, `bb here`, `bb notes`)
- [ ] Enhanced MCP tools for AI context
- [ ] Search result pagination and filtering
- [ ] Export formats for AI tools

### Phase 3 (Future)
- [ ] Advanced git context switching
- [ ] Session restoration and time tracking
- [ ] Cross-IDE AI integration improvements
- [ ] Tag analytics and insights

### Phase 4 (Maybe)
- [ ] AI-powered note analysis and suggestions
- [ ] Team collaboration features
- [ ] Cross-machine sync (optional)
- [ ] Smart tag suggestions based on content

## Contributing

This is currently a personal learning project, but feedback and suggestions are welcome!

## Migration from flux-cap

If you were using the old `flux-cap` commands:

- **`flux dump`** → **`bb note`** (recommended)
- **`flux d`** → **`bb note`** (recommended)
- **`flux search`** → **`bb search`** (or keep using `flux search`)
- **`flux u`** → **`bb u`** (or keep using `flux u`)

The old `flux` commands still work but are deprecated. We recommend switching to `bb` for the best experience.

## License

MIT

---

*Keep a running memory of your work with Backbrain.*
