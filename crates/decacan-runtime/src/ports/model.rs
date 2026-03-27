pub trait ModelPort {
    type Error;

    fn complete(&self, prompt: &str) -> Result<String, Self::Error>;
}
