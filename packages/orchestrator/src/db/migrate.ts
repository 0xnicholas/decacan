import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './client.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  await migrate(db, { migrationsFolder: join(__dirname, 'migrations') });
  console.log('Migrations complete');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
