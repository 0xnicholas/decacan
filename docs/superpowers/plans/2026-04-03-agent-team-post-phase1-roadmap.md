# Decacan Agent Team Post-Phase1 Roadmap Implementation Plan

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the current Phase 1 Agent Team integration into a production-grade external ATS system with durable state, governance, observability, security, and scale guarantees.

**Architecture:** Keep runtime as the source-of-truth contract owner and move ATS execution to an external core behind a gateway adapter. Phase order is dependency-driven: externalize gateway behind a feature flag first, then add durable persistence/recovery, then harden governance and UI deltas, then operational/security/scale controls. Each phase must remain deployable and backward-compatible with the current assistant delegation flow.

**Tech Stack:** Rust (Axum, Tokio, Serde), PostgreSQL + SQLx, TypeScript + React 19 + React Router 7 + Vitest, optional gRPC/HTTP gateway, OpenTelemetry-compatible telemetry

---

## Baseline

- Phase 1 is complete on `main` at commit `1e2f5bf1`.
- Implemented capabilities include:
  - runtime contracts for assistant/team session/delegation/governance
  - in-process ATS adapter
  - app APIs for assistant sessions/team sessions/evolution proposal review
  - workspace assistant + task detail collaboration UI

---

## File Structure Map (Post-Phase1 Additions)

### Gateway + ATS externalization

- Create: `crates/decacan-infra/src/team/gateway_client.rs`
  External ATS client (HTTP/gRPC).
- Create: `crates/decacan-infra/src/team/retry.rs`
  Retry/backoff/idempotency helper.
- Create: `crates/decacan-infra/src/team/auth.rs`
  Outbound signing and inbound verification helpers.
- Modify: `crates/decacan-infra/src/team/adapter.rs`
  Switch from in-process execution to gateway-backed orchestration mode (feature-flagged).
- Modify: `crates/decacan-infra/src/team/mod.rs`
  Register gateway/auth/retry modules.
- Modify: `crates/decacan-infra/src/lib.rs`
  Export new infra module surfaces.

### Durable persistence + recovery

- Create: `crates/decacan-infra/src/persistence/postgres/assistant_sessions.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/assistant_delegations.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/team_sessions.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/approval_continuations.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/evolution_proposals.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/decision_records.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/authority_grants.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/mod.rs`
- Modify: `crates/decacan-infra/src/persistence/mod.rs`
  Register `postgres` module and storage selector wiring.
- Modify: `crates/decacan-app/src/app/state.rs`
  Recovery and bootstrapping paths from durable storage.
- Create: `crates/decacan-app/src/app/recovery.rs`
  Cold-start rehydration logic.
- Modify: `crates/decacan-app/src/app/mod.rs`
  Register `recovery` module.

### Governance hardening

- Create: `crates/decacan-runtime/src/authority/policy_matrix.rs`
  Action-classification and mandatory-human mapping.
- Modify: `crates/decacan-runtime/src/authority/evaluator.rs`
  Evaluate by matrix + delegated grant + policy profile.
- Create: `crates/decacan-app/src/api/assistant_decisions.rs`
  Explicit decision and audit endpoints.

### Workspaces collaboration UX

- Modify: `apps/workspaces/src/features/task-detail/TeamSessionPanel.tsx`
  Timeline, blocked reasons, continuation actions.
- Create: `apps/workspaces/src/features/task-detail/DecisionAuditPanel.tsx`
  Assistant/user decision history view.
