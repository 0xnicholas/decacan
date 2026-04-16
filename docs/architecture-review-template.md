# Architecture Review Template

Use this template for feature design reviews, implementation plan reviews, or pull requests that affect architecture, boundaries, data flow, execution behavior, or long-term ownership.

Related reference:

- [`architecture.md`](./architecture.md)

## 1. Change Summary

- Title:
- Author:
- Date:
- Status:
- Related PR / Plan / Spec:

## 2. What Is Changing

Briefly describe the change in 3-6 sentences.

- Problem:
- Proposed change:
- Expected user or operator impact:

## 3. Scope

- Primary owning unit:
- Other touched units:
- Account scope, workspace scope, or both:
- In-scope:
- Explicitly out-of-scope:

## 4. Boundary Impact

Describe which product, application, runtime, or infrastructure boundaries are affected.

- Product boundary impact:
- API boundary impact:
- Runtime/domain impact:
- Adapter/infrastructure impact:

## 5. Data and Execution Impact

- New or changed domain objects:
- New or changed APIs / DTOs:
- New or changed persistence state:
- New or changed events / streams:
- New or changed execution paths:
- Migration or backward-compatibility notes:

## 6. Risks

- Primary risk:
- Secondary risks:
- Failure modes:
- Rollback or containment strategy:

## 7. Architecture Review Checklist

Mark each item as `Yes`, `No`, or `N/A`.
If any item is `No`, explain it in `Notes`.

### 7.1 Scope and Ownership

| Item | Answer | Notes |
|---|---|---|
| Clearly assigned to one primary owning unit |  |  |
| Respects the account-vs-workspace boundary |  |  |
| Avoids overlapping Console and Workspaces ownership |  |  |
| Keeps domain logic out of the wrong layer |  |  |

### 7.2 Domain Model and Runtime Fit

| Item | Answer | Notes |
|---|---|---|
| Maps cleanly to an existing domain concept, or defines a new one explicitly |  |  |
| Preserves `Task` and `Run` as the primary execution model where applicable |  |  |
| Keeps workflow, policy, and authority logic in `packages/orchestrator/src/runtime` |  |  |
| Avoids ad hoc flows outside runtime contracts |  |  |

### 7.3 API and Contract Design

| Item | Answer | Notes |
|---|---|---|
| API expresses a product concept rather than low-level implementation details |  |  |
| DTO changes are explicit and aligned with route ownership |  |  |
| Streaming or async status remains product-visible rather than adapter-visible |  |  |

### 7.4 State, Persistence, and Data Lifecycle

| Item | Answer | Notes |
|---|---|---|
| Source of truth is clear |  |  |
| No duplicate or competing state introduced |  |  |
| Durable state shape and lifecycle are clear |  |  |
| Transitional in-memory state is explicitly marked and bounded |  |  |

### 7.5 Events, Observability, and Auditability

| Item | Answer | Notes |
|---|---|---|
| User-visible state transitions are evented or projected correctly |  |  |
| Operators can understand the flow through events, traces, logs, or audit records |  |  |
| Failure, retry, blocked, and approval-required paths are observable |  |  |

### 7.6 Security, Policy, and Permissions

| Item | Answer | Notes |
|---|---|---|
| Authentication is enforced at the right entry points |  |  |
| Workspace roles, authority checks, and policies are evaluated in the right layer |  |  |
| Risky filesystem/model/orchestration actions remain approval-aware and auditable |  |  |
| Auth or provider concerns do not leak into unrelated modules |  |  |

### 7.7 Adapter and Infrastructure Boundaries

| Item | Answer | Notes |
|---|---|---|
| Runtime depends on ports rather than concrete adapters |  |  |
| New external dependencies are isolated in the right package/layer |  |  |
| Concrete adapter can be replaced without changing product contracts |  |  |

### 7.8 Frontend Boundary Fit

| Item | Answer | Notes |
|---|---|---|
| UI behavior lives in the correct app surface |  |  |
| Console does not duplicate workspace execution UX |  |  |
| Workspaces change fits shared-core-plus-industry-override direction |  |  |

### 7.9 Migration and Operability

| Item | Answer | Notes |
|---|---|---|
| Change moves toward the target architecture or documents the deviation |  |  |
| Transitional shortcuts have an explicit replacement seam |  |  |
| Deployment, config, and runtime operational impacts are understood |  |  |

## 8. Decision

- Review outcome:
- Approved by:
- Required follow-ups:

## 9. Open Questions

- Question 1:
- Question 2:

## 10. Follow-Up Links

- Spec:
- Plan:
- PR:
- Tracking issue:
