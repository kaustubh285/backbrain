# flux-cap

**A git-aware CLI context manager for ADHD developers**

> *Never lose track of what you were coding after interruptions again. Now with intelligent, context-aware search.*


flux-cap is a terminal-native tool that captures your thoughts, tracks your context, and integrates seamlessly with your git workflow. Built specifically for developers who context-switch frequently.

### Recent Releases:
- **v0.8.0:** Search 2.0 - Intelligent multi-signal ranking with context awareness
- **v0.7.0:** Batch searches with combinedQuery and result sorting


## Installation

Install flux-cap globally using your preferred package manager:

```bash
# Using npm
npm install -g @dev_desh/flux-cap

# Using pnpm  
pnpm install -g @dev_desh/flux-cap

# Using bun
bun install -g @dev_desh/flux-cap
```

## Quick Start

### 1. Initialize flux-cap in your project root folder
```bash
flux init
```
*Interactive setup will ask about your privacy preferences*

### 2. Start capturing thoughts with tags
```bash
# Basic brain dumps
flux dump "remember to add error handling to auth module"
flux dump "bug in user validation - check line 42" 

# Tagged brain dumps for better organization
flux dump -i "add dark mode toggle"              # Ideas
flux dump -n "team meeting at 3pm tomorrow"      # Notes  
flux dump -t "refactor payment processing logic" # Tasks
```
## 3. **New TUI Section** (add after Commands)

## Interactive TUI

Flux-Cap includes a terminal user interface for interactive searching:

![TUI Screenshot](images/tui-demo.png)

### Features
- **Real-time Search**: Results update as you type
- **SearchV2 Integration**: Same scoring system as CLI search
- **Professional Layout**: Fixed table format matching CLI output
- **Context Tags**: Visual indicators for recent, same-branch, same-dir
- **Stable Interface**: Fixed height prevents layout jumps
- **Slash Commands**: Type `/exit` to quit cleanly

### Usage
```bash
# Start interactive search
flux u

# Search and navigate
# Type query -> See results instantly
# /exit -> Quit cleanly
```

### 3. Search your brain dumps with intelligent ranking

flux-cap now features **Search 2.0** - intelligent, context-aware search that prioritizes:
- **Recent dumps** (exponential decay scoring)
- **Same git branch** as your current work
- **Same working directory** context
- **Exact tag matches** (coming in v0.8.0)
- **Quick Brain Dumps**: Capture thoughts instantly with git context
- **SearchV2**: Multi-signal ranking (fuzzy + recency + git context)
- **Interactive TUI**: Real-time search with professional interface
- **Smart Scoring**: See relevance scores and context indicators


## 📸 Screenshots

