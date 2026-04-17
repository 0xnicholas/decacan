# Agent Team Rollout Runbook

## Pre-Rollout Checklist

- [ ] Migration `001_team_state.sql` tested in staging
- [ ] Rollback `001_team_state_rollback.sql` tested in staging
- [ ] Feature flags configured in staging
- [ ] Load tests completed and within SLO targets
- [ ] Health check endpoint verified: `GET /admin/team-health`
- [ ] Runbook reviewed by team lead

## Environment Variables

```bash
# Enable feature (default: false)
TEAM_FEATURE_ENABLED=false

# Cohort-based rollout (comma-separated workspace IDs)
TEAM_COHORT_IDS=ws-123,ws-456,ws-789

# Percentage-based rollout (0-100)
TEAM_ROLLOUT_PERCENTAGE=10

# Individual feature flags
TEAM_FLAG_TEAM_GATEWAY=true
TEAM_FLAG_TEAM_SESSIONS=true
TEAM_FLAG_TEAM_DECISIONS=true
TEAM_FLAG_TEAM_QUEUE=true
TEAM_FLAG_TEAM_RECOVERY=true
```

## Rollout Phases

### Phase 1: Staging Verification (Day 0)

```bash
# Set staging environment
export TEAM_FEATURE_ENABLED=true
export TEAM_FLAG_TEAM_GATEWAY=true
export TEAM_FLAG_TEAM_SESSIONS=true
export TEAM_FLAG_TEAM_DECISIONS=true

# Verify health
curl https://staging-api.decacan.com/admin/team-health
```

Expected response:
```json
{
  "status": "healthy",
  "gateway": { "reachable": true },
  "metrics": { "activeSessions": 0 }
}
```

### Phase 2: Internal Cohort (Day 1-3)

```bash
# Enable for internal workspaces only
export TEAM_FEATURE_ENABLED=true
export TEAM_COHORT_IDS=int-001,int-002,int-003

# Monitor for 24 hours minimum
```

### Phase 3: Percentage Rollout (Day 4-7)

```bash
# 10% rollout
export TEAM_FEATURE_ENABLED=true
export TEAM_ROLLOUT_PERCENTAGE=10
```

### Phase 4: Full Rollout (Day 8+)

```bash
# 100% rollout
export TEAM_FEATURE_ENABLED=true
export TEAM_ROLLOUT_PERCENTAGE=100
```

## Monitoring

### Key Metrics

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Queue depth | < 50 | 50-80 | > 80 |
| Error rate | < 0.5% | 0.5-2% | > 2% |
| p95 latency | < 2s | 2-5s | > 5s |
| Active sessions | < 80 | 80-95 | > 95 |

### Alert Response

1. **Queue > 90%**: Scale up gateway instances
2. **Error rate > 2%**: Check logs, consider rollback
3. **Gateway unreachable**: Failover to backup gateway
4. **Recovery failed**: Manual intervention required

## Rollback Procedure

See [agent-team-rollback.md](./agent-team-rollback.md)

## Support

- On-call: See PagerDuty schedule
- Slack: #agent-team-support
- Email: support@decacan.com