- Create: `apps/workspaces/src/features/workspace-home/ActiveDelegationCard.tsx`
  Persistent delegation recovery UI.
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`
  Recover, resume, and reattach assistant sessions.

### Observability + security + scale

- Create: `crates/decacan-app/src/telemetry/agent_team.rs`
  Metrics/traces/events.
- Create: `crates/decacan-infra/src/security/request_signing.rs`
  HMAC/JWT signing for gateway calls.
- Create: `crates/decacan-infra/src/security/key_manager.rs`
  Key loading, rotation, and revocation checks.
- Create: `crates/decacan-app/src/api/admin/agent_team_health.rs`
  Ops endpoints and dashboards.
- Create: `crates/decacan-app/src/api/admin/mod.rs`
  Register and guard admin-only routes.
- Modify: `crates/decacan-app/src/api/mod.rs`
  Mount admin router with authorization middleware.
- Create: `crates/decacan-app/src/scheduling/agent_team_queue.rs`
  Backpressure, priority, and concurrency controls.
- Modify: `crates/decacan-app/src/lib.rs`
  Register `telemetry`, `scheduling`, and `config` module exports.

---

## Phase 2: ATS Externalization via Gateway

### Task 2.1: Gateway protocol and adapter mode switch

**Files:**
- Create: `crates/decacan-infra/src/team/gateway_client.rs`
- Create: `crates/decacan-infra/src/team/retry.rs`
- Modify: `crates/decacan-infra/src/team/adapter.rs`
- Test: `crates/decacan-infra/tests/team_gateway_adapter_test.rs`

- [ ] Define gateway request/response DTOs for `start/apply/advance/get_snapshot/continue_after_approval`.
- [ ] Add idempotency-key propagation and bounded retries.
- [ ] Add adapter mode switch (`in_process` | `gateway`) with safe default.
- [ ] Write failing gateway adapter tests (transport errors, timeout, idempotent retry).
- [ ] Implement minimal gateway client to pass tests.
- [ ] Register team submodules in `crates/decacan-infra/src/team/mod.rs` and exports in `crates/decacan-infra/src/lib.rs`.
- [ ] Commit: `feat(infra): add gateway-backed team adapter`

### Task 2.2: Gateway auth and trust boundary

**Files:**
- Create: `crates/decacan-infra/src/team/auth.rs`
- Modify: `crates/decacan-infra/src/team/gateway_client.rs`
- Test: `crates/decacan-infra/tests/team_gateway_auth_test.rs`

- [ ] Add outbound request signing (`timestamp`, `nonce`, `signature`).
- [ ] Add replay window checks and signature verification helper.
- [ ] Add failing tests for stale timestamp and invalid signature.
- [ ] Implement auth guard logic to satisfy tests.
- [ ] Commit: `feat(infra): add agent-team gateway signing`

**Phase 2 exit criteria**
- `cargo test -p decacan-infra --test team_gateway_adapter_test` passes.
- `cargo test -p decacan-app --test assistant_api_integration_test` passes in both adapter modes.
- `curl` parity check confirms unchanged response schema for:
  - `POST /api/assistant-sessions`
  - `GET /api/team-sessions/:id`
- Timeout/5xx/retry exhaustion map to documented status codes in API contract.

---

## Phase 3: Durable Persistence And Recovery

### Task 3.1: Postgres stores for assistant/team state

**Files:**
- Create: `crates/decacan-infra/src/persistence/postgres/assistant_sessions.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/assistant_delegations.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/team_sessions.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/approval_continuations.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/evolution_proposals.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/decision_records.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/authority_grants.rs`
- Create: `crates/decacan-infra/src/persistence/postgres/mod.rs`
- Modify: `crates/decacan-infra/src/persistence/mod.rs`
- Create: `crates/decacan-infra/tests/postgres_agent_team_persistence_test.rs`

- [ ] Design tables and SQLx models for session/delegation/snapshot/continuation/proposals/decision-records/authority-grants.
- [ ] Write failing persistence roundtrip tests.
- [ ] Implement store traits for Postgres.
- [ ] Register `postgres` module in `crates/decacan-infra/src/persistence/mod.rs` and select it in app wiring.
- [ ] Verify migration + rollback scripts.
- [ ] Commit: `feat(infra): add postgres agent-team persistence`

### Task 3.2: Recovery on app restart

**Files:**
- Create: `crates/decacan-app/src/app/recovery.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Test: `crates/decacan-app/tests/assistant_recovery_integration_test.rs`

- [ ] Write failing test for cold-start recovery of active delegation.
- [ ] Rehydrate sessions and bind to latest team snapshot on startup.
- [ ] Ensure stale continuation tokens are invalidated.
- [ ] Register `recovery` module in `crates/decacan-app/src/app/mod.rs`.
- [ ] Commit: `feat(app): restore assistant delegation on restart`

**Phase 3 exit criteria**
- `cargo test -p decacan-infra --test postgres_agent_team_persistence_test` passes.
- `cargo test -p decacan-app --test assistant_recovery_integration_test` passes.
- Restart simulation test proves active delegation, decision records, and authority grants survive process restart.

---

## Phase 4: Governance And Authority Hardening

**Policy ownership split (must remain stable across phases):**
- Phase 4 owns risk and mandatory-human policy classes.
- Phase 7 adds tenant/isolation constraints only.
- Any isolation rule must compose with (not replace) mandatory-human rules.

### Task 4.1: Policy matrix and risk classes

**Files:**
- Create: `crates/decacan-runtime/src/authority/policy_matrix.rs`
- Modify: `crates/decacan-runtime/src/authority/evaluator.rs`
- Test: `crates/decacan-runtime/tests/authority_policy_matrix_test.rs`

- [ ] Define action classes (`human_mandatory`, `assistant_delegable`, `forbidden`).
- [ ] Add failing tests for each class and escalation path.
- [ ] Implement evaluator using grant + policy matrix.
- [ ] Commit: `feat(runtime): add authority policy matrix`

### Task 4.2: Decision/audit APIs