### CLI Search
![CLI Search](https://github.com/kaustubh285/flux-cap/blob/main/images/v0.8-search-v2-demo.png)


### Interactive TUI  
![TUI Interface]([images/tui-interface.png](https://github.com/kaustubh285/flux-cap/blob/main/images/v0.6-search-output.png))


### Search Comparison
![Search Demo]([images/search-comparison.gif](https://github.com/kaustubh285/flux-cap/blob/main/images/v0.9-interactive.mov)


```bash
# Smart context-aware search (NEW in v0.8.0!)
flux search auth                    # Prioritizes recent + current branch matches

# Coming in v0.8.2: Convenience commands
flux recent                         # Last 10 dumps
flux here                          # Current branch + directory
flux notes                         # All note-tagged dumps

```

## Features

### Brain Dump System with Smart Tags
- Instantly capture thoughts without breaking flow: `flux dump "fix auth validation bug"`
- **Tag system** for better organization: `-i` for ideas, `-n` for notes, `-t` for tasks
- Git-aware context tracking (branch, working directory, uncommitted changes)
- Monthly file organization for easy browsing
- Privacy-first design - you control what gets tracked

### Intelligent Search 2.0 🚀
- **Multi-signal ranking**: Combines fuzzy matching, recency, and git context
- **Smart defaults**: Recent dumps + current branch automatically ranked higher  
- **Context-aware**: Prioritizes dumps from your current branch and directory
- **Debug mode**: `--debug` flag shows detailed scoring breakdown
- **Flexible filtering**: `--all`, `--since`, `--branch` flags override smart defaults
- **Fast & local**: No external APIs, blazing fast search results

### Interactive Search
```bash
flux u          # Open interactive TUI search
flux ui         # Same as above (alias)
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
- Initialize flux-cap once in your project root and use it from any subdirectory
- Automatically discovers `.flux` configuration by traversing up the directory tree
- No need to initialize in every subfolder - works project-wide
- Seamlessly handles monorepos and complex project structures

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `flux init` | Initialize flux-cap with privacy setup | `flux init` |
| `flux dump <message...>` | Capture a brain dump | `flux dump "fix the bug in auth.ts"` |
| `flux dump -i <message...>` | Capture important | `flux dump -i "add keyboard shortcuts"` |
| `flux dump -d <message...>` | Capture an idea | `flux dump -d "a new cli tool project"` |
| `flux dump -l <message...>` | Capture a link | `flux dump -l "https://github.com/kaustubh285/flux-cap"` |
| `flux dump -b <message...>` | Capture a bug | `flux dump -b "tsconfig mismatch"` |
| `flux dump -n <message...>` | Capture a note | `flux dump -n "meeting notes from standup"` |
| `flux dump -t <message...>` | Capture a task | `flux dump -t "refactor user authentication"` |
| `flux dump -m` | Multiline input mode | `flux dump -m` |
| `flux search [query...]` | Search brain dumps or list recent ones | `flux search "authentication"` |
| `flux config [field] [value]` | View or update configuration | `flux config search.resultLimit 20` |
| `flux config --add-tag <tag>` | Add custom tags to configuration | `flux config --add-tag "bug"` |
| `flux config --remove-tag <tag>` | Remove tags from configuration | `flux config --remove-tag "old-tag"` |
| `flux reset` | Complete reset (deletes all data) | `flux reset` |

## Tag System

### Built-in Tags
flux-cap comes with three built-in tag shortcuts:
- **`-i, --ideas`** - For capturing ideas and inspiration
- **`-n, --notes`** - For general notes and reminders  
- **`-t, --tasks`** - For tasks and todos

### Custom Tags (via config)
Extend your tagging system by adding custom tags for brain dumps:
```bash
# Built-in shortcuts (current)
flux dump -i "idea message"
flux dump -n "note message" 
flux dump -t "task message"

# Generic tag option (new)
flux dump --tag thought "my message"
flux dump --tag bug "found an issue"
flux dump --tag meeting "standup notes"
```


### Tag Examples
```bash
# Ideas for future features
flux dump -i "add real-time collaboration to the editor"
flux dump -i "implement auto-save every 30 seconds"

# Meeting notes and reminders
flux dump -n "team decided to use TypeScript for new components"
flux dump -n "remember to update documentation before release"

# Task tracking
flux dump -t "fix memory leak in image processor"
flux dump -t "write unit tests for authentication module"

# Combine with multiline for detailed entries
flux dump -t -m  # Opens editor for detailed task description
```

## Use Cases

### Context Switching
```bash
# Before switching tasks
flux dump -t "was working on user auth, next: add validation to login form"

# After interruption  
flux search "auth"  # Quickly find where you left off
flux search "tasks" # Find your pending tasks
```

### Bug Tracking & Ideas
```bash
# Track bugs and investigations
flux dump -n "weird bug in payment flow - users can't checkout"
flux dump -n "bug seems related to session timeout - check Redis config"

# Capture ideas as they come
flux dump -i "add keyboard shortcuts to dashboard"
flux dump -i "maybe use React.memo for performance optimization"

# Later...
flux search "payment bug"
flux search "ideas"
```

### Meeting Notes & Task Management  
```bash
# Capture meeting outcomes
flux dump -n "team standup: focus on performance this sprint"
flux dump -t "implement caching layer for API responses"

# Track follow-up tasks
flux dump -t "review Sarah's PR for authentication changes"
flux dump -t "update deployment documentation"
```

## Configuration

flux-cap stores configuration in `.flux/config.json`. You can customize:

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
  "tags": ["bug", "meeting", "review", "urgent"]  // Your custom tags
}
```

### Other Options
```json
{
  "defaultFocusDuration": 1500,    // 25 minutes in seconds
  "todoKeywords": ["TODO", "FIXME", "BUG", "OPTIMIZE", "HACK"],
  "sorted": true,                  // Sort dumps chronologically
  "theme": "minimal"
}
```

## Data Structure

```
.flux/
├── config.json          # Your configuration
├── dumps/               # Brain dumps organized by month
│   ├── 2026-02.json     
│   └── 2026-03.json     
└── sessions/            # Future: Focus session tracking
```

### Brain Dump Format
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

## Automated Versioning

flux-cap uses [Changesets](https://github.com/changesets/changesets) for automated semantic versioning:

### What happens when you merge a PR:
1. **Automatic Analysis**: GitHub Actions analyzes your PR changes
2. **Smart Version Bumping**: Determines appropriate version (major/minor/patch) based on:
   - PR title and description
   - Commit messages  
   - Files changed
3. **Changelog Generation**: Creates detailed changelog entries
4. **Version Updates**: Updates `package.json` automatically
5. **Git Integration**: Commits changes back to main branch

### Version Bump Rules:
- **Major** (`1.0.0 → 2.0.0`): Breaking changes, removed features, incompatible API changes
- **Minor** (`1.0.0 → 1.1.0`): New features, new commands, backwards-compatible enhancements
- **Patch** (`1.0.0 → 1.0.1`): Bug fixes, documentation updates, refactoring, performance improvements

### Manual Changesets:
```bash
# Add a changeset manually (if needed)
bun run changeset

# Check pending changesets
bun run changeset:status

# Apply version changes locally
bun run changeset:version
```

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

### Project Structure
```
src/
├── commands/           # Command implementations
│   ├── dump.command.ts
│   ├── search.command.ts
│   └── init.command.ts
├── utils/             # Shared utilities
│   ├── privacy.ts     # Git integration
│   ├── fuse.instance.ts # Search configuration
│   └── lib.ts         # File operations
└── types/             # TypeScript definitions
```

## Roadmap

### Phase 2 (v0.8.0 - Coming Soon)
- [ ] Convenience search commands (`flux recent`, `flux here`, `flux notes`)
- [ ] Tag match scoring integration
- [ ] Grouped result display by relevance
- [ ] Enhanced tag-based search filtering
- [ ] ASCII Pomodoro timer with themes
- [ ] Visual focus mode display
- [ ] Theme rotation system

### Phase 3 (Future)
- [ ] Advanced git context switching
- [ ] Session restoration
- [ ] Time tracking per context
- [ ] Tag analytics and insights

### Phase 4 (Maybe)
- [ ] AI-powered brain dump analysis
- [ ] Team collaboration features
- [ ] Cross-machine sync
- [ ] Smart tag suggestions

## Contributing

This is currently a personal learning project, but feedback and suggestions are welcome!

How to control version bumps:

### Method 1: Use GitHub Labels
Add these labels to your repository and apply them to PRs:
- `major` or `breaking` → Major version bump
- `minor` or `feature` → Minor version bump  
- `patch` or `bugfix` → Patch version bump

### Method 2: Use PR Title Syntax
Start your PR title with the version type in brackets:
- `[major] Remove deprecated API endpoints`
- `[minor] Add new search command` 
- `[patch] Fix memory leak in dump command`

### Method 3: Automatic Detection (Conservative)
The system will now only auto-detect major bumps with very explicit indicators like:
- "breaking change"
- "breaking:"
- "major:"
- "!breaking"
- "remove api"
- "delete command"

**Everything else defaults to patch unless you have clear feature indicators for minor.**

## License

MIT

---

Built for developers who think fast, context-switch often, and never want to lose a good idea.
