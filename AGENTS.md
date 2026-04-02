# Agent Workflow Guide

This document defines roles, responsibilities, and workflow standards for AI agents working on the Decacan project.

## Active Agents

| Agent | Role | Responsibilities |
| --- | --- | --- |
| **Primary Controller** | Orchestrator | Plan decomposition, subagent coordination, code review, integration decisions, workspace synchronization |
| **Backend Subagents** | Implementation | Execute backend tasks (crates/*), write tests, report progress with checkpoints |
| **Frontend Agent** | UI Development | React/frontend implementation, API integration, UI/UX polish |
| **Verification Agent** | Quality Assurance | Test execution, lint/typecheck verification, final validation before completion |

## Workflow Patterns

### Task Execution Modes

**Parallel Execution** - Use when tasks are independent:
```
Task A ──┐
Task B ──┼──→ Parallel subagents → Combined results
Task C ──┘
```
Example: Implementing different registry modules (Capability, TeamSpec, Validator)

**Sequential Execution** - Use when tasks have dependencies:
```
Task A → Task B → Task C
```
Example: Database schema → API endpoints → Frontend integration

**Mixed Mode** - Most common pattern:
```
Phase 1: Parallel preparation (specs, types)
Phase 2: Sequential implementation
Phase 3: Parallel verification (tests, lint, typecheck)
```

### Subagent Reporting Format

Every subagent must report:

1. **Completion Status**: `[COMPLETED|BLOCKED|FAILED]`
2. **Files Modified**: List of changed files with line counts
3. **Test Results**: Pass/fail counts and any failures
4. **Checkpoints Met**: Verification of plan requirements
5. **Next Steps**: Recommendations for follow-up tasks

Example report:
```
Status: COMPLETED
Files: 3 modified (src/models.rs +45/-12, tests/models_test.rs +89)
Tests: 8 passed, 0 failed
Checkpoints:
  ✅ ModelRouter implements ModelPort trait
  ✅ OpenAI provider configured
  ✅ Fallback chain working
Next: Integration with decacan-app routes
```

### Failure Handling

**Task Failure Protocol**:
1. Report failure immediately with error details
2. Provide root cause analysis if possible
3. Suggest remediation: retry, alternative approach, or escalate
4. Do not proceed to dependent tasks

**Recovery Strategies**:
- **Retry**: Transient errors (network, temporary file locks)
- **Alternative**: Use different implementation approach
- **Escalate**: Blocker requires primary controller decision
- **Rollback**: Revert changes if state is corrupted

## Code Standards

### Style Requirements

**Rust (Backend)**:
- Follow existing patterns in each crate
- Use `thiserror` for error types
- Async functions use `async-trait` for traits
- All public APIs must have doc comments

**TypeScript/React (Frontend)**:
- Follow shadcn/ui component patterns
- Use Tailwind CSS v4 utility classes
- React hooks must include cleanup

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

Scopes: `runtime`, `app`, `infra`, `auth`, `workspaces`, `admin`, `models`, `config`, etc.

Examples:
```
feat(models): implement OpenAI provider with fallback

Add OpenAiProvider implementing ModelProvider trait.
Supports GPT-4, GPT-4-turbo, GPT-3.5-turbo models.
Includes retry logic for rate limit errors.

fix(runtime): handle None case in team assignment

docs(api): update playbook lifecycle endpoints
```

### Branch Strategy

**Main Branch Protection**:
- `main` is always deployable
- All changes via feature branches
- Smoke tests must pass before merge

**Feature Branches**:
- Naming: `feature/<brief-description>` or `feat/<scope>/<description>`
- Single concern per branch
- Delete after merge

**Hotfix Branches**:
- Naming: `hotfix/<issue-description>`
- Branch from `main`, merge back to `main`
- Cherry-pick to active feature branches if needed

## Testing Responsibilities

### Unit Testing

**Required Coverage**:
- All public functions must have tests
- Edge cases (empty input, max values, errors)
- Happy path and error paths

**Test Organization**:
```
crates/<crate>/
├── src/
│   └── lib.rs
└── tests/
    ├── <feature>_test.rs       # Feature tests
    └── <feature>_integration_test.rs  # Integration tests
```

### Integration Testing

**Cross-Crate Changes**:
- Must verify in downstream crates
- Example: runtime changes → run app tests

**Database Tests**:
- Use `#[sqlx::test]` for DB integration
- Each test gets fresh database state
- Clean up test data

### Verification Checklist

Before marking any task complete:

- [ ] All new code has tests
- [ ] `cargo test --workspace` passes
- [ ] `cargo clippy --workspace` shows no warnings
- [ ] `cargo fmt --check` passes
- [ ] No compiler warnings
- [ ] API smoke tests pass (if API changed)
- [ ] Documentation updated (if needed)

### Verification Commands

```bash
# Backend verification
cargo test --workspace
cargo clippy --workspace -- -D warnings
cargo fmt --check

# Frontend verification  
cd apps/<app> && pnpm lint
cd apps/<app> && pnpm typecheck

# API smoke tests
cargo test -p decacan-app --test http_smoke -- --nocapture
```

## Documentation Standards

### When to Update Docs

**Must Update**:
- New public APIs or endpoints
- Architecture changes
- Breaking changes
- New configuration options
- New environment variables

**Should Update**:
- Implementation details that differ from spec
- Performance considerations
- Known limitations

### Documentation Types

**Architecture Specs** (`docs/superpowers/specs/`):
- High-level design decisions
- Module boundaries and interfaces
- Data flow descriptions

**Implementation Plans** (`docs/superpowers/plans/`):
- Step-by-step implementation guide
- Task dependencies
- Acceptance criteria

**Code Documentation**:
- Doc comments for public APIs (`///`)
- Module-level documentation (`//!`)
- Complex algorithm explanations

**README Updates**:
- New features
- Changed setup instructions
- Updated architecture diagrams

### Documentation Format

**Specs use markdown with sections**:
```markdown
# Spec Title

## Goal
What this module/feature achieves

## Architecture
Design decisions and patterns

## Interface
Public API definition

## Dependencies
What this depends on and why
```

## Communication Protocol

### Status Updates

**Daily Sync** (if multi-day task):
- Progress since last update
- Blockers or risks
- Plan for next session

**Task Completion**:
- Summary of changes
- Test results
- Verification checklist confirmation
- Recommendations for related work

### Escalation Triggers

Escalate to Primary Controller when:
- Task blocked > 30 minutes
- Design decision needed
- Scope creep detected
- Conflicting requirements found
- Breaking change to public API

### Handoff Notes

When passing work between agents:
1. Current state summary
2. Files currently being modified
3. Known issues or TODOs
4. Next logical steps
5. Any special context

## Tool Usage Guidelines

### Git Operations

**Safe Commands** (subagents can use freely):
- `git status`, `git diff`
- `git add <specific-files>`
- `git commit -m "..."`
- `git checkout -b <feature-branch>`

**Restricted Commands** (requires primary controller approval):
- `git push` to main
- `git merge` to main
- `git rebase -i`
- `git reset --hard`
- Force pushes (`--force`, `--force-with-lease`)

### File Operations

**Use appropriate tools**:
- `Read` for viewing files
- `Write` for creating new files
- `Edit` for modifying existing files
- `Glob` for finding files by pattern
- `Grep` for searching content
- `Bash` for shell commands only

**Never use**:
- `cat`, `head`, `tail` for file reading (use `Read`)
- `echo` for file creation (use `Write`)
- `sed`, `awk` for edits (use `Edit`)

## Agent Onboarding

### New Agent Checklist

- [ ] Review this document
- [ ] Read project README
- [ ] Review recent implementation plans in `docs/superpowers/plans/`
- [ ] Run test suite to verify setup
- [ ] Complete a small task to learn workflow

### Quick Reference

**Project Root**: `/Users/nicholasl/Documents/build-whatever/decacan`

**Key Commands**:
```bash
# Full test suite
cargo test --workspace

# Backend only
cargo test -p decacan-runtime
cargo test -p decacan-app
cargo test -p decacan-infra

# Frontend
cd apps/workspaces && pnpm dev
cd apps/console && pnpm dev

# Database
sqlx migrate run
sqlx migrate add <name>
```

**Key Documentation**:
- README.md - Project overview
- docs/superpowers/specs/ - Architecture specs
- docs/superpowers/plans/ - Implementation plans
- This file - Agent workflow guide

---

Last updated: 2026-04-01
