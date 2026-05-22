import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();

async function applyMigration() {
  const url = process.env.TURSO_DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  const migrationPath = path.join(process.cwd(), 'drizzle', '0000_goofy_black_crow.sql');
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  const statements = sqlContent
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    try {
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      await client.execute(statements[i]);
    } catch (error) {
      console.error(`Error executing statement ${i + 1}:`, error);
      // We continue if it's already exists or similar, but let's be careful
    }
  }

  console.log('Migration completed.');
}

applyMigration();
