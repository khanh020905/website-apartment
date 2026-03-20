---
name: writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
---

# Writing Skills

## Overview
Skills are reusable instruction sets that guide AI agents through specific workflows. Good skills are precise, evade rationalization, and produce consistent results.

**Announce at start:** "I'm using the writing-skills skill to create/update this skill."

## What is a Skill?
A skill is a `.md` file with YAML frontmatter that tells an agent HOW to approach a specific type of task. Skills are:
- **Invoked** when the agent recognizes the task type
- **Followed precisely** - not adapted, not interpreted loosely
- **Tested** before deployment

## Skill Types

### Technique
How-to guides for specific processes. Examples: test-driven-development, systematic-debugging.
- Has a clear start state and end state
- Includes RED FLAG list to prevent rationalization
- Has verification checklist

### Pattern
Mental models for thinking about problems. Examples: using-git-worktrees.
- Describes when to use the pattern
- Provides concrete examples
- Shows what NOT to do

### Reference
Documentation and API guides. Examples: testing-anti-patterns.
- Organized for scanning, not reading
- Tables > prose
- Concrete examples

## Directory Structure

```
.agents/skills/<skill-name>/
├── SKILL.md          # Required: Main skill file
└── [optional supporting files]
```

## SKILL.md Structure

```markdown
---
name: skill-name
description: When to use this skill (triggers invocation)
---

# Skill Name

## Overview
What this skill does and its core principle.

## When to Use
Clear conditions for invoking this skill.

## The Process / Steps / The Pattern
The actual instructions.

## Red Flags
List of rationalization patterns to watch for.

## Verification Checklist
How to confirm the skill was followed correctly.
```

## The Iron Law (Same as TDD)
```
NO SKILL DEPLOYMENT WITHOUT TESTING FIRST
```

Test every skill by:
1. Having an agent follow it in a real scenario
2. Verifying it produces the expected outcome
3. Identifying loopholes and closing them

## Key Principles

### Token Efficiency (Critical)
Every word costs tokens. Ruthlessly cut:
- "It's important to" → delete
- "You should always" → "Always"
- Narrative explanations → tables
- Long prose → flowcharts

### Rich Description Field
The description determines when the skill is invoked. Make it trigger-rich:
```yaml
# Bad: too vague
description: Use for debugging

# Good: trigger conditions
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
```

### Keyword Coverage
Include synonyms agents might search for:
- "bugs", "errors", "failures", "unexpected behavior"
- "tests", "testing", "TDD", "red-green"

### Rationalization Tables
Every skill needs a rationalization table:
```markdown
| Thought | Reality |
|---------|---------|
| "This is too simple" | Simple things have edge cases |
| "Just this once" | No exceptions |
```

## Anti-Patterns

### ❌ Narrative Example
```markdown
When you encounter a bug, the first thing you should do is take a moment
to understand what's really happening. It can be tempting to just jump in
and start fixing things, but...
```

### ✅ Correct Structure
```markdown
## The Iron Law
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION

## Phase 1: Root Cause
1. Read error messages completely
2. Reproduce consistently
3. Check recent changes
```

### ❌ No Red Flags List
Agents will rationalize. Enumerate the rationalizations explicitly.

### ❌ Generic Labels
```markdown
## Step 1: Do the thing
```

### ✅ Specific Labels
```markdown
## Phase 1: Root Cause Investigation
**BEFORE attempting ANY fix:**
```

## Skill Creation Checklist
- [ ] YAML frontmatter with name and description
- [ ] Overview with core principle
- [ ] Clear trigger conditions (When to Use)
- [ ] Step-by-step process
- [ ] Red Flags / rationalization table
- [ ] Verification checklist
- [ ] Tested in real scenario
- [ ] Loopholes identified and closed
- [ ] Token-efficient (no fluff)

## The Bottom Line
A skill that isn't followed is worthless. Test it. Close the loopholes. Make compliance the path of least resistance.