**Files:**
- Create: `crates/decacan-app/src/api/assistant_decisions.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Test: `crates/decacan-app/tests/assistant_decision_api_test.rs`

- [ ] Add read/write decision endpoints with immutable audit records.
- [ ] Add failing tests for append-only enforcement.
- [ ] Implement API and mapping.
- [ ] Commit: `feat(app): add assistant decision audit endpoints`

**Phase 4 exit criteria**
- `cargo test -p decacan-runtime --test authority_policy_matrix_test` passes.
- `cargo test -p decacan-app --test assistant_decision_api_test` passes.
- Audit export for a sample session contains complete decision chain with policy reason.

---

## Phase 5: Workspaces Collaboration Experience (Agent Team First-Class)

**Delta over Phase 1 (already shipped):**
- Keep existing delegation status recovery and proposal review UI.
- Add decision audit timeline, blocker diagnostics, and explicit resume controls.

### Task 5.1: Persistent active delegation surfaces

**Files:**
- Create: `apps/workspaces/src/features/workspace-home/ActiveDelegationCard.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`
- Test: `apps/workspaces/src/test/workspace-home-page.test.tsx`

- [ ] Add UI for active team session, phase, blocked reason, resume action.
- [ ] Add failing tests for refresh/reopen recovery.
- [ ] Ensure no regression of existing status restoration and delegation navigation.
- [ ] Implement UI + state wiring.
- [ ] Commit: `feat(workspaces): show persistent active delegation card`

### Task 5.2: Decision timeline and actionable blockers in task page

**Files:**
- Create: `apps/workspaces/src/features/task-detail/DecisionAuditPanel.tsx`
- Modify: `apps/workspaces/src/features/task-detail/TeamSessionPanel.tsx`
- Modify: `apps/workspaces/src/features/task-detail/TaskPage.tsx`
- Test: `apps/workspaces/src/test/task-page.test.tsx`

- [ ] Add decision timeline panel and blocked-on-human CTA.
- [ ] Add failing tests for “blocked -> decision -> resumed” flow.
- [ ] Implement action handlers and refresh semantics.
- [ ] Commit: `feat(workspaces): add team decision timeline and blocker actions`

**Phase 5 exit criteria**
- `pnpm --dir apps/workspaces test -- --run src/test/workspace-home-page.test.tsx src/test/task-page.test.tsx` passes.
- User journey test confirms: view blocker -> inspect decision history -> submit decision -> session resumes.

---

## Phase 6: Observability And Ops Readiness

### Task 6.1: Metrics/traces for delegation lifecycle

**Files:**
- Create: `crates/decacan-app/src/telemetry/agent_team.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Test: `crates/decacan-app/tests/agent_team_telemetry_test.rs`

- [ ] Emit counters/latencies for session start, approval block, continuation, failure.
- [ ] Emit trace span correlation IDs across app->infra->gateway.
- [ ] Add failing telemetry assertions in integration tests.
- [ ] Register telemetry module in `crates/decacan-app/src/lib.rs`.
- [ ] Commit: `feat(app): add agent-team telemetry spans and metrics`

### Task 6.2: Health and diagnostic endpoints

**Files:**
- Create: `crates/decacan-app/src/api/admin/agent_team_health.rs`
- Create: `crates/decacan-app/src/api/admin/mod.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Test: `crates/decacan-app/tests/agent_team_health_api_test.rs`

- [ ] Add endpoint for gateway reachability, queue depth, degraded mode.
- [ ] Restrict endpoint to admin authorization context.
- [ ] Add failing tests for degraded mapping.
- [ ] Register `api::admin` module and mount route tree in `crates/decacan-app/src/api/mod.rs`.
- [ ] Implement endpoint.
- [ ] Commit: `feat(app): add agent-team health endpoint`

**Phase 6 exit criteria**
- `cargo test -p decacan-app --test agent_team_health_api_test` passes.
- Dashboard payload includes gateway health, queue depth, error-rate, and last recovery timestamp.

---

## Phase 7: Security And Isolation

### Task 7.1: Signed gateway requests + replay protection

**Files:**
- Create: `crates/decacan-infra/src/security/request_signing.rs`
- Create: `crates/decacan-infra/src/security/key_manager.rs`
- Modify: `crates/decacan-infra/src/team/gateway_client.rs`
- Test: `crates/decacan-infra/tests/gateway_signing_test.rs`

- [ ] Implement HMAC/JWT signing primitives.
- [ ] Add stale nonce/timestamp replay tests.
- [ ] Add key rotation and revocation checks in key manager.
- [ ] Enforce strict verification in gateway mode.
- [ ] Commit: `feat(infra): harden agent-team gateway signing`

### Task 7.2: Action isolation policy

**Files:**
- Modify: `crates/decacan-runtime/src/authority/policy_matrix.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Test: `crates/decacan-runtime/tests/authority_isolation_test.rs`

