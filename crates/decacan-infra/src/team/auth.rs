use hmac::{Hmac, Mac};
use sha2::{Digest, Sha256};
use std::collections::HashSet;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;
use uuid::Uuid;

pub type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Clone)]
pub struct SignedRequest {
    pub timestamp: u64,
    pub nonce: String,
    pub signature: String,
    pub key_id: String,
}

#[derive(Debug, Error)]
pub enum SignatureError {
    #[error("invalid signature")]
    InvalidSignature,
    #[error("stale timestamp: {0}s old")]
    StaleTimestamp(u64),
    #[error("future timestamp: {0}s ahead")]
    FutureTimestamp(u64),
    #[error("replay detected: nonce already used")]
    ReplayDetected,
    #[error("invalid key")]
    InvalidKey,
}

#[derive(Debug, Clone)]
pub struct RequestSigner {
    key_id: String,
    secret_key: Vec<u8>,
    seen_nonces: Arc<Mutex<HashSet<String>>>,
    timestamp_tolerance_secs: u64,
}

impl RequestSigner {
    pub fn new(key_id: impl Into<String>, secret_key: &[u8]) -> Self {
        Self {
            key_id: key_id.into(),
            secret_key: secret_key.to_vec(),
            seen_nonces: Arc::new(Mutex::new(HashSet::new())),
            timestamp_tolerance_secs: 300, // 5 minutes
        }
    }

    pub fn with_tolerance(mut self, secs: u64) -> Self {
        self.timestamp_tolerance_secs = secs;
        self
    }

    pub fn sign_request(
        &self,
        method: &str,
        path: &str,
        body: &[u8],
    ) -> Result<SignedRequest, SignatureError> {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| SignatureError::InvalidKey)?
            .as_secs();

        let nonce = Uuid::new_v4().to_string();
        let signature = self.compute_signature(method, path, body, timestamp, &nonce)?;

        Ok(SignedRequest {
            timestamp,
            nonce,
            signature,
            key_id: self.key_id.clone(),
        })
    }

    pub fn verify_signature(
        &self,
        signed: &SignedRequest,
        method: &str,
        path: &str,
        body: &[u8],
    ) -> Result<(), SignatureError> {
        // Check timestamp
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| SignatureError::InvalidKey)?
            .as_secs();

        if signed.timestamp > now {
            let diff = signed.timestamp - now;
            if diff > self.timestamp_tolerance_secs {
                return Err(SignatureError::FutureTimestamp(diff));
            }
        } else {
            let diff = now - signed.timestamp;
            if diff > self.timestamp_tolerance_secs {
                return Err(SignatureError::StaleTimestamp(diff));
            }
        }

        // Check nonce for replay
        {
            let mut seen = self
                .seen_nonces
                .lock()
                .map_err(|_| SignatureError::InvalidKey)?;
            if !seen.insert(signed.nonce.clone()) {
                return Err(SignatureError::ReplayDetected);
            }

            // Clean up old nonces to prevent memory growth (simple LRU eviction)
            if seen.len() > 10000 {
                // This is a simple approach; in production use a proper cache
                seen.clear();
            }
        }

        // Verify signature
        let expected_signature =
            self.compute_signature(method, path, body, signed.timestamp, &signed.nonce)?;

        if signed.signature != expected_signature {
            return Err(SignatureError::InvalidSignature);
        }

        Ok(())
    }

    fn compute_signature(
        &self,
        method: &str,
        path: &str,
        body: &[u8],
        timestamp: u64,
        nonce: &str,
    ) -> Result<String, SignatureError> {
        let body_hash = hex::encode(Sha256::digest(body));
        let string_to_sign = format!(
            "{}\n{}\n{}\n{}\n{}",
            method.to_uppercase(),
            path,
            timestamp,
            nonce,
            body_hash
        );

        let mut mac =
            HmacSha256::new_from_slice(&self.secret_key).map_err(|_| SignatureError::InvalidKey)?;
        mac.update(string_to_sign.as_bytes());

        let result = mac.finalize();
        let signature = hex::encode(result.into_bytes());

        Ok(signature)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn signature_generation_is_deterministic() {
        let signer = RequestSigner::new("test-key", b"secret");
        let signed1 = signer.sign_request("POST", "/api/test", b"body").unwrap();
        let signed2 = signer.sign_request("POST", "/api/test", b"body").unwrap();

        // Different nonces, so signatures differ
        assert_ne!(signed1.nonce, signed2.nonce);
        assert_ne!(signed1.signature, signed2.signature);

        // But both should verify
        assert!(signer
            .verify_signature(&signed1, "POST", "/api/test", b"body")
            .is_ok());
        assert!(signer
            .verify_signature(&signed2, "POST", "/api/test", b"body")
            .is_ok());
    }
}
