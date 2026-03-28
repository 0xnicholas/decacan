use time::OffsetDateTime;

pub trait ClockPort {
    fn now_utc(&self) -> OffsetDateTime;
}
