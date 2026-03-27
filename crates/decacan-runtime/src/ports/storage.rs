pub trait StoragePort {
    type Error;

    fn put(&self, key: &str, value: &str) -> Result<(), Self::Error>;
    fn get(&self, key: &str) -> Result<Option<String>, Self::Error>;
}
