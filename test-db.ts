import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log(`URL: ${url ? 'Found' : 'Missing'}`);
  console.log(`Token: ${authToken ? 'Found' : 'Missing'}`);

  if (!url) {
    console.error('Error: TURSO_DATABASE_URL is missing in .env');
    process.exit(1);
  }

  const client = createClient({
    url,
    authToken,
  });

  try {
    console.log('Attempting to connect to Turso...');
    const result = await client.execute('SELECT 1');
    console.log('Success! Connection established.');
    console.log('Result:', result.rows);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
