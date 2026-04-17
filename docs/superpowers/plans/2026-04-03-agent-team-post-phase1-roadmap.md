# Agent Team Post-Phase1 Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the current orchestration runtime into a production-grade Agent Team System (ATS) with durable state, governance, observability, security, and scale guarantees.

**Architecture:** Keep the orchestrator as the source-of-truth contract owner and move ATS execution to an external core behind a gateway adapter. Phase order is dependency-driven: externalize gateway behind a feature flag first, then add durable persistence/recovery, then harden governance and UI deltas, then operational/security/scale controls. Each phase must remain deployable and backward-compatible with the current execution flow.

**Tech Stack:** TypeScript/Node.js (Hono + Drizzle ORM + Zod), PostgreSQL, React 19 + React Router 7 + Vitest, OpenTelemetry-compatible telemetry

---

## Baseline

- Phase 1 is represented by the current `packages/orchestrator` implementation.
- Current capabilities include:
  - ExecutionCoordinator with ExecutionStore interface
  - InMemoryExecutionStore and DbExecutionStore implementations
  - HTTP execution engine client (HttpExecutionEngineClient)
  - Basic approval workflow support
  - Task/Run/Artifact/Approval event recording

---

## File Structure Map (Post-Phase1 Additions)

### Gateway + ATS Externalization

- Create: `packages/orchestrator/src/infra/team-gateway-client.ts`
  External ATS client (HTTP).
- Create: `packages/orchestrator/src/infra/retry.ts`
  Retry/backoff/idempotency helper.
- Create: `packages/orchestrator/src/infra/signing.ts`
  Outbound signing and inbound verification helpers.
- Modify: `packages/orchestrator/src/infra/http-engine.ts`
  Switch from in-process execution to gateway-backed orchestration mode (feature-flagged).
- Modify: `packages/orchestrator/src/runtime/coordinator.ts`
  Add team session/agent delegation awareness.

### Durable Persistence + Recovery

- Create: `packages/orchestrator/src/db/team-sessions.ts`
  Team session persistence store.
- Create: `packages/orchestrator/src/db/assistant-sessions.ts`
  Assistant session persistence store.
- Create: `packages/orchestrator/src/db/delegations.ts`
  Delegation chain persistence.
- Create: `packages/orchestrator/src/db/approval-continuations.ts`
  Approval continuation state persistence.
- Create: `packages/orchestrator/src/db/evolution-proposals.ts`
  Evolution proposal persistence.
- Create: `packages/orchestrator/src/db/decision-records.ts`
  Decision audit trail persistence.
- Create: `packages/orchestrator/src/db/authority-grants.ts`
  Authority grant persistence.
- Modify: `packages/orchestrator/src/db/store.ts`
  Implement new store methods.
- Create: `packages/orchestrator/src/runtime/recovery.ts`
  Cold-start rehydration logic.

### Governance Hardening

- Create: `packages/orchestrator/src/runtime/authority/policy-matrix.ts`
  Action-classification and mandatory-human mapping.
- Modify: `packages/orchestrator/src/runtime/authority/evaluator.ts`
  Evaluate by matrix + delegated grant + policy profile.
- Create: `packages/orchestrator/src/api/team-decisions.ts`
  Explicit decision and audit endpoints.

### Workspaces Collaboration UX

- Modify: `apps/workspaces/src/features/task-detail/TeamSessionPanel.tsx`
  Timeline, blocked reasons, continuation actions.
- Create: `apps/workspaces/src/features/task-detail/DecisionAuditPanel.tsx`
  Assistant/user decision history view.
