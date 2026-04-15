/// Protocol version for the Decacan Agent Contract.
///
/// Breaking changes to the event schema or request shapes must bump this version.
/// The remote engine is expected to report its supported protocol version during
/// the initial handshake, and Decacan may refuse to connect if versions are incompatible.
pub const PROTOCOL_VERSION: &str = "1.0";

/// Checks whether a remote protocol version is compatible with the local contract.
///
/// Current policy: major version must match "1.x".
pub fn is_compatible(remote_version: &str) -> bool {
    remote_version.starts_with("1.")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn compatible_versions() {
        assert!(is_compatible("1.0"));
        assert!(is_compatible("1.1"));
        assert!(is_compatible("1.0.0-beta"));
        assert!(!is_compatible("2.0"));
        assert!(!is_compatible("0.9"));
    }
}
