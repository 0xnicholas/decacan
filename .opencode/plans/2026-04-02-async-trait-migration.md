# Async Trait Migration Plan

## Overview
Convert StoragePort and ModelPort traits from sync to async across the decacan workspace.

## Motivation
- Current mismatch: Traits are sync, but implementations (PostgresStorage, ModelRouter) are async
- This causes compilation errors (lifetime mismatches)
- Async is the correct architecture for I/O-bound operations (DB, HTTP)

## Scope
### Files to modify: 15-18 files
### Estimated time: 1.5-2 hours
### Complexity: Mechanical changes (add async/.await), but widespread

---

## Phase 1: Update Trait Definitions

### Task 1.1: Update StoragePort trait

**File**: `crates/decacan-runtime/src/ports/storage.rs`

**Changes**:
```rust
use async_trait::async_trait;

#[async_trait]
pub trait StoragePort: Send + Sync {
    type Error;

    async fn put(&self, key: &str, value: &str) -> Result<(), Self::Error>;
    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error>;
}
```

**Checkpoints**:
- [ ] Add `async-trait` import
- [ ] Add `#[async_trait]` attribute
- [ ] Change `fn` to `async fn`
- [ ] Compile check passes

---

### Task 1.2: Update ModelPort trait

**File**: `crates/decacan-runtime/src/ports/model.rs`

**Changes**:
```rust
use async_trait::async_trait;

#[async_trait]
pub trait ModelPort: Send + Sync {
    type Error;

    async fn complete(&self, prompt: &str) -> Result<String, Self::Error>;
}
```

**Checkpoints**:
- [ ] Same as Task 1.1

---

## Phase 2: Update Implementations in decacan-infra

### Task 2.1: Update MemoryStorage

**File**: `crates/decacan-infra/src/storage/memory.rs`

**Current**:
```rust
impl StoragePort for MemoryStorage {
    type Error = Infallible;

    fn put(&self, key: &str, value: &str) -> Result<(), Self::Error> { ... }
    fn get(&self, key: &str) -> Result<Option<String>, Self::Error> { ... }
}
```

**New**:
```rust
use async_trait::async_trait;

#[async_trait]
impl StoragePort for MemoryStorage {
    type Error = Infallible;

    async fn put(&self, key: &str, value: &str) -> Result<(), Self::Error> {
        let mut values = self.values.write().unwrap_or_else(|e| e.into_inner());
        values.insert(key.to_string(), value.to_string());
        Ok(())
    }

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let values = self.values.read().unwrap_or_else(|e| e.into_inner());
        Ok(values.get(key).cloned())
    }
}
```

**Checkpoints**:
- [ ] Add async_trait import
- [ ] Add #[async_trait] attribute
- [ ] Remove .expect() calls (already fixed)
- [ ] Compile check passes

---

### Task 2.2: Update PostgresStorage

**File**: `crates/decacan-infra/src/storage/postgres.rs`

**Current**:
```rust
impl StoragePort for PostgresStorage {
    type Error = PostgresStorageError;

    async fn put(&self, key: &str, value: &str) -> Result<(), Self::Error> { ... }
    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> { ... }
}
```

**New**: Already async, just needs #[async_trait]

**Changes**:
```rust
use async_trait::async_trait;

#[async_trait]
impl StoragePort for PostgresStorage {
    ...
}
```

**Checkpoints**:
- [ ] Add #[async_trait] attribute
- [ ] Compile check passes

---

### Task 2.3: Update MockModel

**File**: `crates/decacan-infra/src/models/mock.rs`

**Changes**: Same pattern as MemoryStorage

---

### Task 2.4: Update ModelRouter

**File**: `crates/decacan-infra/src/models/router.rs`

**Changes**: Add #[async_trait] to impl block

---

### Task 2.5: Update other model implementations

**Files**:
- `crates/decacan-infra/src/models/openai.rs`
- `crates/decacan-infra/src/models/anthropic.rs`
- `crates/decacan-infra/src/models/openai_compatible.rs`

**Changes**: Add #[async_trait] attribute

---

## Phase 3: Update Callers in decacan-runtime

### Task 3.1: Update artifact/service.rs

**File**: `crates/decacan-runtime/src/artifact/service.rs`

**Current**:
```rust
fn store_artifact<S>(storage: &S, artifact: &Artifact) -> Result<String, ArtifactServiceError>
where
    S: StoragePort,
{
    storage.put(&key, &value)?;
}
```