- [ ] Enforce workspace-scoped isolation and forbidden cross-workspace operations.
- [ ] Add failing tests for tenant-boundary escape attempts.
- [ ] Verify isolation checks run after mandatory-human/risk class checks.
- [ ] Implement enforcement.
- [ ] Commit: `feat(runtime): enforce tenant-isolated agent actions`

**Phase 7 exit criteria**
- `cargo test -p decacan-infra --test gateway_signing_test` passes.
- `cargo test -p decacan-runtime --test authority_isolation_test` passes.
- Rotation drill demonstrates key rollover without request downtime.

---

## Phase 8: Performance And Scalability

### Task 8.1: Queue and backpressure control

**Files:**
- Create: `crates/decacan-app/src/scheduling/agent_team_queue.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Test: `crates/decacan-app/tests/agent_team_queue_test.rs`

- [ ] Add bounded queue with priority classes.
- [ ] Add failing tests for saturation and fairness.
- [ ] Implement queue metrics and reject policy (`429`/defer).
- [ ] Register scheduling module in `crates/decacan-app/src/lib.rs`.
- [ ] Commit: `feat(app): add agent-team scheduling queue`

### Task 8.2: Scale verification

**Files:**
- Create: `crates/decacan-app/tests/agent_team_load_test.rs`
- Create: `docs/superpowers/specs/2026-04-xx-agent-team-slo-and-capacity.md`

- [ ] Define SLO targets (p95 latency, error rate, recovery time).
- [ ] Run synthetic load tests with baseline configs.
- [ ] Record capacity model and safe concurrency envelope.
- [ ] Commit: `test(app): add agent-team load and SLO verification`

**Phase 8 exit criteria**
- System has measured concurrency envelope and protective backpressure behavior.

---

## Phase 9: Rollout, Migration, And Release

### Task 9.1: Feature-flag rollout and migration

**Files:**
- Create: `crates/decacan-app/src/config/agent_team_rollout.rs`
- Create: `crates/decacan-infra/migrations/2026xxxx_agent_team_state.sql`
- Create: `crates/decacan-infra/migrations/2026xxxx_agent_team_backfill.sql`
- Test: `crates/decacan-app/tests/agent_team_rollout_test.rs`

- [ ] Add rollout flags by workspace/account cohort.
- [ ] Implement dual-write window (memory+db or legacy+new tables) with verification logging.
- [ ] Add migration scripts with backward-compatible defaults.
- [ ] Add backfill job and consistency check command.
- [ ] Add failing tests for flag gating behavior.
- [ ] Register rollout config module in `crates/decacan-app/src/lib.rs`.
- [ ] Commit: `feat(app): add agent-team rollout and migration controls`

### Task 9.2: Release checklist and rollback playbook

**Files:**
- Create: `docs/runbooks/agent-team-rollout.md`
- Create: `docs/runbooks/agent-team-rollback.md`

- [ ] Document deployment checklist and alert thresholds.
- [ ] Document rollback sequence and data-safety checks.
- [ ] Run game-day simulation and capture outcomes.
- [ ] Commit: `docs(runbooks): add agent-team rollout and rollback guides`

**Phase 9 exit criteria**
- Canary rollout to first cohort completes with no SLO breach for 24h.
- Rollback drill finishes within target RTO and preserves data consistency checks.

---

## Verification Matrix (Each Phase)

- [ ] Rust: `cargo test --workspace`
- [ ] Rust targeted: `cargo test -p decacan-runtime --test agent_team_contract_test`
- [ ] Rust targeted: `cargo test -p decacan-infra --test team_adapter_test`
- [ ] Rust targeted: `cargo test -p decacan-app --test assistant_api_integration_test --test evolution_proposals_api_test`
- [ ] Rust: `cargo clippy --workspace -- -D warnings`
- [ ] Rust: `cargo fmt --check`
- [ ] Workspaces: `pnpm --dir apps/workspaces test`
- [ ] Workspaces typecheck+build: `pnpm --dir apps/workspaces build` (includes `tsc`)
- [ ] API smoke where changed: `cargo test -p decacan-app --test http_smoke -- --nocapture`

---

## Commit Discipline

- [ ] Keep one phase as one PR-sized unit.
- [ ] Keep each task as one focused commit.
- [ ] Never mix unrelated cleanup with phase implementation commits.

---

## Risks And Guardrails

- [ ] Do not remove in-process adapter until gateway mode is proven stable.
- [ ] Do not weaken mandatory-human classes for performance shortcuts.
- [ ] Do not ship without cold-start recovery tests passing.
- [ ] Do not expose proposal review mutation beyond review-state update.
