import { serve } from '@hono/node-server'
import app from './app';
import { Client } from 'pg'
import 'dotenv/config'

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

client.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database successfully'))
  .catch((err) => console.error('❌ Failed to connect to database:', err.message))

const port = 3000
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
console.log(`🚀 Hono server running at http://localhost:${port}`)