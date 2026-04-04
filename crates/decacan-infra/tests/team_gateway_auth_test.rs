use decacan_infra::team::auth::{RequestSigner, SignatureError};
use std::time::{SystemTime, UNIX_EPOCH};

fn create_test_signer() -> RequestSigner {
    RequestSigner::new("test-key-id", b"test-secret-key-32bytes-long!!")
}

#[test]
fn valid_signature_verifies_successfully() {
    let signer = create_test_signer();
    let signed = signer
        .sign_request("POST", "/api/team-sessions", b"{}")
        .expect("signing should succeed");

    assert!(signer
        .verify_signature(&signed, "POST", "/api/team-sessions", b"{}")
        .is_ok());
}

#[test]
fn tampered_body_fails_verification() {
    let signer = create_test_signer();
    let signed = signer
        .sign_request("POST", "/api/team-sessions", b"{}")
        .expect("signing should succeed");

    assert!(signer
        .verify_signature(&signed, "POST", "/api/team-sessions", b"tampered")
        .is_err());
}

#[test]
fn stale_timestamp_is_rejected() {
    let signer = create_test_signer();

    // Create a signature with an old timestamp
    let old_timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        - 600; // 10 minutes ago

    let mut signed = signer
        .sign_request("POST", "/api/team-sessions", b"{}")
        .expect("signing should succeed");
    signed.timestamp = old_timestamp;

    // Re-sign with the old timestamp (this simulates a replay)
    let result = signer.verify_signature(&signed, "POST", "/api/team-sessions", b"{}");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("stale"));
}

#[test]
fn future_timestamp_is_rejected() {
    let signer = create_test_signer();

    // Create a signature with a future timestamp
    let future_timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + 600; // 10 minutes in the future

    let mut signed = signer
        .sign_request("POST", "/api/team-sessions", b"{}")
        .expect("signing should succeed");
    signed.timestamp = future_timestamp;

    let result = signer.verify_signature(&signed, "POST", "/api/team-sessions", b"{}");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("future"));
}

#[test]
fn replayed_nonce_is_detected() {
    let signer = create_test_signer();
    let signed = signer
        .sign_request("POST", "/api/team-sessions", b"{}")
        .expect("signing should succeed");

    // First verification should succeed
    assert!(signer
        .verify_signature(&signed, "POST", "/api/team-sessions", b"{}")
        .is_ok());

    // Second verification with same nonce should fail (replay)
    let result = signer.verify_signature(&signed, "POST", "/api/team-sessions", b"{}");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("replay"));
}

#[test]
fn different_methods_produce_different_signatures() {
    let signer = create_test_signer();
    let post_signed = signer
        .sign_request("POST", "/api/team-sessions", b"{}")
        .expect("signing should succeed");
    let get_signed = signer
        .sign_request("GET", "/api/team-sessions", b"{}")
        .expect("signing should succeed");

    // POST signature should not verify as GET
    assert!(signer
        .verify_signature(&post_signed, "GET", "/api/team-sessions", b"{}")
        .is_err());
}

#[test]
fn different_paths_produce_different_signatures() {
    let signer = create_test_signer();
    let sessions_signed = signer
        .sign_request("POST", "/api/team-sessions", b"{}")
        .expect("signing should succeed");
    let actions_signed = signer
        .sign_request("POST", "/api/team-actions", b"{}")
        .expect("signing should succeed");

    // sessions signature should not verify for actions path
    assert!(signer
        .verify_signature(&sessions_signed, "POST", "/api/team-actions", b"{}")
        .is_err());
}