**New**:
```rust
async fn store_artifact<S>(storage: &S, artifact: &Artifact) -> Result<String, ArtifactServiceError>
where
    S: StoragePort,
{
    storage.put(&key, &value).await?;
}
```

**All functions calling store_artifact/store_relation** must become async and add .await

**Checkpoints**:
- [ ] Identify all callers
- [ ] Add async to function signatures
- [ ] Add .await to calls
- [ ] Propagate async up the call chain

---

### Task 3.2: Update workspace/service.rs

**File**: `crates/decacan-runtime/src/workspace/service/workspace_service.rs`

**Find usages**:
```bash
grep -n "\.get\|\.put" crates/decacan-runtime/src/workspace/service/workspace_service.rs
```

**Changes**: Add async/.await to all functions using storage

---

### Task 3.3: Update routine/adapter/mod.rs

**File**: `crates/decacan-runtime/src/routine/adapter/mod.rs`

**Contains MockStorage implementation**

**Changes**:
- Add #[async_trait] to MockStorage
- Update all test functions

---

### Task 3.4: Update execution/mod.rs

**File**: `crates/decacan-runtime/src/execution/mod.rs`

**Changes**: Propagate async through executor

---

### Task 3.5: Update run/service.rs

**File**: `crates/decacan-runtime/src/run/service.rs`

**Changes**: Update run service methods

---

### Task 3.6: Update run/test_support.rs

**File**: `crates/decacan-runtime/src/run/test_support.rs`

**Contains MemoryStorageForTest implementation**

**Changes**: Add #[async_trait] and async

---

### Task 3.7: Update playbook/execution.rs

**File**: `crates/decacan-runtime/src/playbook/execution.rs`

**Changes**: Update execution functions

---

## Phase 4: Update Callers in decacan-app

### Task 4.1: Find and update all AppState methods

**File**: `crates/decacan-app/src/app/state.rs`

**Search for**:
```bash
grep -n "storage\|StoragePort" crates/decacan-app/src/app/state.rs
```

**Changes**: Update methods that use storage

---

## Phase 5: Update Tests

### Task 5.1: Update decacan-infra tests

**Files**:
- `crates/decacan-infra/tests/postgres_test.rs`
- `crates/decacan-infra/tests/models_test.rs`

**Changes**: Add .await to all test functions

---

### Task 5.2: Update decacan-runtime tests

**Files**: All test files using StoragePort/ModelPort

**Examples**:
- `crates/decacan-runtime/tests/filesystem_and_storage_integration.rs`
- `crates/decacan-runtime/tests/output_backup_and_artifacts.rs`

**Changes**: 
- Add `#[tokio::test]` attribute
- Add async to test functions
- Add .await to calls

---

## Phase 6: Add Dependencies

### Task 6.1: Add async-trait to decacan-runtime

**File**: `crates/decacan-runtime/Cargo.toml`

**Add**: `async-trait = "0.1"` (already present)

---

### Task 6.2: Add async-trait to decacan-infra

**File**: `crates/decacan-infra/Cargo.toml`

**Add**: `async-trait = "0.1"`

---

## Risk Assessment

### High Risk Areas
1. **Call chain propagation** - Async is viral, may need to make many functions async
2. **Test files** - May miss some test updates
3. **Type constraints** - Generic functions with StoragePort bounds

### Mitigation
1. **Compile early and often** - Check after each file
2. **Use compiler errors** - They'll show all missing .await calls
3. **Test incrementally** - Run tests after each phase

---

## Success Criteria

- [ ] `cargo check -p decacan-runtime` passes
- [ ] `cargo check -p decacan-infra` passes
- [ ] `cargo check -p decacan-auth` passes
- [ ] `cargo test -p decacan-runtime` passes
- [ ] `cargo test -p decacan-infra` passes
- [ ] No warnings about unused async

---

## Rollback Plan

If issues arise:
1. `git stash` or `git reset --hard` to pre-migration state
2. Switch to block_on temporary fix
3. Revisit full async migration later

---

## Execution Order

```
Phase 1 (Traits)
    ↓
Phase 2 (Infra implementations)
    ↓
Phase 3 (Runtime callers) - PARALLEL batches
    ↓
Phase 4 (App callers)
    ↓
Phase 5 (Tests)
    ↓
Phase 6 (Dependencies)
    ↓
Final verification
```

**Parallel opportunities**:
- Tasks 3.1 through 3.7 can be done in parallel (different modules)
- Tasks 5.1 and 5.2 can be done in parallel
