import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';

export const errorHandler = (err: Error, c: Context) => {
  console.error('🔥 Error caught by global errorHandler:', err.name, err.message);

  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'body';
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(issue.message);
    }

    return c.json(
      errorResponse('Validasi data input gagal', formattedErrors),
      422
    );
  }

  if (err instanceof HTTPException) {
    return c.json(
      errorResponse(err.message),
      err.status
    );
  }

  return c.json(
    errorResponse('Terjadi kesalahan pada internal server'),
    500
  );
};