- Create: `apps/workspaces/src/features/workspace-home/ActiveDelegationCard.tsx`
  Persistent delegation recovery UI.
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`
  Recover, resume, and reattach assistant sessions.

### Observability + Security + Scale

- Create: `packages/orchestrator/src/telemetry/agent-team.ts`
  Metrics/traces/events.
- Create: `packages/orchestrator/src/security/request-signing.ts`
  HMAC/JWT signing for gateway calls.
- Create: `packages/orchestrator/src/security/key-manager.ts`
  Key loading, rotation, and revocation checks.
- Create: `packages/orchestrator/src/api/admin/team-health.ts`
  Ops endpoints and dashboards.
- Modify: `packages/orchestrator/src/api/server.ts`
  Mount admin router with authorization middleware.
- Create: `packages/orchestrator/src/scheduling/team-queue.ts`
  Backpressure, priority, and concurrency controls.

---

## Phase 2: ATS Externalization via Gateway

### Task 2.1: Gateway Protocol and Adapter Mode Switch

**Files:**
- Create: `packages/orchestrator/src/infra/team-gateway-client.ts`
- Create: `packages/orchestrator/src/infra/retry.ts`
- Modify: `packages/orchestrator/src/infra/http-engine.ts`
- Test: `packages/orchestrator/tests/team-gateway.test.ts`

- [ ] Define gateway request/response DTOs for `start/apply/advance/get_snapshot/continue_after_approval`.
- [ ] Add idempotency-key propagation and bounded retries.
- [ ] Add adapter mode switch (`in_process` | `gateway`) with safe default.
- [ ] Write failing gateway adapter tests (transport errors, timeout, idempotent retry).
- [ ] Implement minimal gateway client to pass tests.
- [ ] Register team submodules in exports.
- [ ] Commit: `feat(orchestrator): add gateway-backed team adapter`

### Task 2.2: Gateway Auth and Trust Boundary

**Files:**
- Create: `packages/orchestrator/src/infra/signing.ts`
- Modify: `packages/orchestrator/src/infra/team-gateway-client.ts`
- Test: `packages/orchestrator/tests/team-gateway-auth.test.ts`

- [ ] Add outbound request signing (`timestamp`, `nonce`, `signature`).
- [ ] Add replay window checks and signature verification helper.
- [ ] Add failing tests for stale timestamp and invalid signature.
- [ ] Implement auth guard logic to satisfy tests.
- [ ] Commit: `feat(orchestrator): add agent-team gateway signing`

**Phase 2 Exit Criteria**
- `pnpm --filter @decacan/orchestrator test -- --testNamePattern="team gateway"` passes.
- API parity check confirms unchanged response schema.
- Timeout/5xx/retry exhaustion map to documented status codes in API contract.

---

## Phase 3: Durable Persistence and Recovery

### Task 3.1: Database Stores for Team/Assistant State

**Files:**
- Create: `packages/orchestrator/src/db/team-sessions.ts`
- Create: `packages/orchestrator/src/db/assistant-sessions.ts`
- Create: `packages/orchestrator/src/db/delegations.ts`
- Create: `packages/orchestrator/src/db/approval-continuations.ts`
- Create: `packages/orchestrator/src/db/evolution-proposals.ts`
- Create: `packages/orchestrator/src/db/decision-records.ts`
- Create: `packages/orchestrator/src/db/authority-grants.ts`
- Modify: `packages/orchestrator/src/db/schema.ts`
- Modify: `packages/orchestrator/src/db/store.ts`
- Test: `packages/orchestrator/tests/team-persistence.test.ts`

- [ ] Design Drizzle tables for session/delegation/snapshot/continuation/proposals/decision-records/authority-grants.
- [ ] Write failing persistence roundtrip tests.
- [ ] Implement store methods for PostgreSQL.
- [ ] Run migrations.
- [ ] Commit: `feat(orchestrator): add team persistence stores`

### Task 3.2: Recovery on App Restart

**Files:**
- Create: `packages/orchestrator/src/runtime/recovery.ts`
- Modify: `packages/orchestrator/src/server.ts`
- Test: `packages/orchestrator/tests/team-recovery.test.ts`

- [ ] Write failing test for cold-start recovery of active delegation.
- [ ] Rehydrate sessions and bind to latest team snapshot on startup.
- [ ] Ensure stale continuation tokens are invalidated.
- [ ] Commit: `feat(orchestrator): restore team state on restart`

**Phase 3 Exit Criteria**
- `pnpm --filter @decacan/orchestrator test -- --testNamePattern="persistence|recovery"` passes.
- Restart simulation test proves active delegation, decision records, and authority grants survive process restart.

---

## Phase 4: Governance and Authority Hardening

**Policy ownership split (must remain stable across phases):**
- Phase 4 owns risk and mandatory-human policy classes.
- Phase 7 adds tenant/isolation constraints only.
- Any isolation rule must compose with (not replace) mandatory-human rules.

### Task 4.1: Policy Matrix and Risk Classes

**Files:**
- Create: `packages/orchestrator/src/runtime/authority/policy-matrix.ts`
- Modify: `packages/orchestrator/src/runtime/authority/evaluator.ts`
- Test: `packages/orchestrator/tests/policy-matrix.test.ts`

- [ ] Define action classes (`human_mandatory`, `assistant_delegable`, `forbidden`).
- [ ] Add failing tests for each class and escalation path.
- [ ] Implement evaluator using grant + policy matrix.
- [ ] Commit: `feat(orchestrator): add authority policy matrix`

### Task 4.2: Decision/Audit APIs

**Files:**
- Create: `packages/orchestrator/src/api/team-decisions.ts`
- Modify: `packages/orchestrator/src/api/server.ts`
- Test: `packages/orchestrator/tests/team-decisions-api.test.ts`

- [ ] Add read/write decision endpoints with immutable audit records.
- [ ] Add failing tests for append-only enforcement.
- [ ] Implement API and mapping.
- [ ] Commit: `feat(orchestrator): add team decision audit endpoints`

**Phase 4 Exit Criteria**
- `pnpm --filter @decacan/orchestrator test -- --testNamePattern="policy|decision"` passes.
- Audit export for a sample session contains complete decision chain with policy reason.

---

## Phase 5: Workspaces Collaboration Experience (Agent Team First-Class)

### Task 5.1: Persistent Active Delegation Surfaces

**Files:**
- Create: `apps/workspaces/src/features/workspace-home/ActiveDelegationCard.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`
- Test: `apps/workspaces/src/test/workspace-home-page.test.tsx`

- [ ] Add UI for active team session, phase, blocked reason, resume action.
- [ ] Add failing tests for refresh/reopen recovery.
- [ ] Ensure no regression of existing status restoration and delegation navigation.
- [ ] Implement UI + state wiring.
- [ ] Commit: `feat(workspaces): show persistent active delegation card`

### Task 5.2: Decision Timeline and Actionable Blockers in Task Page

**Files:**
- Create: `apps/workspaces/src/features/task-detail/DecisionAuditPanel.tsx`
- Modify: `apps/workspaces/src/features/task-detail/TeamSessionPanel.tsx`
- Modify: `apps/workspaces/src/features/task-detail/TaskPage.tsx`
- Test: `apps/workspaces/src/test/task-page.test.tsx`

- [ ] Add decision timeline panel and blocked-on-human CTA.
- [ ] Add failing tests for "blocked -> decision -> resumed" flow.
- [ ] Implement action handlers and refresh semantics.
- [ ] Commit: `feat(workspaces): add team decision timeline and blocker actions`

**Phase 5 Exit Criteria**
- `pnpm --filter decacan-workspaces test -- src/test/workspace-home-page.test.tsx src/test/task-page.test.tsx` passes.
- User journey test confirms: view blocker -> inspect decision history -> submit decision -> session resumes.

---

## Phase 6: Observability and Ops Readiness

### Task 6.1: Metrics/Traces for Delegation Lifecycle

**Files:**
- Create: `packages/orchestrator/src/telemetry/agent-team.ts`
- Modify: `packages/orchestrator/src/runtime/coordinator.ts`
- Test: `packages/orchestrator/tests/telemetry.test.ts`

- [ ] Emit counters/latencies for session start, approval block, continuation, failure.
- [ ] Emit trace span correlation IDs across app->infra->gateway.
- [ ] Add failing telemetry assertions in integration tests.
- [ ] Commit: `feat(orchestrator): add agent-team telemetry`

### Task 6.2: Health and Diagnostic Endpoints

**Files:**
- Create: `packages/orchestrator/src/api/admin/team-health.ts`
- Modify: `packages/orchestrator/src/api/server.ts`
- Test: `packages/orchestrator/tests/team-health-api.test.ts`

- [ ] Add endpoint for gateway reachability, queue depth, degraded mode.
- [ ] Restrict endpoint to admin authorization context.
- [ ] Add failing tests for degraded mapping.
- [ ] Implement endpoint.
- [ ] Commit: `feat(orchestrator): add team health endpoint`

**Phase 6 Exit Criteria**
- `pnpm --filter @decacan/orchestrator test -- --testNamePattern="health"` passes.
- Dashboard payload includes gateway health, queue depth, error-rate, and last recovery timestamp.

---

## Phase 7: Security and Isolation

### Task 7.1: Signed Gateway Requests + Replay Protection

**Files:**
- Create: `packages/orchestrator/src/security/request-signing.ts`
- Create: `packages/orchestrator/src/security/key-manager.ts`
- Modify: `packages/orchestrator/src/infra/team-gateway-client.ts`
- Test: `packages/orchestrator/tests/gateway-signing.test.ts`

- [ ] Implement HMAC/JWT signing primitives.
- [ ] Add stale nonce/timestamp replay tests.
- [ ] Add key rotation and revocation checks in key manager.
- [ ] Enforce strict verification in gateway mode.
- [ ] Commit: `feat(orchestrator): harden team gateway signing`

### Task 7.2: Action Isolation Policy

**Files:**
- Modify: `packages/orchestrator/src/runtime/authority/policy-matrix.ts`
- Modify: `packages/orchestrator/src/api/team-decisions.ts`
- Test: `packages/orchestrator/tests/authority-isolation.test.ts`

- [ ] Enforce workspace-scoped isolation and forbidden cross-workspace operations.
- [ ] Add failing tests for tenant-boundary escape attempts.
- [ ] Verify isolation checks run after mandatory-human/risk class checks.
- [ ] Implement enforcement.
- [ ] Commit: `feat(orchestrator): enforce tenant-isolated agent actions`

**Phase 7 Exit Criteria**
- `pnpm --filter @decacan/orchestrator test -- --testNamePattern="signing|isolation"` passes.
- Rotation drill demonstrates key rollover without request downtime.

---

## Phase 8: Performance and Scalability

### Task 8.1: Queue and Backpressure Control

**Files:**
- Create: `packages/orchestrator/src/scheduling/team-queue.ts`
- Modify: `packages/orchestrator/src/runtime/coordinator.ts`
- Test: `packages/orchestrator/tests/team-queue.test.ts`

- [ ] Add bounded queue with priority classes.
- [ ] Add failing tests for saturation and fairness.
- [ ] Implement queue metrics and reject policy (429/defer).
- [ ] Commit: `feat(orchestrator): add team scheduling queue`

### Task 8.2: Scale Verification

**Files:**
- Create: `packages/orchestrator/tests/team-load.test.ts`
- Create: `docs/superpowers/specs/2026-04-xx-agent-team-slo-and-capacity.md`

- [ ] Define SLO targets (p95 latency, error rate, recovery time).
- [ ] Run synthetic load tests with baseline configs.
- [ ] Record capacity model and safe concurrency envelope.
- [ ] Commit: `test(orchestrator): add team load and SLO verification`

**Phase 8 Exit Criteria**
- System has measured concurrency envelope and protective backpressure behavior.

---

## Phase 9: Rollout, Migration, and Release

### Task 9.1: Feature-Flag Rollout and Migration

**Files:**
- Create: `packages/orchestrator/src/config/team-rollout.ts`
- Create: `packages/orchestrator/src/db/migrations/2026xxxx_team_state.sql`
- Create: `packages/orchestrator/src/db/migrations/2026xxxx_team_backfill.sql`
- Test: `packages/orchestrator/tests/team-rollout.test.ts`

- [ ] Add rollout flags by workspace/account cohort.
- [ ] Implement dual-write window with verification logging.
- [ ] Add migration scripts with backward-compatible defaults.
- [ ] Add backfill job and consistency check.
- [ ] Add failing tests for flag gating behavior.
- [ ] Commit: `feat(orchestrator): add team rollout and migration controls`

### Task 9.2: Release Checklist and Rollback Playbook

**Files:**
- Create: `docs/runbooks/agent-team-rollout.md`
- Create: `docs/runbooks/agent-team-rollback.md`

- [ ] Document deployment checklist and alert thresholds.
- [ ] Document rollback sequence and data-safety checks.
- [ ] Run game-day simulation and capture outcomes.
- [ ] Commit: `docs(runbooks): add agent-team rollout and rollback guides`

**Phase 9 Exit Criteria**
- Canary rollout to first cohort completes with no SLO breach for 24h.
- Rollback drill finishes within target RTO and preserves data consistency checks.

---

## Verification Matrix (Each Phase)

- [ ] Orchestrator: `pnpm --filter @decacan/orchestrator test`
- [ ] Orchestrator targeted: `pnpm --filter @decacan/orchestrator test -- --testNamePattern="team"`
- [ ] Orchestrator typecheck: `pnpm --filter @decacan/orchestrator typecheck`
- [ ] Workspaces: `pnpm --filter decacan-workspaces test`
- [ ] Workspaces typecheck+build: `pnpm --filter decacan-workspaces build`
- [ ] API smoke where changed: `pnpm --filter @decacan/orchestrator test -- --testNamePattern="api"`

---

## Commit Discipline

- [ ] Keep one phase as one PR-sized unit.
- [ ] Keep each task as one focused commit.
- [ ] Never mix unrelated cleanup with phase implementation commits.

---

## Risks and Guardrails

- [ ] Do not remove in-process adapter until gateway mode is proven stable.
- [ ] Do not weaken mandatory-human classes for performance shortcuts.
- [ ] Do not ship without cold-start recovery tests passing.
- [ ] Do not expose proposal review mutation beyond review-state update.

---

*Created: 2026-04-03*
*Updated: 2026-04-17 - Converted to TypeScript/Node.js stack*
