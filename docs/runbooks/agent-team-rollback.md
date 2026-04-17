# Agent Team Rollback Runbook

## When to Rollback

- Queue depth > 95% for > 5 minutes
- Error rate > 5% sustained for > 2 minutes
- Gateway unreachable for > 1 minute
- p99 latency > 10s sustained
- Critical data corruption detected

## Rollback Steps

### Step 1: Stop New Traffic

```bash
# Disable feature flag
export TEAM_FEATURE_ENABLED=false

# Or in Kubernetes
kubectl set env deployment/orchestrator TEAM_FEATURE_ENABLED=false
```

### Step 2: Drain Active Sessions

```bash
# Check active sessions
curl https://api.decacan.com/admin/team-health | jq '.metrics.activeSessions'

# Wait for graceful completion (max 5 minutes)
# Or force complete if critical
```

### Step 3: Verify No New Sessions

```bash
# Should return 0 or declining
curl https://api.decacan.com/admin/team-health | jq '.metrics.activeSessions'
```

### Step 4: Database Safety Check

Before running rollback SQL:

```bash
# Verify backup exists
psql $DATABASE_URL -c "SELECT count(*) FROM team_sessions"

# If count > 0 and growing, DO NOT PROCEED
# Investigate and resolve blocking sessions first
```

### Step 5: Run Rollback Migration (Optional)

Only if absolutely necessary (data corruption):

```bash
psql $DATABASE_URL -f migrations/001_team_state_rollback.sql
```

**WARNING**: This will delete all team session data permanently.

## Data Preservation

If rollback is needed but data must be preserved:

1. **Backup before anything else**:
```bash
pg_dump $DATABASE_URL -t team_sessions -t team_delegations -t decision_records > team_state_backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Disable instead of delete**:
```bash
# Just disable the feature, don't drop tables
export TEAM_FEATURE_ENABLED=false
```

## Post-Rollback Verification

- [ ] Health check returns healthy: `GET /admin/team-health`
- [ ] Queue depth is 0
- [ ] No new team sessions being created
- [ ] Existing sessions completing gracefully
- [ ] No increase in error rates

## Communication

- Notify #engineering: "Agent Team feature rollback initiated"
- Update status page if applicable
- File incident report within 24 hours

## Post-Mortem

After rollback, schedule post-mortem within 48 hours to:
1. Identify root cause
2. Document lessons learned
3. Create action items
4. Update this runbook if needed
