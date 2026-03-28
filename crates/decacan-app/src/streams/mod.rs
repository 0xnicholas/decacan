use std::convert::Infallible;

use axum::response::sse::{Event, KeepAlive, Sse};
use tokio::sync::broadcast;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;

use crate::dto::TaskEventDto;

pub fn task_event_sse(
    task_id: String,
    receiver: broadcast::Receiver<TaskEventDto>,
) -> Sse<impl tokio_stream::Stream<Item = Result<Event, Infallible>>> {
    let stream = BroadcastStream::new(receiver).filter_map(move |message| {
        let task_id = task_id.clone();
        match message {
            Ok(event) if event.task_id == task_id => Some(Ok(
                Event::default()
                    .event("task.event")
                    .id(event.id.clone())
                    .json_data(event)
                    .expect("task event should serialize"),
            )),
            _ => None,
        }
    });

    Sse::new(stream).keep_alive(KeepAlive::default())
}
