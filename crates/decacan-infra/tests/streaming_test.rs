use decacan_infra::models::streaming::StreamChunk;
use futures::stream::{self, StreamExt};

#[tokio::test]
async fn test_stream_chunk_types() {
    let chunks = vec![
        StreamChunk::Content("Hello".to_string()),
        StreamChunk::Content(" ".to_string()),
        StreamChunk::Content("World".to_string()),
        StreamChunk::Done(None),
    ];
    
    let stream = stream::iter(chunks.clone());
    let collected: Vec<_> = stream.collect().await;
    
    assert_eq!(collected.len(), 4);
    assert_eq!(collected[0], StreamChunk::Content("Hello".to_string()));
    assert_eq!(collected[3], StreamChunk::Done(None));
}

#[test]
fn test_stream_chunk_equality() {
    assert_eq!(
        StreamChunk::Content("test".to_string()),
        StreamChunk::Content("test".to_string())
    );
    
    assert_ne!(
        StreamChunk::Content("test".to_string()),
        StreamChunk::Content("other".to_string())
    );
}
