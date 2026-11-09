import { Client } from 'pg';
import 'dotenv/config';

async function initDb() {
  const adminUrl = process.env.DATABASE_URL?.replace(/\/schooltech-test.*$/, '/postgres') 
    || 'postgres://postgres:123456789@localhost:5432/postgres';

  const client = new Client({ connectionString: adminUrl });
  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='schooltech-test'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE "schooltech-test"');
      console.log('✅ Database "schooltech-test" created successfully!');
    } else {
      console.log('ℹ️ Database "schooltech-test" already exists.');
    }
  } catch (err: any) {
    console.error('❌ Error initializing database:', err.message);
  } finally {
    await client.end();
  }
}

initDb();
