use decacan_runtime::ports::clock::ClockPort;
use time::OffsetDateTime;

#[derive(Debug, Clone, Default)]
pub struct SystemClock;

impl SystemClock {
    pub fn new() -> Self {
        Self
    }
}

impl ClockPort for SystemClock {
    fn now_utc(&self) -> OffsetDateTime {
        OffsetDateTime::now_utc()
    }
}
