# Search 2.0 Design Document (`flux look`)

**Version:** 0.7.0  
**Command Name:** `flux look`  
**Status:** Design Phase  
**Last Updated:** 2024

---

## Executive Summary

Search 2.0 introduces intelligent, context-aware search for brain dumps through a new `flux look` command. Unlike the current `flux search` which relies solely on fuzzy matching, `flux look` uses **multi-signal ranking** that combines fuzzy matching, recency, and git context to surface the most relevant results.

---

## Problem Statement

### Current Pain Points (v0.6.0)

1. **Too many results** - Users get overwhelmed with 10+ results
2. **Poor relevance ranking** - Best results are often buried
3. **Keyword brittleness** - Typos and synonyms break search
4. **Not git-context aware** - Doesn't leverage captured metadata (branch, workingDir)
5. **Equal treatment of all dumps** - A dump from 3 months ago on a different branch ranks the same as yesterday's dump on current branch

### User Scenarios

#### Scenario 1: "What was I just doing?"
- **Current behavior**: `flux search` shows everything, unsorted by recency
- **Desired behavior**: Recent dumps should rank higher automatically

#### Scenario 2: "What was I working on in THIS branch?"
- **Current behavior**: No awareness of current git context
- **Desired behavior**: Dumps from current branch should be prioritized

#### Scenario 3: "Show me my tasks"
- **Current behavior**: `flux search tasks` searches message content for "tasks"
- **Desired behavior**: Should match tag exactly and rank higher

---

## Design Philosophy

### Core Principles

1. **Smart Defaults Over Explicit Flags**
   - Search should "just work" with minimal typing
   - Context-awareness by default (current branch, recent time)
   - Flags only needed to override smart behavior

2. **Speed Matters**
   - CLI tool used every 2-5 minutes
   - Search must be as fast as `flux dump`
   - No external API calls or heavy dependencies

3. **Progressive Enhancement**
   - v0.7.0: Foundation (multi-signal ranking)
   - v0.8.0: Convenience commands built on top
   - v1.5+: Hybrid with optional semantic search
   - v2.5+: Full semantic/AI integration

---

## Solution Architecture

### Multi-Signal Ranking System

Instead of relying on fuzzy matching alone, combine multiple signals:

```
CompositeScore = (
  fuzzyScore × fuzzyWeight +
  recencyScore × recencyWeight +
  gitContextScore × gitWeight +
  tagMatchScore × tagWeight
) / totalWeight
```

### Scoring Components

#### 1. Fuzzy Match Score (from Fuse.js)
- **Source**: Existing Fuse.js implementation
- **Range**: 0 (perfect match) to 1 (poor match)
- **Weight**: 1.0 (baseline)
- **Note**: Keep Fuse.js for fuzzy matching quality

#### 2. Recency Score
- **Formula**: `1 / (1 + daysSince)` or `e^(-daysSince/7)`
- **Range**: 0 (old) to 1 (very recent)
- **Weight**: 0.5
- **Logic**: Exponential decay - recent dumps matter more

#### 3. Git Context Score
- **Components**:
  - Same branch as current: +1.0
  - Same working directory: +0.5
  - Has uncommitted changes: +0.3 (more volatile/active)
- **Range**: 0 to 1.8 (can exceed 1.0)
- **Weight**: 0.7

#### 4. Tag Match Score (v0.8.0)
- **Components**:
  - Exact tag match in query: +1.0
  - Partial tag match: +0.5
- **Range**: 0 to 1.0
- **Weight**: 0.8
- **Note**: Defer to v0.8.0 when adding convenience commands

---

## Technical Implementation

### Phase 1: v0.7.0 - Foundation

#### New Command: `flux look`

```bash
# Basic usage
flux look auth                    # Smart context-aware search
flux look "fix bug"               # Multi-word queries

# Override smart defaults (flags)
flux look auth --all              # Search ALL branches, ALL time
flux look auth --branch main      # Specific branch
flux look auth -n 10              # More results (default: 5)
flux look auth --since 30d        # Wider time window
```

#### Implementation Approach: Option A - Wrap Fuse.js

1. Let Fuse.js handle fuzzy matching (keep quality)
2. Take Fuse results
3. Re-score with multi-signal logic
4. Re-sort by composite score

**Why not replace Fuse.js?**
- Fuse is battle-tested for fuzzy matching
- Handles typos, partial matches well
- Focus our effort on smart ranking, not fuzzy algorithms

#### Function Signature

