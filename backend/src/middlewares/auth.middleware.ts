import type { Context, Next } from 'hono';
import { verifyJwt, type JwtUserPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export type AppVariables = {
  user: JwtUserPayload;
};

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      errorResponse('Akses ditolak. Token autentikasi tidak ditemukan.'),
      401
    );
  }

  const token = authHeader.substring(7).trim();
  try {
    const payload = await verifyJwt(token);
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json(
      errorResponse('Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.'),
      401
    );
  }
};
