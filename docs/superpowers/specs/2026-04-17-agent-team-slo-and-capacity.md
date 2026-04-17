# Agent Team SLO and Capacity Specification

## Service Level Objectives

### Latency

| Metric | Target | Measurement |
|--------|--------|-------------|
| Session start p50 | < 500ms | Histogram |
| Session start p95 | < 2s | Histogram |
| Session start p99 | < 5s | Histogram |
| Approval block detection | < 100ms | Event latency |
| Decision submission | < 500ms | End-to-end |

### Availability

| Metric | Target |
|--------|--------|
| System availability | 99.9% |
| Gateway reachability check | Every 30s |
| Recovery time objective (RTO) | < 30s |
| Recovery point objective (RPO) | < 1s |

### Throughput

| Metric | Target |
|--------|--------|
| Active sessions | 100 concurrent |
| Decisions per minute | 1000 |
| Approval blocks per minute | 100 |

### Error Rate

| Metric | Target |
|--------|--------|
| Failed session rate | < 0.1% |
| Timeout rate | < 1% |
| 5xx error rate | < 0.5% |

## Capacity Model

### Concurrency Envelope

```
Maximum Active Sessions: 100
Maximum Queue Depth: 100
Maximum High Priority: 50
Maximum Normal Priority: 30
Maximum Low Priority: 20

Total Throughput: ~1000 decisions/minute
```

### Resource Limits

| Resource | Limit |
|----------|-------|
| Memory per session | 10MB |
| Database connections | 50 |
| Gateway connections | 20 |
| Event queue size | 1000 |

### Backpressure Behavior

When queue utilization exceeds 80%:
- New high-priority requests: ACCEPTED (if under limit)
- New normal-priority requests: QUEUED (delay < 1s)
- New low-priority requests: REJECTED (429)

When queue is full (100%):
- All new requests: REJECTED (429)
- Error message: "Queue saturated, retry after backoff"

### Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| Queue utilization > 80% | +10 capacity | - |
| Queue utilization < 20% for 5min | - | -5 capacity |
| Memory > 80% | +20% memory | - |
| Error rate > 5% | Alert | - |

## Monitoring Alerts

| Alert | Threshold | Severity |
|-------|-----------|----------|
| Queue > 90% | > 90 | Critical |
| Session fail rate > 1% | > 1% | Warning |
| p95 latency > 5s | > 5s | Warning |
| Gateway unreachable | Any | Critical |
| Recovery failed | Any | Critical |

## Capacity Testing

### Load Test Scenarios

1. **Baseline**: 50 concurrent sessions, steady state
2. **Burst**: 100 concurrent sessions, 2x peak
3. **Stress**: 150 concurrent sessions, until degradation
4. **Recovery**: Failure injection, verify RTO

### Test Duration

- Steady state tests: 10 minutes minimum
- Burst tests: 2 minutes peak, 5 minutes cool-down
- Stress tests: Until system degrades or 30 minutes max

## Safe Concurrency Envelope

Based on capacity model:

- **Conservative**: 50 active sessions, 50 queue depth
- **Recommended**: 100 active sessions, 100 queue depth
- **Maximum**: 150 active sessions (degraded performance expected)

## Related Documents

- Runbook: `docs/runbooks/agent-team-rollout.md`
- Runbook: `docs/runbooks/agent-team-rollback.md`
