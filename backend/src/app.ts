import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = new Hono();

app.use('*', secureHeaders());
app.use('*', logger());

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  '*',
  cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.onError(errorHandler);

app.get('/health', (c) => c.text('✅ Backend is running!'));

app.route('/', routes);

export default app;
