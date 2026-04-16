import { serve } from '@hono/node-server';
import { createServer } from './api/server.js';

const port = Number(process.env.PORT ?? 3000);
const app = createServer();

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`Orchestrator running at http://localhost:${port}`);
}

export { app, createServer };
