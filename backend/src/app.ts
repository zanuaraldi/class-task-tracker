import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: process.env.FRONTEND_URL!.split(','),
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.get('/health', (c) => c.text('✅ Backend is running!'));

export default app;