```typescript
// src/utils/search/helper.ts
import type { BrainDump, FluxConfig } from "../../types";

type ScoredResult = {
  item: BrainDump;
  score: number;
  // Optional: for debugging
  scoreBreakdown?: {
    fuzzy: number;
    recency: number;
    gitContext: number;
  };
};

export const searchV2Helper = (
  config: FluxConfig,
  fuseResults: Array<{ item: BrainDump; score?: number }>,
  currentContext: {
    branch?: string;
    workingDir?: string;
    currentTime: Date;
  }
): ScoredResult[] => {
  // Calculate composite scores
  // Re-rank results
  // Return top N
};
```

#### v0.7.0 Scope - 3 Signals Only

For simplicity and fast shipping:
1. ✅ Fuzzy match (already have)
2. ✅ Recency boost (easy to add)
3. ✅ Git branch boost (captured data, just use it)

**Deferred to v0.8.0:**
- Tag match boosting
- Working directory matching
- More complex filtering

#### Configuration

**For v0.7.0: Hardcoded weights**
```typescript
const SCORING_WEIGHTS = {
  fuzzy: 1.0,
  recency: 0.5,
  gitContext: 0.7,
};
```

**For v0.8.0+: Configurable (optional)**
```json
{
  "search": {
    "scoring": {
      "fuzzyWeight": 1.0,
      "recencyWeight": 0.5,
      "gitContextWeight": 0.7,
      "tagMatchWeight": 0.8
    }
  }
}
```

---

### Phase 2: v0.8.0 - Convenience Layer

Built on top of v0.7.0's improved search engine:

```bash
flux recent     # Last 10 dumps (no query needed)
flux notes      # All note-tagged dumps
flux ideas      # All idea-tagged dumps
flux tasks      # All task-tagged dumps
flux links      # All link-tagged dumps
flux bugs       # All bug-tagged dumps
flux imp        # All important-tagged dumps
flux here       # Dumps from current branch + directory
```

**Implementation:**
All convenience commands are just wrappers that pass the right parameters to `searchV2Helper`:

```typescript
// flux recent
searchV2Helper(config, allDumps, currentContext, {
  limit: 10,
  sortBy: 'timestamp'
});

// flux tasks
searchV2Helper(config, allDumps, currentContext, {
  tags: ['tasks'],
  limit: 20
});

// flux here
searchV2Helper(config, allDumps, currentContext, {
  branch: currentBranch,
  workingDir: currentDir,
  limit: 10
});
```

---

## User Experience Design

### Result Display Options

#### Option A: Simple List (Current - Keep for v0.7.0)
```
1. [task] fix auth bug (feature/auth, 2h ago)
2. [idea] add 2FA support (feature/auth, 1d ago)
3. [note] auth meeting notes (main, 5d ago)
```

**Pros:** Clean, familiar, easy to scan  
**Cons:** No visual indication of relevance

#### Option B: Grouped by Relevance (v0.8.0+)
```
🔥 Highly Relevant (current branch + recent):
  1. [task] fix auth bug (2h ago)
  
📍 Same Branch:
  2. [idea] add 2FA support (1d ago)
  
📚 Other Results:
  3. [note] auth meeting notes (main, 5d ago)
```

**Pros:** Clear visual hierarchy, explains ranking  
**Cons:** More verbose, takes more screen space

#### Option C: Scored (Debug Mode)
```
1. [95%] [task] fix auth bug (feature/auth, 2h ago)
2. [78%] [idea] add 2FA support (feature/auth, 1d ago)
3. [45%] [note] auth meeting notes (main, 5d ago)
```

**Pros:** Transparent, good for debugging  
**Cons:** Numbers might confuse users

**Decision for v0.7.0:** Keep Option A, add `--debug` flag for Option C

---

## Integration with TUI (v0.9.0)

The `flux ui` command will build on Search 2.0:

### CLI (`flux look`) - Speed
- Quick queries
- Smart defaults
- Minimal typing
- Terminal output

### TUI (`flux ui`) - Exploration
- Live search filtering
- Interactive tag/branch/date filters
- Preview pane for dump content
- Multi-select for batch operations
- Visual score indicators

**They complement each other:** CLI for speed, TUI for exploration.

---

## Future Enhancements

### v1.5.0 - Hybrid Search (Option C)
- Keep fuzzy as default (fast, local)
- Add `flux look --semantic <query>` for AI-powered search
- Best of both worlds
- Requires embeddings (local model or API)

### v2.5.0+ - Full Semantic Search (Option B)
- Embeddings for all dumps
- True semantic matching ("error handling" matches "try-catch blocks")
- Relationship mapping ("these 5 dumps are about the same problem")
- Summary capabilities (daily/weekly summaries)

**Tradeoffs:**
- ✅ Better matching quality
- ✅ Handles synonyms, concepts
- ❌ More dependencies (OpenAI API or local models)
- ❌ Slower (embedding generation)
- ❌ Complexity (vector storage)
- ❌ Privacy concerns (if using API)

**Decision:** Not for v0.7.0 - keep it fast, local, and simple.

---

## Alternatives Considered

### Why not improve `flux search` instead of new `flux look` command?

**Decision:** Create new `flux look` for v0.7.0

**Reasons:**
1. Allows gradual migration (users can try `look` while `search` still works)
2. Easier to A/B test and compare
3. Can deprecate `search` in v1.0.0 after validation
4. Clean slate for new architecture

### Why not semantic search now?

**Decision:** Defer to v1.5.0+

**Reasons:**
1. Adds significant complexity (embeddings, vector DB, APIs)
2. Slower search (generation time)
3. External dependencies (OpenAI or model downloads)
4. Privacy concerns (API calls)
5. 80% of problem solvable with smart fuzzy + ranking

---

## Success Metrics

### How do we know v0.7.0 is better?

1. **Qualitative:**
   - Manual testing with real dumps
   - "Does it feel better?"
   - Are results more relevant?

2. **Quantitative:**
   - A/B comparison: `flux search auth` vs `flux look auth`
   - Position of "correct" result (should be in top 3)
   - Number of results needed to scan (should be < 5)

3. **User Feedback:**
   - Alpha testers try both commands
   - Gather feedback on relevance

---

## Implementation Checklist

### v0.7.0 - Foundation
- [ ] Create `searchV2Helper` function
  - [ ] Implement recency scoring
  - [ ] Implement git context scoring
  - [ ] Combine fuzzy + recency + git scores
  - [ ] Sort by composite score
- [ ] Create `flux look` command
  - [ ] Parse query and flags
  - [ ] Get current git context
  - [ ] Call Fuse.js for fuzzy matching
  - [ ] Pass to `searchV2Helper` for re-ranking
  - [ ] Display results
- [ ] Add command flags
  - [ ] `--all` (disable smart defaults)
  - [ ] `--branch <name>`
  - [ ] `-n, --limit <number>`
  - [ ] `--since <duration>`
  - [ ] `--debug` (show score breakdown)
- [ ] Testing
  - [ ] Unit tests for scoring functions
  - [ ] Integration tests with sample dumps
  - [ ] Manual testing with real data
- [ ] Documentation
  - [ ] Update README with `flux look`
  - [ ] Add examples
  - [ ] Migration guide from `flux search`

### v0.8.0 - Convenience Layer
- [ ] Implement convenience commands
  - [ ] `flux recent`
  - [ ] `flux notes`
  - [ ] `flux ideas`
  - [ ] `flux tasks`
  - [ ] `flux links`
  - [ ] `flux bugs`
  - [ ] `flux imp`
  - [ ] `flux here`
- [ ] Add tag match scoring
- [ ] Add working directory matching
- [ ] Improve result display (grouped view)
- [ ] Documentation updates

---

## Open Questions

### For Next Discussion:

1. **Current context parameter:**
   - Should we pass `currentContext` to helper, or get it inside?
   - Where should we fetch current git branch/workingDir?

2. **Score breakdown:**
   - Add `scoreBreakdown` for debugging now, or later?
   - Is it worth the extra complexity in v0.7.0?

3. **Implementation order:**
   - Which scoring component to implement first?
   - Recency (simpler) or git context (more impactful)?

4. **Testing strategy:**
   - How to validate scoring is better?
   - Unit tests with synthetic data?
   - Manual testing with real dumps?

5. **Weight tuning:**
   - How do we determine optimal weights?
   - Trial and error with real data?
   - Should they be configurable from the start?

---

## Appendix

### BrainDump Type Reference

```typescript
export type BrainDump = {
  id: string;
  timestamp: string;
  message: string;
  workingDir?: string;
  branch?: string | null;
  tags?: string[];
  hasUncommittedChanges?: boolean;
};
```

### Current Search Fields (Fuse.js)

```typescript
searchFields: ["message", "branch", "workingDir", "tags"]
```

### Current Fuse.js Config

```typescript
{
  keys: config.search.searchFields,
  includeScore: true,
  threshold: 0.5  // Pretty loose matching
}
```

---

## References

- [Fuse.js Documentation](https://fusejs.io/)
- [Semantic Search Alternatives](https://github.com/jina-ai/clip-as-service)
- [Scoring Algorithm Inspiration](https://www.algolia.com/doc/guides/managing-results/relevance-overview/)

---

**End of Document**
